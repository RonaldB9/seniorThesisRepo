const express = require('express');
const http = require('http'); // ⬅️ Needed for Socket.IO
const cors = require('cors');
const { Server } = require('socket.io');
const { generateCatanBoard, getHouseTileData } = require('./gameData');

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

// In-memory player list
let players = [];

// Generate board data
app.get('/api/board', (req, res) => {
  const boardData = generateCatanBoard();
  const houseData = getHouseTileData();
  res.json({
    resourceTiles: boardData.resourceTiles,
    resourceTokens: boardData.resourceTokens,
    houseData: houseData
  });
});

// Register new player
app.post('/api/register', (req, res) => {
  const { userId } = req.body;

  let existing = players.find(p => p.userId === userId);
  if (!existing) {
    const newPlayer = {
      userId,
      name: `Player ${players.length + 1}`,
      ready: false
    };
    players.push(newPlayer);
    existing = newPlayer;
    console.log(`Registered new player: ${newPlayer.name}`);
    io.emit('playersUpdated', players); // ⬅️ Notify all clients
  }

  res.json(existing);
});

// Toggle ready status
app.post('/api/players/:userId/ready', (req, res) => {
  const { userId } = req.params;
  const player = players.find(p => p.userId === userId);

  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }

  player.ready = !player.ready; // ⬅️ Toggle status

  // Emit updated players list to all clients
  io.emit('playersUpdated', players);

  res.json(player);
});

// Socket connection
io.on('connection', (socket) => {
  console.log('🔌 New WebSocket connection');

  socket.emit('playersUpdated', players);

  socket.on('startGameClicked', () => {
    console.log('🔔 startGameClicked received, broadcasting startGame');
    io.emit('startGame');
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Get all players (for initial load or fallback)
app.get('/api/players', (req, res) => {
  res.json(players);
});

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('🔌 New WebSocket connection');

  // Send current player list on connect
  socket.emit('playersUpdated', players);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
    // Optionally handle cleanup here
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
