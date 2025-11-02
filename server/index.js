const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { generateCatanBoard, getHouseTileData, getRoadSpotData } = require('./gameData');
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
let setupPhase = 'forward'; // 'forward' or 'backward'
let gameBoard = null;
let placedHouses = {}; // Track which house indices are already occupied with house data
let placedRoads = {}; // Track which road indices are already occupied with road data

// Generate board data
app.get('/api/board', (req, res) => {
  if (!gameBoard) {
    const boardData = generateCatanBoard();
    const houseData = getHouseTileData();
    const roadData = getRoadSpotData();

    gameBoard = {
      resourceTiles: boardData.resourceTiles,
      resourceTokens: boardData.resourceTokens,
      houseData: houseData,
      roadData: roadData
    };
  }

  res.json(gameBoard);
});

// Get all placed houses
app.get('/api/houses', (req, res) => {
  res.json(placedHouses);
});

// Get all placed roads
app.get('/api/roads', (req, res) => {
  res.json(placedRoads);
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
        wood: 10,
        brick: 10,
        sheep: 10,
        wheat: 10,
        ore: 10
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
    console.log(`📢 Broadcasting current turn: ${currentUserId} (Setup phase: ${setupPhase})`);
    io.emit('currentTurn', currentUserId);
  }
}

// Helper function to distribute resources based on dice roll
function distributeResources(diceTotal) {
  if (!gameBoard) return;

  const { resourceTiles, resourceTokens } = gameBoard;
  
  // Find all tiles that match the dice roll
  resourceTokens.forEach((token, tileIndex) => {
    if (token === diceTotal) {
      const resourceType = resourceTiles[tileIndex];
      
      // Skip desert tiles
      if (resourceType === 'Desert') return;

      console.log(`🎲 Tile ${tileIndex} (${resourceType}) matches roll ${diceTotal}`);

      // Find all houses adjacent to this tile
      Object.entries(placedHouses).forEach(([houseIndex, houseData]) => {
        const house = houseData;
        const houseTileData = gameBoard.houseData[parseInt(houseIndex)];
        
        // Check if this house is adjacent to the matching tile
        if (houseTileData.tiles.includes(tileIndex)) {
          const player = playerData.findPlayer(house.userId);
          if (player) {
            // Give the player the resource
            const resourceKey = resourceType.toLowerCase();
            player.resources[resourceKey] = (player.resources[resourceKey] || 0) + 1;
            playerData.updatePlayer(player.userId, { resources: player.resources });
            
            console.log(`✅ ${player.name} received 1 ${resourceType} (house at ${houseIndex})`);
          }
        }
      });
    }
  });

  // Broadcast updated player data
  io.emit('playersUpdated', playerData.getPlayers());
}

// Helper function to give resources for a house placement (used for second setup house)
function giveResourcesForHouse(houseIndex, userId) {
  if (!gameBoard) return;

  const houseTileData = gameBoard.houseData[houseIndex];
  const player = playerData.findPlayer(userId);
  
  if (!player || !houseTileData) return;

  console.log(`🏠 Giving initial resources for house ${houseIndex} to ${player.name}`);

  // For each tile adjacent to this house
  houseTileData.tiles.forEach(tileIndex => {
    const resourceType = gameBoard.resourceTiles[tileIndex];
    
    // Skip desert tiles
    if (resourceType === 'Desert') return;

    // Give the player one of this resource
    const resourceKey = resourceType.toLowerCase();
    player.resources[resourceKey] = (player.resources[resourceKey] || 0) + 1;
    
    console.log(`  ✅ ${player.name} received 1 ${resourceType} from tile ${tileIndex}`);
  });

  // Update player data
  playerData.updatePlayer(userId, { resources: player.resources });
  
  // Broadcast updated player data
  io.emit('playersUpdated', playerData.getPlayers());
}

