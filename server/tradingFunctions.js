// server/tradingFunctions.js
const playerData = require('./playerData');

// Get available ports for a player based on their settlements
function getPlayerPorts(userId, gameBoard, placedHouses, placedCities) {
  if (!gameBoard || !gameBoard.houseData) return [];
  
  const playerPorts = new Set();
  const portMapping = {
    // 3:1 ports (general)
    3: { type: '3:1', resources: ['any'] },
    // 2:1 ports (specific)
    1: { type: '2:1', resources: ['brick'] },
    5: { type: '2:1', resources: ['sheep'] },
    6: { type: '2:1', resources: ['ore'] },
    7: { type: '2:1', resources: ['wood'] },
    9: { type: '2:1', resources: ['wheat'] }
  };

  // Check each placed house/city for port access
  Object.entries(placedHouses).forEach(([houseIndex, house]) => {
    if (house.userId === userId) {
      const houseTileData = gameBoard.houseData[parseInt(houseIndex)];
      if (houseTileData && houseTileData.tiles) {
        // Check which port(s) this house connects to
        houseTileData.tiles.forEach(tileIndex => {
          if (portMapping[tileIndex]) {
            playerPorts.add(tileIndex);
          }
        });
      }
    }
  });

  return Array.from(playerPorts).map(portIndex => portMapping[portIndex]);
}

// Validate a player can make a trade (has resources)
function validateTradeResources(player, offering) {
  if (!player || !player.resources) return false;
  
  for (const [resource, amount] of Object.entries(offering)) {
    if (!player.resources[resource] || player.resources[resource] < amount) {
      return false;
    }
  }
  return true;
}

// Execute a player-to-player trade
function executeTrade(tradeData, io) {
  const { initiatorId, responderId, offering, requesting } = tradeData;
  
  const initiator = playerData.findPlayer(initiatorId);
  const responder = playerData.findPlayer(responderId);

  if (!initiator || !responder) {
    console.log('❌ Trade failed: Player not found');
    return { success: false, error: 'Player not found' };
  }

  // Validate both players have the resources
  if (!validateTradeResources(initiator, offering)) {
    console.log(`❌ ${initiator.name} doesn't have resources to offer`);
    return { success: false, error: 'Insufficient resources to offer' };
  }

  if (!validateTradeResources(responder, requesting)) {
    console.log(`❌ ${responder.name} doesn't have requested resources`);
    return { success: false, error: 'Responder lacks requested resources' };
  }

  // Deduct from initiator
  for (const [resource, amount] of Object.entries(offering)) {
    initiator.resources[resource] -= amount;
  }

  // Deduct from responder
  for (const [resource, amount] of Object.entries(requesting)) {
    responder.resources[resource] -= amount;
  }

  // Give to initiator
  for (const [resource, amount] of Object.entries(requesting)) {
    initiator.resources[resource] = (initiator.resources[resource] || 0) + amount;
  }

  // Give to responder
  for (const [resource, amount] of Object.entries(offering)) {
    responder.resources[resource] = (responder.resources[resource] || 0) + amount;
  }

  playerData.updatePlayer(initiatorId, { resources: initiator.resources });
  playerData.updatePlayer(responderId, { resources: responder.resources });

  console.log(`✅ Trade completed between ${initiator.name} and ${responder.name}`);
  console.log(`   ${initiator.name} gave: ${JSON.stringify(offering)}`);
  console.log(`   ${initiator.name} received: ${JSON.stringify(requesting)}`);

  io.emit('playersUpdated', playerData.getPlayers());
  io.emit('tradeCompleted', {
    initiatorName: initiator.name,
    responderName: responder.name,
    offering,
    requesting
  });

  return { success: true };
}

// Execute a port trade (bank trade)
function executePortTrade(tradeData, playerPorts, io) {
  const { userId, offering, requesting } = tradeData;
  const player = playerData.findPlayer(userId);

  if (!player) {
    console.log('❌ Port trade failed: Player not found');
    return { success: false, error: 'Player not found' };
  }

  // Determine the trade rate
  const offeredResource = Object.keys(offering)[0];
  const offeredAmount = offering[offeredResource];
  const requestedResource = Object.keys(requesting)[0];
  const requestedAmount = requesting[requestedResource];

  // Check if player has the resources
  if (!player.resources[offeredResource] || player.resources[offeredResource] < offeredAmount) {
    console.log(`❌ ${player.name} doesn't have ${offeredAmount} ${offeredResource}`);
    return { success: false, error: 'Insufficient resources' };
  }

  // Determine valid trade rates based on ports
  let validTrade = false;
  
  // 4:1 with no port (always allowed)
  if (offeredAmount === 4 && requestedAmount === 1) {
    validTrade = true;
  }
  
  // 3:1 with generic port
  if (offeredAmount === 3 && requestedAmount === 1) {
    const hasGenericPort = playerPorts.some(port => port.type === '3:1');
    if (hasGenericPort) {
      validTrade = true;
    }
  }
  
  // 2:1 with specific port
  if (offeredAmount === 2 && requestedAmount === 1) {
    const hasSpecificPort = playerPorts.some(
      port => port.type === '2:1' && port.resources.includes(offeredResource)
    );
    if (hasSpecificPort) {
      validTrade = true;
    }
  }

  if (!validTrade) {
    console.log(`❌ Invalid trade rate: ${offeredAmount} ${offeredResource} for ${requestedAmount} ${requestedResource}`);
    return { success: false, error: 'Invalid trade rate for your ports' };
  }

  // Execute the trade
  player.resources[offeredResource] -= offeredAmount;
  player.resources[requestedResource] = (player.resources[requestedResource] || 0) + requestedAmount;

  playerData.updatePlayer(userId, { resources: player.resources });

  console.log(`🏦 ${player.name} traded ${offeredAmount} ${offeredResource} for ${requestedAmount} ${requestedResource}`);

  io.emit('playersUpdated', playerData.getPlayers());
  io.emit('portTradeCompleted', {
    playerName: player.name,
    offering,
    requesting
  });

  return { success: true };
}

// Create a trade proposal
function createTradeProposal(tradeData) {
  return {
    id: Date.now().toString(),
    initiatorId: tradeData.initiatorId,
    initiatorName: tradeData.initiatorName,
    responderId: tradeData.responderId,
    offering: tradeData.offering,
    requesting: tradeData.requesting,
    status: 'pending',
    createdAt: new Date()
  };
}

module.exports = {
  getPlayerPorts,
  validateTradeResources,
  executeTrade,
  executePortTrade,
  createTradeProposal
};