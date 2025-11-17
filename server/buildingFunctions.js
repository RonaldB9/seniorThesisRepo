//All house and city building functions

const playerData = require('./playerData');
const { checkForWin } = require('./DevelopmentCards');

//Deduct resources when building a house
function deductHouseResources(userId) {
  const player = playerData.findPlayer(userId);
  
  if (!player || !player.resources) return false;
  
  if (player.resources.wood < 1 || player.resources.wheat < 1 || 
      player.resources.brick < 1 || player.resources.sheep < 1) {
    console.log(`❌ ${player.name} doesn't have enough resources to build a house`);
    return false;
  }
  
  player.resources.wood -= 1;
  player.resources.wheat -= 1;
  player.resources.brick -= 1;
  player.resources.sheep -= 1;
  
  playerData.updatePlayer(userId, { 
    resources: player.resources,
    score: player.score + 1
  });
  
  console.log(`💰 ${player.name} paid: 1 Wood, 1 Wheat, 1 Brick, 1 Sheep`);
  return true;
}

//Deduct resources when building a city
function deductCityResources(userId) {
  const player = playerData.findPlayer(userId);
  
  if (!player || !player.resources) return false;
  
  if (player.resources.ore < 3 || player.resources.wheat < 2) {
    console.log(`❌ ${player.name} doesn't have enough resources to build a city`);
    return false;
  }
  
  player.resources.ore -= 3;
  player.resources.wheat -= 2;
  
  playerData.updatePlayer(userId, { 
    resources: player.resources,
    score: player.score + 1
  });
  
  console.log(`💰 ${player.name} paid: 3 Ore, 2 Wheat`);
  return true;
}

//Give resources for a house placement (used for second setup house)
function giveResourcesForHouse(houseIndex, userId, gameBoard, io) {
  if (!gameBoard) return;

  const houseTileData = gameBoard.houseData[houseIndex];
  const player = playerData.findPlayer(userId);
  
  if (!player || !houseTileData) return;

  console.log(`🏠 Giving initial resources for house ${houseIndex} to ${player.name}`);

  //For each tile adjacent to this house
  houseTileData.tiles.forEach(tileIndex => {
    const resourceType = gameBoard.resourceTiles[tileIndex];
    
    //Skip desert tiles
    if (resourceType === 'Desert') return;

    //Give the player one of this resource
    const resourceKey = resourceType.toLowerCase();
    player.resources[resourceKey] = (player.resources[resourceKey] || 0) + 1;
    
    console.log(`  ✅ ${player.name} received 1 ${resourceType} from tile ${tileIndex}`);
  });

  //Update player data
  playerData.updatePlayer(userId, { resources: player.resources });
  io.emit('playersUpdated', playerData.getPlayers());
}

//Handle house selection (setup phase)
function handleHouseSelected(data, placedHouses, setupPhase, gameBoard, io) {
  const { userId, houseIndex, position } = data;
  const player = playerData.findPlayer(userId);

  if (!player) {
    console.log(`❌ Player not found: ${userId}`);
    return { success: false, error: 'Player not found' };
  }

  if (placedHouses[houseIndex]) {
    console.log(`⚠️ House ${houseIndex} already occupied!`);
    return { success: false, error: 'House already occupied' };
  }

  placedHouses[houseIndex] = {
    userId,
    playerName: player.name,
    playerColor: player.color,
    houseIndex,
    position,
    placedAt: new Date()
  };

  player.houses.push({
    houseIndex,
    position,
    placedAt: new Date()
  });

  //Add 1 point for settlement (setup phase)
  player.score += 1;

  playerData.updatePlayer(userId, { 
    houses: player.houses,
    score: player.score
  });

  console.log(`🏠 ${player.name} placed a house at index ${houseIndex} (Score: ${player.score})`);

  const playerHouseCount = player.houses.length;
  if (playerHouseCount === 2 && setupPhase === 'backward') {
    console.log(`🎁 Second house placement - giving initial resources!`);
    giveResourcesForHouse(houseIndex, userId, gameBoard, io);
  }

  io.emit('housePlaced', {
    userId,
    playerName: player.name,
    playerColor: player.color,
    houseIndex,
    position
  });

  io.emit('playersUpdated', playerData.getPlayers());

  return { success: true };
}