// Helper function to deduct resources when building a house
function deductHouseResources(userId) {
  const player = playerData.findPlayer(userId);
  
  if (!player || !player.resources) return false;
  
  // Check if player has enough resources
  if (player.resources.wood < 1 || player.resources.wheat < 1 || 
      player.resources.brick < 1 || player.resources.sheep < 1) {
    console.log(`❌ ${player.name} doesn't have enough resources to build a house`);
    return false;
  }
  
  // Deduct the resources
  player.resources.wood -= 1;
  player.resources.wheat -= 1;
  player.resources.brick -= 1;
  player.resources.sheep -= 1;
  
  // Update player data
  playerData.updatePlayer(userId, { 
    resources: player.resources,
    score: player.score + 1  // Each house is worth 1 point
  });
  
  console.log(`💰 ${player.name} paid: 1 Wood, 1 Wheat, 1 Brick, 1 Sheep`);
  
  return true;
}

// Helper function to deduct resources when building a road
function deductRoadResources(userId) {
  const player = playerData.findPlayer(userId);
  
  if (!player || !player.resources) return false;
  
  // Check if player has enough resources
  if (player.resources.wood < 1 || player.resources.brick < 1) {
    console.log(`❌ ${player.name} doesn't have enough resources to build a road`);
    return false;
  }
  
  // Deduct the resources
  player.resources.wood -= 1;
  player.resources.brick -= 1;
  
  // Update player data
  playerData.updatePlayer(userId, { 
    resources: player.resources
  });
  
  console.log(`💰 ${player.name} paid: 1 Wood, 1 Brick`);
  
  return true;
}

