// server/index.js - Updated for 6 players with board randomization
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
const { getPlayerPorts, executeTrade, executePortTrade, createTradeProposal } = require('./tradingFunctions');
//Clear all players on server startup
const { writePlayers } = require('./playerData');
const { updateLongestRoad } = require('./longestRoad');
writePlayers([]);
const userSocketMap = new Map();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type']
  }
});

app.use(cors());
app.use(express.json());

//In-memory
let longestRoadPlayer = null;
let currentTurnIndex = 0;
let setupPhase = 'forward'; //'forward' or 'backward'
let gameBoard = null;
let placedHouses = {}; //Track which house indices are already occupied with house data
let placedRoads = {}; //Track which road indices are already occupied with road data
let placedCities = {}; //Track which houses have been upgraded to cities
let developmentCardDeck = [];
let largestArmyPlayer = null; //Track who has largest army
let robberTileIndex = null; //Track robber position

//Generate board data - now only returns if board exists, doesn't create it
app.get('/api/board', (req, res) => {
  if (!gameBoard) {
    // Generate initial board if it doesn't exist
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

//Get all placed houses
app.get('/api/houses', (req, res) => {
  res.json(placedHouses);
});

//Get all placed roads
app.get('/api/roads', (req, res) => {
  res.json(placedRoads);
});

app.get('/api/longest-road', (req, res) => {
  res.json({ currentHolder: longestRoadPlayer });
});

//Get all placed cities
app.get('/api/cities', (req, res) => {
  res.json(placedCities);
});

//Get robber position
app.get('/api/robber', (req, res) => {
  res.json({ tileIndex: robberTileIndex });
});

//Get largest army holder
app.get('/api/largest-army', (req, res) => {
  res.json({ currentHolder: largestArmyPlayer });
});

//Register new player
app.post('/api/register', (req, res) => {
  const { userId } = req.body;
  // Updated to support 6 players with pink as 6th color
  const colors = ['red', 'green', 'blue', 'orange', 'purple', 'pink'];
  const playerNumber = playerData.getPlayers().length;
  
  // Limit to 6 players maximum
  if (playerNumber >= 6) {
    return res.status(400).json({ error: 'Maximum 6 players allowed' });
  }
  
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
    console.log(`Registered new player: ${newPlayer.name} (${newPlayer.color})`);
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
        wood: 20,
        brick: 20,
        sheep: 20,
        wheat: 20,
        ore: 20
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

//Toggle ready status
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

//Get current player userId
function getCurrentPlayerUserId() {
  const players = playerData.getPlayers();
  if (players.length === 0) return null;
  return players[currentTurnIndex]?.userId || null;
}

//Broadcast current turn to all connected clients
function broadcastCurrentTurn() {
  const currentUserId = getCurrentPlayerUserId();
  if (currentUserId) {
    console.log(`📢 Broadcasting current turn: ${currentUserId} (Setup phase: ${setupPhase})`);
    io.emit('currentTurn', currentUserId);
  }
}

//Distribute resources based on dice roll
function distributeResources(diceTotal) {
  if (!gameBoard) return;

  const { resourceTiles, resourceTokens } = gameBoard;
  
  //Find all tiles that match the dice roll
  resourceTokens.forEach((token, tileIndex) => {
    //Skip if robber is on this tile
    if (tileIndex === robberTileIndex) {
      console.log(`⛔ Robber blocking tile ${tileIndex}`);
      return;
    }

    if (token === diceTotal) {
      const resourceType = resourceTiles[tileIndex];
      
      //Skip desert tiles
      if (resourceType === 'Desert') return;

      console.log(`🎲 Tile ${tileIndex} (${resourceType}) matches roll ${diceTotal}`);

      //Find all houses adjacent to this tile
      Object.entries(placedHouses).forEach(([houseIndex, houseData]) => {
        const house = houseData;
        const houseTileData = gameBoard.houseData[parseInt(houseIndex)];
        
        //Check if this house is adjacent to the matching tile
        if (houseTileData.tiles.includes(tileIndex)) {
          const player = playerData.findPlayer(house.userId);
          if (player) {
            //Check if this house is a city (produces 2 resources) or settlement (1 resource)
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

  // Store the socket connection for this user
  socket.on('identify', (data) => {
    const { userId } = data;
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);
    console.log(`✅ User ${userId} connected with socket ${socket.id}`);
  });

  // Clean up when user disconnects
  socket.on('disconnect', () => {
    for (const [userId, sockets] of userSocketMap.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSocketMap.delete(userId);
        }
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });

  const currentUserId = getCurrentPlayerUserId();
  if (currentUserId) {
    console.log(`📤 Sending current turn to ${socket.id}: ${currentUserId}`);
    socket.emit('currentTurn', currentUserId);
  }

  socket.emit('playersUpdated', playerData.getPlayers());

  //Handle request for current turn
  socket.on('requestCurrentTurn', (callback) => {
    const currentUserId = getCurrentPlayerUserId();
    socket.emit('currentTurn', currentUserId);
    if (callback) callback({ currentUserId });
  });

  // Handle player trade proposal
  socket.on('proposeTrade', (data) => {
    const { userId, responderId, offering, requesting } = data;
    const initiator = playerData.findPlayer(userId);
    const responder = playerData.findPlayer(responderId);
    
    console.log(`💱 Trade proposal from ${initiator?.name} to ${responder?.name}`);
    console.log(`   Offering: ${JSON.stringify(offering)}`);
    console.log(`   Requesting: ${JSON.stringify(requesting)}`);

    if (!initiator || !responder) {
      console.log(`❌ Trade proposal failed: Player not found`);
      socket.emit('tradeFailed', { reason: 'Player not found' });
      return;
    }

    const proposal = {
      id: Date.now().toString(),
      initiatorId: userId,
      initiatorName: initiator.name,
      responderId: responderId,
      offering: offering,
      requesting: requesting,
      status: 'pending',
      createdAt: new Date()
    };

    console.log(`📤 Sending trade proposal to ${responder.name} (${responderId})`);
    
    // Get the responder's socket IDs
    const responderSockets = userSocketMap.get(responderId);
    
    if (responderSockets && responderSockets.size > 0) {
      console.log(`✅ Found ${responderSockets.size} socket(s) for responder`);
      responderSockets.forEach(socketId => {
        io.to(socketId).emit('tradeProposal', proposal);
      });
    } else {
      console.log(`⚠️ Responder not connected, broadcasting to all instead`);
      // Fallback: broadcast to everyone
      io.emit('tradeProposal', proposal);
    }
  });

  // Handle accepting a trade
  socket.on('acceptTrade', (data) => {
    const { proposalId, initiatorId, responderId, offering, requesting } = data;
    
    const result = executeTrade({
      initiatorId,
      responderId,
      offering,
      requesting
    }, io);
    
    if (result.success) {
      socket.emit('tradeAccepted', { proposalId });
    } else {
      socket.emit('tradeFailed', { reason: result.error });
    }
  });

  // Handle declining a trade
  socket.on('declineTrade', (data) => {
    const { proposalId, initiatorId } = data;
    io.to(initiatorId).emit('tradeDeclined', { proposalId });
    console.log(`❌ Trade proposal declined`);
  });

  // Handle port trade
  socket.on('executePortTrade', (data) => {
    const { userId } = data;
    const player = playerData.findPlayer(userId);
    
    if (player && userId === getCurrentPlayerUserId()) {
      // Get player's ports
      const playerPorts = getPlayerPorts(userId, gameBoard, placedHouses, placedCities);
      const result = executePortTrade(data, playerPorts, io);
      
      if (result.success) {
        socket.emit('portTradeSuccess', {});
      } else {
        socket.emit('portTradeFailed', { reason: result.error });
      }
    }
  });

  // Get player ports info (for UI)
  socket.on('getPlayerPorts', (data) => {
    const { userId } = data;
    const ports = getPlayerPorts(userId, gameBoard, placedHouses, placedCities);
    socket.emit('playerPorts', { ports });
  });

  //Handle house selection (setup phase)
  socket.on('houseSelected', (data) => {
    const result = handleHouseSelected(data, placedHouses, setupPhase, gameBoard, io);
    if (!result.success) {
      socket.emit('houseSelectionFailed', { reason: result.error });
    }
  });
  
  //Handle building a house (playing phase)
  socket.on('buildHouse', (data) => {
    const result = handleBuildHouse(data, placedHouses, getCurrentPlayerUserId, io);
    if (!result.success) {
      socket.emit('houseSelectionFailed', { reason: result.error });
    }
  });

  //Play Year of Plenty card handler
  socket.on('playYearOfPlenty', (data) => {
      handlePlayYearOfPlenty(data, getCurrentPlayerUserId, io, socket);
  });

  //Play Monopoly card handler
  socket.on('playMonopoly', (data) => {
      handlePlayMonopoly(data, getCurrentPlayerUserId, io, socket);
  });

  //Play Road Building card handler
  socket.on('playRoadBuilding', (data) => {
      handlePlayRoadBuilding(data, getCurrentPlayerUserId, io, socket);
  });

  // Clean up when user disconnects
  socket.on('disconnect', () => {
    for (const [userId, sockets] of userSocketMap.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSocketMap.delete(userId);
          
          // Remove player from the player list
          const players = playerData.getPlayers();
          const updatedPlayers = players.filter(p => p.userId !== userId);
          playerData.writePlayers(updatedPlayers);
          
          console.log(`❌ User ${userId} disconnected and removed from player list`);
          
          // Broadcast updated player list
          io.emit('playersUpdated', playerData.getPlayers());
        }
        break;
      }
    }
  });

  //Build free road (from Road Building card)
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

      //No resource deduction for free roads
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

      const players = playerData.getPlayers();
      longestRoadPlayer = updateLongestRoad(
        players,
        placedRoads,
        placedHouses,
        gameBoard.roadData,
        longestRoadPlayer,
        io
      );

      io.emit('playersUpdated', playerData.getPlayers());
  });

  //Handle discard cards
  socket.on('discardCards', (data) => {
    const { userId, cards } = data;
    const player = playerData.findPlayer(userId);

    if (!player) {
      console.log(`❌ Player not found: ${userId}`);
      return;
    }

    //Validate the discard
    const totalDiscarding = Object.values(cards).reduce((sum, count) => sum + count, 0);
    const totalCards = Object.values(player.resources).reduce((sum, count) => sum + count, 0);
    const shouldDiscard = Math.floor(totalCards / 2);

    if (totalDiscarding !== shouldDiscard) {
      console.log(`❌ ${player.name} tried to discard ${totalDiscarding} but should discard ${shouldDiscard}`);
      socket.emit('discardFailed', { reason: 'Incorrect number of cards' });
      return;
    }

    //Validate player has the cards
    for (const [resource, count] of Object.entries(cards)) {
      if (player.resources[resource] < count) {
        console.log(`❌ ${player.name} doesn't have enough ${resource} to discard`);
        socket.emit('discardFailed', { reason: 'Not enough resources' });
        return;
      }
    }

    //Deduct the cards
    for (const [resource, count] of Object.entries(cards)) {
      player.resources[resource] -= count;
    }

    playerData.updatePlayer(userId, { resources: player.resources });

    console.log(`✅ ${player.name} discarded ${totalDiscarding} cards`);

    //Notify player that discard is complete
    socket.emit('discardComplete', { userId });
    
    //Update all players
    io.emit('playersUpdated', playerData.getPlayers());
  });

  //Handle building a city (playing phase)
  socket.on('buildCity', (data) => {
    const result = handleBuildCity(data, placedHouses, placedCities, getCurrentPlayerUserId, io);
    if (!result.success) {
      socket.emit('cityBuildFailed', { reason: result.error });
    }
  });

  //Handle building a road (playing phase)
  socket.on('buildRoad', (data) => {
    const result = handleBuildRoad(data, placedRoads, getCurrentPlayerUserId, io);
    if (!result.success) {
      socket.emit('roadSelectionFailed', { reason: result.error });
    } 
    else {
      //Update longest road after road is built
      const players = playerData.getPlayers();
      longestRoadPlayer = updateLongestRoad(
        players,
        placedRoads,
        placedHouses,
        gameBoard.roadData,
        longestRoadPlayer,
        io
      );
      io.emit('playersUpdated', playerData.getPlayers());
    }
  });
  
  //Handle road selection (setup phase)
  socket.on('roadSelected', (data) => {
    const result = handleRoadSelected(data, placedRoads, io);
    if (!result.success) {
      socket.emit('roadSelectionFailed', { reason: result.error });
    }
    else {
      //Update longest road after setup road is placed
      const players = playerData.getPlayers();
      longestRoadPlayer = updateLongestRoad(
        players,
        placedRoads,
        placedHouses,
        gameBoard.roadData,
        longestRoadPlayer,
        io
      );
    }
  });

  //Handle dice roll
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
      //Check if players need to discard (more than 7 cards)
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

  //Handle moving the robber
  socket.on('moveRobber', (data) => {
    const result = handleMoveRobber(data, getCurrentPlayerUserId, placedHouses, gameBoard, io);
    if (result.success) {
      robberTileIndex = result.robberTileIndex;
    }
  });

  //Handle stealing a resource
  socket.on('stealResource', (data) => {
    handleStealResource(data, io);
  });

  //On endTurn from client
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

    //Reset game state
    currentTurnIndex = 0;
    setupPhase = 'forward';
    placedHouses = {};
    placedRoads = {};
    placedCities = {};
    developmentCardDeck = createDevelopmentCardDeck();
    largestArmyPlayer = null;
    longestRoadPlayer = null;
    
    // 🎲 GENERATE NEW BOARD - This is the key change!
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

    console.log('🎲 New board generated!');
    console.log('Resource Tiles:', boardData.resourceTiles);
    console.log('Resource Tokens:', boardData.resourceTokens);

    // RESET ALL PLAYER STATS
    resetAllPlayerStats();

    const firstPlayer = players[0];
    console.log(`🚀 Game started, first turn: ${firstPlayer.name} (${firstPlayer.userId})`);
    
    // Broadcast new board to all clients
    io.emit('boardUpdated', gameBoard);
    io.emit('startGame');
    io.emit('playersUpdated', playerData.getPlayers());
    io.emit('largestArmyUpdate', { currentHolder: null, holderName: null });
    io.emit('longestRoadUpdate', { 
      currentHolder: null, 
      holderName: null,
      roadLengths: {}
    });
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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});