//Handle building a house (playing phase)
function handleBuildHouse(data, placedHouses, getCurrentPlayerUserId, io) {
  const { userId, houseIndex, position } = data;
  const player = playerData.findPlayer(userId);

  if (!player) {
    console.log(`❌ Player not found: ${userId}`);
    return { success: false, error: 'Player not found' };
  }

  if (userId !== getCurrentPlayerUserId()) {
    console.log(`❌ Not ${player.name}'s turn!`);
    return { success: false, error: 'Not your turn' };
  }

  if (placedHouses[houseIndex]) {
    console.log(`⚠️ House ${houseIndex} already occupied!`);
    return { success: false, error: 'House already occupied' };
  }

  if (!deductHouseResources(userId)) {
    return { success: false, error: 'Not enough resources' };
  }

  placedHouses[houseIndex] = {
    userId,
    playerName: player.name,
    playerColor: player.color,
    houseIndex,
    position,
    placedAt: new Date()
  };

  player.houses.push({
    houseIndex,
    position,
    placedAt: new Date()
  });

  playerData.updatePlayer(userId, { houses: player.houses });

  console.log(`🏗️ ${player.name} built a house at index ${houseIndex} (Score: ${player.score})`);

  io.emit('housePlaced', {
    userId,
    playerName: player.name,
    playerColor: player.color,
    houseIndex,
    position
  });

  io.emit('playersUpdated', playerData.getPlayers());

  //Check for win after building house
  const updatedPlayer = playerData.findPlayer(userId);
  checkForWin(updatedPlayer, io);

  return { success: true };
}

//Handle building a city (playing phase)
function handleBuildCity(data, placedHouses, placedCities, getCurrentPlayerUserId, io) {
  const { userId, houseIndex, position } = data;
  const player = playerData.findPlayer(userId);

  if (!player) {
    console.log(`❌ Player not found: ${userId}`);
    return { success: false, error: 'Player not found' };
  }

  if (userId !== getCurrentPlayerUserId()) {
    console.log(`❌ Not ${player.name}'s turn!`);
    return { success: false, error: 'Not your turn' };
  }

  const house = placedHouses[houseIndex];
  if (!house || house.userId !== userId) {
    console.log(`⚠️ Invalid house for city upgrade at ${houseIndex}!`);
    return { success: false, error: 'Invalid settlement for upgrade' };
  }

  if (placedCities[houseIndex]) {
    console.log(`⚠️ House ${houseIndex} is already a city!`);
    return { success: false, error: 'Already a city' };
  }

  if (!deductCityResources(userId)) {
    return { success: false, error: 'Not enough resources' };
  }

  placedCities[houseIndex] = {
    userId,
    playerName: player.name,
    playerColor: player.color,
    houseIndex,
    position,
    upgradedAt: new Date()
  };

  player.cities.push({
    houseIndex,
    position,
    upgradedAt: new Date()
  });

  playerData.updatePlayer(userId, { cities: player.cities });

  console.log(`🏛️ ${player.name} upgraded house ${houseIndex} to a city (Score: ${player.score})`);

  io.emit('cityPlaced', {
    userId,
    playerName: player.name,
    playerColor: player.color,
    houseIndex,
    position
  });

  io.emit('playersUpdated', playerData.getPlayers());

  //Check for win after building city
  const updatedPlayer = playerData.findPlayer(userId);
  checkForWin(updatedPlayer, io);

  return { success: true };
}

module.exports = {
  deductHouseResources,
  deductCityResources,
  giveResourcesForHouse,
  handleHouseSelected,
  handleBuildHouse,
  handleBuildCity
};