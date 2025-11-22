// server/tradingFunctions.js - FIXED PORT MAPPING

// Map which houses grant access to which ports
const PORT_HOUSE_MAP = {
  // 3:1 Ports - accessible from multiple house pairs
  '3:1_1': [1, 5],        // Top middle 3:1 port
  '3:1_2': [10, 15],        // Top right 3:1 port
  '3:1_3': [49,52],      // Bottom middle 3:1 port
  '3:1_4': [33,38],      // Left middle 3:1 port
  
  // 2:1 Ports - specific resources
  'brick_2:1': [0, 3],    // Top left brick port
  'sheep_2:1': [26, 32],  // Middle right sheep port
  'ore_2:1': [11, 16],    // Left ore port
  'wood_2:1': [47, 51],   // Bottom left wood port
  'wheat_2:1': [42, 46]   // Bottom right wheat port
};

// Get available ports for a player based on their settlements
function getPlayerPorts(userId, gameBoard, placedHouses, placedCities) {
  if (!gameBoard || !gameBoard.houseData) return [];
  
  const playerPorts = [];
  const foundPorts = new Set(); // Avoid duplicates
  
  // Get all house indices where this player has settlements
  const playerHouseIndices = new Set();
  Object.entries(placedHouses).forEach(([houseIndex, house]) => {
    if (house.userId === userId) {
      playerHouseIndices.add(parseInt(houseIndex));
    }
  });
  
  // Check each port to see if player owns a house at one of its locations
  Object.entries(PORT_HOUSE_MAP).forEach(([portKey, houseIndices]) => {
    // If player owns any house in this port's house list
    const hasPort = houseIndices.some(houseIdx => 
      playerHouseIndices.has(houseIdx)
    );
    
    if (hasPort && !foundPorts.has(portKey)) {
      foundPorts.add(portKey);
      
      // Parse port key to determine type and resource
      if (portKey.includes('3:1')) {
        playerPorts.push({ type: '3:1', resources: ['any'] });
      } else {
        const resourceMatch = portKey.match(/^(\w+)_2:1$/);
        if (resourceMatch) {
          const resource = resourceMatch[1];
          playerPorts.push({ type: '2:1', resources: [resource] });
        }
      }
    }
  });
  
  return playerPorts;
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
  createTradeProposal,
  PORT_HOUSE_MAP  // Export for reference/testing
};