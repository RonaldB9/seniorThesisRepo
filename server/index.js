const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { generateCatanBoard, getHouseTileData } = require('./gameData');
const playerData = require('./playerData');

// Clear all players on server startup
const { writePlayers } = require('./playerData');
writePlayers([]);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = 3001;

app.use(cors());
app.use(express.json());

// In-memory
let currentTurnIndex = 0;
let gameBoard = null;

// Generate board data
app.get('/api/board', (req, res) => {
  if (!gameBoard) {
    const boardData = generateCatanBoard();
    const houseData = getHouseTileData();

    gameBoard = {
      resourceTiles: boardData.resourceTiles,
      resourceTokens: boardData.resourceTokens,
      houseData: houseData
    };
  }

  res.json(gameBoard);
});

// Register new player
app.post('/api/register', (req, res) => {
  const { userId } = req.body;
  const colors = ['red', 'green', 'blue', 'yellow', 'orange'];
  const playerNumber = playerData.getPlayers().length;
  const assignedColor = colors[playerNumber % colors.length];

  let existing = playerData.findPlayer(userId);
  if (!existing) {
    const newPlayer = {
      userId,
      name: `Player ${playerData.getPlayers().length + 1}`,
      ready: false,
      score: 0,
      color: assignedColor,
      resources: {
        wood: 0,
        brick: 0,
        sheep: 0,
        wheat: 0,
        ore: 0
      },
      houses: [],
      cities: [],
      roads: []
    };
    playerData.addPlayer(newPlayer);
    existing = newPlayer;
    console.log(`Registered new player: ${newPlayer.name}`);
  }

  io.emit('playersUpdated', playerData.getPlayers());

  res.json(existing);
});

// Toggle ready status
app.post('/api/players/:userId/ready', (req, res) => {
  const { userId } = req.params;
  const player = playerData.findPlayer(userId);

  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }

  const updatedPlayer = playerData.updatePlayer(userId, { ready: !player.ready });

  io.emit('playersUpdated', playerData.getPlayers());
  res.json(updatedPlayer);
});

// Helper function to get current player userId
function getCurrentPlayerUserId() {
  const players = playerData.getPlayers();
  if (players.length === 0) return null;
  return players[currentTurnIndex]?.userId || null;
}

// Broadcast current turn to all connected clients
function broadcastCurrentTurn() {
  const currentUserId = getCurrentPlayerUserId();
  if (currentUserId) {
    console.log(`📢 Broadcasting current turn: ${currentUserId}`);
    io.emit('currentTurn', currentUserId);
  }
}

// Socket connection
io.on('connection', (socket) => {
  console.log('🔌 New WebSocket connection:', socket.id);

  // Send current turn to this specific client
  const currentUserId = getCurrentPlayerUserId();
  if (currentUserId) {
    console.log(`📤 Sending current turn to ${socket.id}: ${currentUserId}`);
    socket.emit('currentTurn', currentUserId);
  }

  socket.emit('playersUpdated', playerData.getPlayers());

  // Handle request for current turn
  socket.on('requestCurrentTurn', (callback) => {
    const currentUserId = getCurrentPlayerUserId();
    console.log(`📬 Client ${socket.id} requested current turn: ${currentUserId}`);
    socket.emit('currentTurn', currentUserId);
    if (callback) callback({ currentUserId });
  });

  // On endTurn from client
  socket.on('endTurn', () => {
    const players = playerData.getPlayers();
    if (players.length === 0) return;

    // Move to the next player
    currentTurnIndex = (currentTurnIndex + 1) % players.length;

    const nextPlayer = players[currentTurnIndex];
    console.log(`🔁 Turn passed to: ${nextPlayer.name} (${nextPlayer.userId})`);

    // Broadcast to all clients
    broadcastCurrentTurn();
  });

  socket.on('startGameClicked', () => {
    const players = playerData.getPlayers();
    if (players.length === 0) return;

    currentTurnIndex = 0;

    const firstPlayer = players[0];
    console.log(`🚀 Game started, first turn: ${firstPlayer.name} (${firstPlayer.userId})`);
    io.emit('startGame');
    broadcastCurrentTurn();
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Get all players
app.get('/api/players', (req, res) => {
  res.json(playerData.getPlayers());
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});