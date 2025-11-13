// server/roadFunctions.js
// All road-related functions

const playerData = require('./playerData');

// Helper function to deduct resources when building a road
function deductRoadResources(userId) {
  const player = playerData.findPlayer(userId);
  
  if (!player || !player.resources) return false;
  
  if (player.resources.wood < 1 || player.resources.brick < 1) {
    console.log(`❌ ${player.name} doesn't have enough resources to build a road`);
    return false;
  }
  
  player.resources.wood -= 1;
  player.resources.brick -= 1;
  
  playerData.updatePlayer(userId, { resources: player.resources });
  
  console.log(`💰 ${player.name} paid: 1 Wood, 1 Brick`);
  return true;
}

// Handle road selection (setup phase)
function handleRoadSelected(data, placedRoads, io) {
  const { userId, roadIndex, position } = data;
  const player = playerData.findPlayer(userId);

  if (!player) {
    console.log(`❌ Player not found: ${userId}`);
    return { success: false, error: 'Player not found' };
  }

  if (placedRoads[roadIndex]) {
    console.log(`⚠️ Road ${roadIndex} already occupied!`);
    return { success: false, error: 'Road already occupied' };
  }

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

  console.log(`🛣️ ${player.name} placed a road at index ${roadIndex}`);

  io.emit('roadPlaced', {
    userId,
    playerName: player.name,
    playerColor: player.color,
    roadIndex,
    position
  });

  return { success: true };
}

// Handle building a road (playing phase)
function handleBuildRoad(data, placedRoads, getCurrentPlayerUserId, io) {
  const { userId, roadIndex, position } = data;
  const player = playerData.findPlayer(userId);

  if (!player) {
    console.log(`❌ Player not found: ${userId}`);
    return { success: false, error: 'Player not found' };
  }

  if (userId !== getCurrentPlayerUserId()) {
    console.log(`❌ Not ${player.name}'s turn!`);
    return { success: false, error: 'Not your turn' };
  }

  if (placedRoads[roadIndex]) {
    console.log(`⚠️ Road ${roadIndex} already occupied!`);
    return { success: false, error: 'Road already occupied' };
  }

  if (!deductRoadResources(userId)) {
    return { success: false, error: 'Not enough resources' };
  }

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

  console.log(`🏗️ ${player.name} built a road at index ${roadIndex}`);

  io.emit('roadPlaced', {
    userId,
    playerName: player.name,
    playerColor: player.color,
    roadIndex,
    position
  });

  io.emit('playersUpdated', playerData.getPlayers());

  return { success: true };
}

module.exports = {
  deductRoadResources,
  handleRoadSelected,
  handleBuildRoad
};