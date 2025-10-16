const express = require('express');
const http = require('http'); // ⬅️ Needed for Socket.IO
const cors = require('cors');
const { Server } = require('socket.io');
const { generateCatanBoard, getHouseTileData } = require('./gameData');
const playerData = require('./playerData');

// Clear all players on server startup
const { writePlayers } = require('./playerData');
writePlayers([]); // wipes the players.json file

const app = express();
const server = http.createServer(app); // ⬅️ Create HTTP server manually
const io = new Server(server, {
  cors: {
    origin: '*', // or specify: 'http://localhost:3000'
    methods: ['GET', 'POST']
  }
});

const PORT = 3001;

app.use(cors());
app.use(express.json()); // For parsing POST bodies

// In-memory
let currentTurnIndex = 0; // Index of the player whose turn it is
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
  const colors = ['red', 'green', 'blue', 'yellow', 'orange']; // Add more if needed
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

  io.emit('playersUpdated', playerData.getPlayers()); // notify all clients

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

  // Emit updated players list to all clients
  io.emit('playersUpdated', playerData.getPlayers());
  res.json(updatedPlayer);
});

// Socket connection
io.on('connection', (socket) => {
  console.log('🔌 New WebSocket connection');

  socket.emit('playersUpdated', playerData.getPlayers());

  // On endTurn from client
  socket.on('endTurn', () => {
    const players = playerData.getPlayers();
    if (players.length === 0) return;

    // Move to the next player
    currentTurnIndex = (currentTurnIndex + 1) % players.length;

    const nextPlayer = players[currentTurnIndex];
    console.log(`🔁 Turn passed to: ${nextPlayer.name} (${nextPlayer.userId})`);

    io.emit('currentTurn', nextPlayer.userId); // Inform all clients whose turn it is
  });

  socket.on('startGameClicked', () => {
    const players = playerData.getPlayers();
    if (players.length === 0) return;

    // Reset to the first player
    currentTurnIndex = 0;

    const firstPlayer = players[0];
    console.log(`🚀 Game started, first turn: ${firstPlayer.name} (${firstPlayer.userId})`);
    io.emit('startGame'); // Let frontend know game has started
    io.emit('currentTurn', firstPlayer.userId); // Let everyone know whose turn it is
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Get all players (for initial load or fallback)
app.get('/api/players', (req, res) => {
  res.json(playerData.getPlayers());
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