// Helper function to check if setup phase is complete
function isSetupPhaseComplete() {
  const players = playerData.getPlayers();
  const totalHouses = Object.keys(placedHouses).length;
  const totalRoads = Object.keys(placedRoads).length;
  const requiredHouses = players.length * 2;
  const requiredRoads = players.length * 2;
  
  return totalHouses >= requiredHouses && totalRoads >= requiredRoads;
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

  // Handle house selection (setup phase)
  socket.on('houseSelected', (data) => {
    const { userId, houseIndex, position } = data;
    const player = playerData.findPlayer(userId);

    if (!player) {
      console.log(`❌ Player not found: ${userId}`);
      return;
    }

    // Check if house is already occupied
    if (placedHouses[houseIndex]) {
      console.log(`⚠️ House ${houseIndex} already occupied!`);
      socket.emit('houseSelectionFailed', { reason: 'House already occupied' });
      return;
    }

    // Store house data
    placedHouses[houseIndex] = {
      userId,
      playerName: player.name,
      playerColor: player.color,
      houseIndex,
      position,
      placedAt: new Date()
    };

    // Add house to player
    player.houses.push({
      houseIndex,
      position,
      placedAt: new Date()
    });

    playerData.updatePlayer(userId, { houses: player.houses });

    console.log(`🏠 ${player.name} placed a house at index ${houseIndex}`);

    // Check if this is the player's second house (during backward setup phase)
    const playerHouseCount = player.houses.length;
    if (playerHouseCount === 2 && setupPhase === 'backward') {
      console.log(`🎁 Second house placement - giving initial resources!`);
      giveResourcesForHouse(houseIndex, userId);
    }

    // Broadcast to all clients
    io.emit('housePlaced', {
      userId,
      playerName: player.name,
      playerColor: player.color,
      houseIndex,
      position
    });
  });
  
  // Handle building a house (playing phase)
  socket.on('buildHouse', (data) => {
    const { userId, houseIndex, position } = data;
    const player = playerData.findPlayer(userId);

    if (!player) {
      console.log(`❌ Player not found: ${userId}`);
      return;
    }

    // Check if it's this player's turn
    if (userId !== getCurrentPlayerUserId()) {
      console.log(`❌ Not ${player.name}'s turn!`);
      return;
    }

    // Check if house is already occupied
    if (placedHouses[houseIndex]) {
      console.log(`⚠️ House ${houseIndex} already occupied!`);
      socket.emit('houseSelectionFailed', { reason: 'House already occupied' });
      return;
    }

    // Deduct resources and check if player has enough
    if (!deductHouseResources(userId)) {
      socket.emit('houseSelectionFailed', { reason: 'Not enough resources' });
      return;
    }

    // Store house data
    placedHouses[houseIndex] = {
      userId,
      playerName: player.name,
      playerColor: player.color,
      houseIndex,
      position,
      placedAt: new Date()
    };

    // Add house to player
    player.houses.push({
      houseIndex,
      position,
      placedAt: new Date()
    });

    playerData.updatePlayer(userId, { houses: player.houses });

    console.log(`🏗️ ${player.name} built a house at index ${houseIndex}`);

    // Broadcast to all clients
    io.emit('housePlaced', {
      userId,
      playerName: player.name,
      playerColor: player.color,
      houseIndex,
      position
    });

    // Broadcast updated player data (resources and score)
    io.emit('playersUpdated', playerData.getPlayers());
  });
  
  // Handle road selection
  socket.on('roadSelected', (data) => {
    const { userId, roadIndex, position } = data;
    const player = playerData.findPlayer(userId);

    if (!player) {
      console.log(`❌ Player not found: ${userId}`);
      return;
    }

    // Check if road is already occupied
    if (placedRoads[roadIndex]) {
      console.log(`⚠️ Road ${roadIndex} already occupied!`);
      socket.emit('roadSelectionFailed', { reason: 'Road already occupied' });
      return;
    }

    // Store road data
    placedRoads[roadIndex] = {
      userId,
      playerName: player.name,
      playerColor: player.color,
      roadIndex,
      position,
      placedAt: new Date()
    };

    // Add road to player
    player.roads.push({
      roadIndex,
      position,
      placedAt: new Date()
    });

    playerData.updatePlayer(userId, { roads: player.roads });

    console.log(`🛣️ ${player.name} placed a road at index ${roadIndex}`);

    // Broadcast to all clients
    io.emit('roadPlaced', {
      userId,
      playerName: player.name,
      playerColor: player.color,
      roadIndex,
      position
    });
  });

  // Handle dice roll
  socket.on('rollDice', (data) => {
    const { userId } = data;
    const player = playerData.findPlayer(userId);

    if (!player) {
      console.log(`❌ Player not found: ${userId}`);
      return;
    }

    // Check if it's this player's turn
    if (userId !== getCurrentPlayerUserId()) {
      console.log(`❌ Not ${player.name}'s turn!`);
      return;
    }

    // Roll two dice
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;

    console.log(`🎲 ${player.name} rolled: ${die1} + ${die2} = ${total}`);

    // Distribute resources based on the roll
    distributeResources(total);

    // Broadcast dice roll to all clients
    io.emit('diceRolled', {
      userId,
      playerName: player.name,
      die1,
      die2,
      total
    });
  });

  // On endTurn from client
  socket.on('endTurn', () => {
    const players = playerData.getPlayers();
    if (players.length === 0) return;

    // Check if we're still in setup phase
    if (!isSetupPhaseComplete()) {
      // Setup phase turn logic
      if (setupPhase === 'forward') {
        // Going forward through players
        if (currentTurnIndex < players.length - 1) {
          currentTurnIndex++;
        } else {
          // Reached the end, switch to backward phase
          setupPhase = 'backward';
          console.log('🔄 Setup phase switching to BACKWARD');
          // Don't increment, stay on last player for their second turn
        }
      } else {
        // Going backward through players
        if (currentTurnIndex > 0) {
          currentTurnIndex--;
        } else {
          // Setup complete, would normally transition to playing phase
          console.log('✅ Setup phase complete!');
        }
      }
    } else {
      // Normal playing phase - cycle through players
      currentTurnIndex = (currentTurnIndex + 1) % players.length;
    }

    const nextPlayer = players[currentTurnIndex];
    console.log(`🔁 Turn passed to: ${nextPlayer.name} (${nextPlayer.userId})`);

    // Broadcast to all clients
    broadcastCurrentTurn();
  });

  socket.on('startGameClicked', () => {
    const players = playerData.getPlayers();
    if (players.length === 0) return;

    currentTurnIndex = 0;
    setupPhase = 'forward'; // Reset setup phase
    placedHouses = {}; // Reset placed houses
    placedRoads = {}; // Reset placed roads

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