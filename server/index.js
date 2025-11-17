const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { generateCatanBoard, getHouseTileData, getRoadSpotData, getPortRoadData, createDevelopmentCardDeck} = require('./gameData');
const playerData = require('./playerData');
const { handleRoadSelected, handleBuildRoad } = require('./roadFunctions');
const { handleHouseSelected, handleBuildHouse, handleBuildCity } = require('./buildingFunctions');
const { 
    handleMoveRobber, handleStealResource, handleBuyDevelopmentCard, handlePlayKnight, 
    handlePlayYearOfPlenty, handlePlayMonopoly, handlePlayRoadBuilding, handlePlayVictoryPoint} = require('./DevelopmentCards');

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
let placedCities = {}; // Track which houses have been upgraded to cities
let developmentCardDeck = [];
let largestArmyPlayer = null; // Track who has largest army
let robberTileIndex = null; // Track robber position

// Generate board data
app.get('/api/board', (req, res) => {
  if (!gameBoard) {
    const boardData = generateCatanBoard();
    const houseData = getHouseTileData();
    const roadData = getRoadSpotData();
    const portRoadData = getPortRoadData();

    // Initialize robber on desert tile
    robberTileIndex = boardData.resourceTiles.findIndex(tile => tile === 'Desert');

    gameBoard = {
      resourceTiles: boardData.resourceTiles,
      resourceTokens: boardData.resourceTokens,
      houseData: houseData,
      roadData: roadData,
      portRoadData: portRoadData
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

// Get all placed cities
app.get('/api/cities', (req, res) => {
  res.json(placedCities);
});

// Get robber position
app.get('/api/robber', (req, res) => {
  res.json({ tileIndex: robberTileIndex });
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
        wood: 100,
        brick: 100,
        sheep: 100,
        wheat: 100,
        ore: 100
      },
      developmentCards: {
        knight: 0,
        victoryPoint: 0,
        roadBuilding: 0,
        yearOfPlenty: 0,
        monopoly: 0
      },
      playedKnights: 0,
      revealedVictoryPoints: 0,
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

// Helper function to reset all player stats to default
function resetAllPlayerStats() {
  const players = playerData.getPlayers();
  
  players.forEach(player => {
    playerData.updatePlayer(player.userId, {
      ready: false,
      score: 0,
      resources: {
        wood: 100,
        brick: 100,
        sheep: 100,
        wheat: 100,
        ore: 100
      },
      developmentCards: {
        knight: 0,
        victoryPoint: 0,
        roadBuilding: 0,
        yearOfPlenty: 0,
        monopoly: 0
      },
      playedKnights: 0,
      revealedVictoryPoints: 0,
      houses: [],
      cities: [],
      roads: []
    });
  });
  
  console.log('♻️ All player stats reset to default');
}

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
    // Skip if robber is on this tile
    if (tileIndex === robberTileIndex) {
      console.log(`⛔ Robber blocking tile ${tileIndex}`);
      return;
    }

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
            // Check if this house is a city (produces 2 resources) or settlement (1 resource)
            const isCity = placedCities[houseIndex];
            const resourceAmount = isCity ? 2 : 1;
            
            // Give the player the resource
            const resourceKey = resourceType.toLowerCase();
            player.resources[resourceKey] = (player.resources[resourceKey] || 0) + resourceAmount;
            playerData.updatePlayer(player.userId, { resources: player.resources });
            
            console.log(`✅ ${player.name} received ${resourceAmount} ${resourceType} (${isCity ? 'city' : 'settlement'} at ${houseIndex})`);
          }
        }
      });
    }
  });

  // Broadcast updated player data
  io.emit('playersUpdated', playerData.getPlayers());
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

  const currentUserId = getCurrentPlayerUserId();
  if (currentUserId) {
    console.log(`📤 Sending current turn to ${socket.id}: ${currentUserId}`);
    socket.emit('currentTurn', currentUserId);
  }

  socket.emit('playersUpdated', playerData.getPlayers());

  // Handle request for current turn
  socket.on('requestCurrentTurn', (callback) => {
    const currentUserId = getCurrentPlayerUserId();
    socket.emit('currentTurn', currentUserId);
    if (callback) callback({ currentUserId });
  });

  // Handle house selection (setup phase)
  socket.on('houseSelected', (data) => {
    const result = handleHouseSelected(data, placedHouses, setupPhase, gameBoard, io);
    if (!result.success) {
      socket.emit('houseSelectionFailed', { reason: result.error });
    }
  });
  
  // Handle building a house (playing phase)
  socket.on('buildHouse', (data) => {
    const result = handleBuildHouse(data, placedHouses, getCurrentPlayerUserId, io);
    if (!result.success) {
      socket.emit('houseSelectionFailed', { reason: result.error });
    }
  });

  // Play Year of Plenty card handler
  socket.on('playYearOfPlenty', (data) => {
      handlePlayYearOfPlenty(data, getCurrentPlayerUserId, io, socket);
  });

  // Play Monopoly card handler
  socket.on('playMonopoly', (data) => {
      handlePlayMonopoly(data, getCurrentPlayerUserId, io, socket);
  });

  // Play Road Building card handler
  socket.on('playRoadBuilding', (data) => {
      handlePlayRoadBuilding(data, getCurrentPlayerUserId, io, socket);
  });

  // Build free road (from Road Building card)
  socket.on('buildFreeRoad', (data) => {
      const { userId, roadIndex, position } = data;
      const player = playerData.findPlayer(userId);

      if (!player) {
          console.log(`❌ Player not found: ${userId}`);
          return;
      }

      if (userId !== getCurrentPlayerUserId()) {
          console.log(`❌ Not ${player.name}'s turn!`);
          return;
      }

      if (placedRoads[roadIndex]) {
          console.log(`⚠️ Road ${roadIndex} already occupied!`);
          return;
      }

      // No resource deduction for free roads
      placedRoads[roadIndex] = {
          userId,
          playerName: player.name,
          playerColor: player.color,
          roadIndex,
          position,
          placedAt: new Date()
      };

      player.roads.push({
          roadIndex,
          position,
          placedAt: new Date()
      });

      playerData.updatePlayer(userId, { roads: player.roads });

      console.log(`🛣️ ${player.name} built a FREE road at index ${roadIndex}`);

      io.emit('roadPlaced', {
          userId,
          playerName: player.name,
          playerColor: player.color,
          roadIndex,
          position
      });

      io.emit('playersUpdated', playerData.getPlayers());
  });

  // Handle discard cards
  socket.on('discardCards', (data) => {
    const { userId, cards } = data;
    const player = playerData.findPlayer(userId);

    if (!player) {
      console.log(`❌ Player not found: ${userId}`);
      return;
    }

    // Validate the discard
    const totalDiscarding = Object.values(cards).reduce((sum, count) => sum + count, 0);
    const totalCards = Object.values(player.resources).reduce((sum, count) => sum + count, 0);
    const shouldDiscard = Math.floor(totalCards / 2);

    if (totalDiscarding !== shouldDiscard) {
      console.log(`❌ ${player.name} tried to discard ${totalDiscarding} but should discard ${shouldDiscard}`);
      socket.emit('discardFailed', { reason: 'Incorrect number of cards' });
      return;
    }

    // Validate player has the cards
    for (const [resource, count] of Object.entries(cards)) {
      if (player.resources[resource] < count) {
        console.log(`❌ ${player.name} doesn't have enough ${resource} to discard`);
        socket.emit('discardFailed', { reason: 'Not enough resources' });
        return;
      }
    }

    // Deduct the cards
    for (const [resource, count] of Object.entries(cards)) {
      player.resources[resource] -= count;
    }

    playerData.updatePlayer(userId, { resources: player.resources });

    console.log(`✅ ${player.name} discarded ${totalDiscarding} cards`);

    // Notify player that discard is complete
    socket.emit('discardComplete', { userId });
    
    // Update all players
    io.emit('playersUpdated', playerData.getPlayers());
  });

  // Handle building a city (playing phase)
  socket.on('buildCity', (data) => {
    const result = handleBuildCity(data, placedHouses, placedCities, getCurrentPlayerUserId, io);
    if (!result.success) {
      socket.emit('cityBuildFailed', { reason: result.error });
    }
  });

  // Handle building a road (playing phase)
  socket.on('buildRoad', (data) => {
    const result = handleBuildRoad(data, placedRoads, getCurrentPlayerUserId, io);
    if (!result.success) {
      socket.emit('roadSelectionFailed', { reason: result.error });
    }
  });
  
  // Handle road selection (setup phase)
  socket.on('roadSelected', (data) => {
    const result = handleRoadSelected(data, placedRoads, io);
    if (!result.success) {
      socket.emit('roadSelectionFailed', { reason: result.error });
    }
  });

  // Handle dice roll
  socket.on('rollDice', (data) => {
    const { userId } = data;
    const player = playerData.findPlayer(userId);

    if (!player) {
      console.log(`❌ Player not found: ${userId}`);
      return;
    }

    if (userId !== getCurrentPlayerUserId()) {
      console.log(`❌ Not ${player.name}'s turn!`);
      return;
    }

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;

    console.log(`🎲 ${player.name} rolled: ${die1} + ${die2} = ${total}`);

    if (total === 7) {
      // Check if players need to discard (more than 7 cards)
      const players = playerData.getPlayers();
      players.forEach(p => {
        const totalCards = Object.values(p.resources).reduce((sum, count) => sum + count, 0);
        if (totalCards > 7) {
          const cardsToDiscard = Math.floor(totalCards / 2);
          socket.emit('discardRequired', {
            userId: p.userId,
            cardsToDiscard
          });
        }
      });
    } else {
      distributeResources(total);
    }

    io.emit('diceRolled', {
      userId,
      playerName: player.name,
      die1,
      die2,
      total
    });
  });

  // Handle moving the robber
  socket.on('moveRobber', (data) => {
    const result = handleMoveRobber(data, getCurrentPlayerUserId, placedHouses, gameBoard, io);
    if (result.success) {
      robberTileIndex = result.robberTileIndex;
    }
  });

  // Handle stealing a resource
  socket.on('stealResource', (data) => {
    handleStealResource(data, io);
  });

  // On endTurn from client
  socket.on('endTurn', () => {
    const players = playerData.getPlayers();
    if (players.length === 0) return;

    if (!isSetupPhaseComplete()) {
      if (setupPhase === 'forward') {
        if (currentTurnIndex < players.length - 1) {
          currentTurnIndex++;
        } else {
          setupPhase = 'backward';
          console.log('🔄 Setup phase switching to BACKWARD');
        }
      } else {
        if (currentTurnIndex > 0) {
          currentTurnIndex--;
        } else {
          console.log('✅ Setup phase complete!');
        }
      }
    } else {
      currentTurnIndex = (currentTurnIndex + 1) % players.length;
    }

    const nextPlayer = players[currentTurnIndex];
    console.log(`🔁 Turn passed to: ${nextPlayer.name} (${nextPlayer.userId})`);

    broadcastCurrentTurn();
  });

  socket.on('startGameClicked', () => {
    const players = playerData.getPlayers();
    if (players.length === 0) return;

    // Reset game state
    currentTurnIndex = 0;
    setupPhase = 'forward';
    placedHouses = {};
    placedRoads = {};
    placedCities = {};
    developmentCardDeck = createDevelopmentCardDeck();
    largestArmyPlayer = null;
    
    // Reset robber to desert
    if (gameBoard) {
      robberTileIndex = gameBoard.resourceTiles.findIndex(tile => tile === 'Desert');
    }

    // RESET ALL PLAYER STATS
    resetAllPlayerStats();

    const firstPlayer = players[0];
    console.log(`🚀 Game started, first turn: ${firstPlayer.name} (${firstPlayer.userId})`);
    
    io.emit('startGame');
    io.emit('playersUpdated', playerData.getPlayers()); // Send updated stats to clients
    broadcastCurrentTurn();
  });

  // Buy development card handler
  socket.on('buyDevelopmentCard', (data) => {
    const result = handleBuyDevelopmentCard(data, getCurrentPlayerUserId, developmentCardDeck, io, socket);
    if (result.success) {
      developmentCardDeck = result.deck;
    }
  });

  // Play knight card handler
  socket.on('playKnight', (data) => {
    const result = handlePlayKnight(data, getCurrentPlayerUserId, largestArmyPlayer, io, socket);
    if (result.success) {
      largestArmyPlayer = result.largestArmyPlayer;
    }
  });

  // Play victory point card handler
  socket.on('playVictoryPoint', (data) => {
    handlePlayVictoryPoint(data, getCurrentPlayerUserId, io);
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