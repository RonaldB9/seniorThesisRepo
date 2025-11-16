// server/DevelopmentCards.js
// All development card and robber-related functions

const playerData = require('./playerData');

// Helper function to get players with settlements adjacent to a tile
function getPlayersAdjacentToTile(tileIndex, placedHouses, gameBoard) {
  if (!gameBoard) return [];
  
  const adjacentPlayers = new Set();
  
  // Check all placed houses
  Object.entries(placedHouses).forEach(([houseIndex, house]) => {
    const houseTileData = gameBoard.houseData[parseInt(houseIndex)];
    
    // If this house is adjacent to the tile
    if (houseTileData.tiles.includes(tileIndex)) {
      const player = playerData.findPlayer(house.userId);
      if (player) {
        const totalCards = Object.values(player.resources).reduce((sum, count) => sum + count, 0);
        if (totalCards > 0) {
          adjacentPlayers.add(JSON.stringify({
            userId: player.userId,
            name: player.name,
            color: player.color,
            totalCards
          }));
        }
      }
    }
  });
  
  return Array.from(adjacentPlayers).map(p => JSON.parse(p));
}

// Helper function to steal a random resource from a player
function stealRandomResource(thiefUserId, victimUserId) {
  const victim = playerData.findPlayer(victimUserId);
  const thief = playerData.findPlayer(thiefUserId);
  
  if (!victim || !thief) return null;
  
  // Get all available resources from victim
  const availableResources = [];
  Object.entries(victim.resources).forEach(([resource, count]) => {
    for (let i = 0; i < count; i++) {
      availableResources.push(resource);
    }
  });
  
  if (availableResources.length === 0) return null;
  
  // Pick a random resource
  const randomIndex = Math.floor(Math.random() * availableResources.length);
  const stolenResource = availableResources[randomIndex];
  
  // Transfer the resource
  victim.resources[stolenResource] -= 1;
  thief.resources[stolenResource] = (thief.resources[stolenResource] || 0) + 1;
  
  playerData.updatePlayer(victimUserId, { resources: victim.resources });
  playerData.updatePlayer(thiefUserId, { resources: thief.resources });
  
  console.log(`🦹 ${thief.name} stole ${stolenResource} from ${victim.name}`);
  
  return {
    resource: stolenResource,
    thiefName: thief.name,
    victimName: victim.name
  };
}

// Handle moving the robber
function handleMoveRobber(data, getCurrentPlayerUserId, placedHouses, gameBoard, io) {
  const { userId, tileIndex } = data;
  const player = playerData.findPlayer(userId);

  if (!player) {
    console.log(`❌ Player not found: ${userId}`);
    return { success: false, error: 'Player not found', robberTileIndex: null };
  }

  if (userId !== getCurrentPlayerUserId()) {
    console.log(`❌ Not ${player.name}'s turn!`);
    return { success: false, error: 'Not your turn', robberTileIndex: null };
  }

  console.log(`🦹 ${player.name} moved robber to tile ${tileIndex}`);

  // Find players adjacent to this tile who can be stolen from
  const playersToStealFrom = getPlayersAdjacentToTile(tileIndex, placedHouses, gameBoard).filter(p => p.userId !== userId);

  io.emit('robberMoved', {
    userId,
    tileIndex,
    playersToStealFrom
  });

  return { success: true, robberTileIndex: tileIndex };
}

// Handle stealing a resource
function handleStealResource(data, io) {
  const { thiefUserId, victimUserId } = data;
  
  const result = stealRandomResource(thiefUserId, victimUserId);
  
  if (result) {
    io.emit('resourceStolen', {
      thief: thiefUserId,
      thiefName: result.thiefName,
      fromUserId: victimUserId,
      fromName: result.victimName,
      resource: result.resource
    });
    
    io.emit('playersUpdated', playerData.getPlayers());
    return { success: true };
  }

  return { success: false };
}

// Handle buying a development card
function handleBuyDevelopmentCard(data, getCurrentPlayerUserId, developmentCardDeck, io, socket) {
  const { userId } = data;
  const player = playerData.findPlayer(userId);

  if (!player || userId !== getCurrentPlayerUserId()) {
    return { success: false, error: 'Not authorized', deck: developmentCardDeck };
  }

  if (developmentCardDeck.length === 0) {
    console.log(`⚠️ Development card deck is empty!`);
    socket.emit('buyCardFailed', { reason: 'Deck is empty' });
    return { success: false, error: 'Deck is empty', deck: developmentCardDeck };
  }

  if (!player.resources || player.resources.ore < 1 || 
      player.resources.sheep < 1 || player.resources.wheat < 1) {
    console.log(`❌ ${player.name} doesn't have enough resources for a development card`);
    socket.emit('buyCardFailed', { reason: 'Not enough resources' });
    return { success: false, error: 'Not enough resources', deck: developmentCardDeck };
  }

  player.resources.ore -= 1;
  player.resources.sheep -= 1;
  player.resources.wheat -= 1;

  const drawnCard = developmentCardDeck.pop();
  player.developmentCards[drawnCard] = (player.developmentCards[drawnCard] || 0) + 1;

  playerData.updatePlayer(userId, { 
    resources: player.resources,
    developmentCards: player.developmentCards
  });

  console.log(`🃏 ${player.name} bought a ${drawnCard} card (${developmentCardDeck.length} cards remaining)`);

  socket.emit('cardBought', { cardType: drawnCard });
  io.emit('playersUpdated', playerData.getPlayers());
  io.emit('deckUpdate', { cardsRemaining: developmentCardDeck.length });

  return { success: true, deck: developmentCardDeck };
}

// Handle playing a knight card
function handlePlayKnight(data, getCurrentPlayerUserId, largestArmyPlayer, io, socket) {
  const { userId } = data;
  const player = playerData.findPlayer(userId);

  if (!player || userId !== getCurrentPlayerUserId()) {
    return { success: false, error: 'Not authorized', largestArmyPlayer };
  }

  if (player.developmentCards.knight < 1) {
    socket.emit('playCardFailed', { reason: 'No knight cards' });
    return { success: false, error: 'No knight cards', largestArmyPlayer };
  }

  player.developmentCards.knight -= 1;
  player.playedKnights = (player.playedKnights || 0) + 1;

  const allPlayers = playerData.getPlayers();
  const maxKnights = Math.max(...allPlayers.map(p => p.playedKnights || 0));
  
  let newLargestArmyPlayer = largestArmyPlayer;

  if (player.playedKnights >= 3 && player.playedKnights === maxKnights) {
    if (largestArmyPlayer && largestArmyPlayer !== userId) {
      const prevPlayer = playerData.findPlayer(largestArmyPlayer);
      if (prevPlayer) {
        playerData.updatePlayer(largestArmyPlayer, { score: prevPlayer.score - 2 });
      }
    }
    
    if (largestArmyPlayer !== userId) {
      newLargestArmyPlayer = userId;
      playerData.updatePlayer(userId, { 
        developmentCards: player.developmentCards,
        playedKnights: player.playedKnights,
        score: player.score + 2
      });
      console.log(`🗡️ ${player.name} now has Largest Army!`);
    } else {
      playerData.updatePlayer(userId, { 
        developmentCards: player.developmentCards,
        playedKnights: player.playedKnights
      });
    }
  } else {
    playerData.updatePlayer(userId, { 
      developmentCards: player.developmentCards,
      playedKnights: player.playedKnights
    });
  }

  console.log(`🗡️ ${player.name} played a Knight card! (Total: ${player.playedKnights})`);
  
  io.emit('playersUpdated', playerData.getPlayers());
  socket.emit('knightPlayed', { userId, totalKnights: player.playedKnights });

  return { success: true, largestArmyPlayer: newLargestArmyPlayer };
}

// Handle playing a Year of Plenty card
function handlePlayYearOfPlenty(data, getCurrentPlayerUserId, io, socket) {
  const { userId, resources } = data;
  const player = playerData.findPlayer(userId);

  if (!player || userId !== getCurrentPlayerUserId()) {
    return { success: false, error: 'Not authorized' };
  }

  if (player.developmentCards.yearOfPlenty < 1) {
    socket.emit('playCardFailed', { reason: 'No Year of Plenty cards' });
    return { success: false, error: 'No Year of Plenty cards' };
  }

  if (!resources || resources.length !== 2) {
    return { success: false, error: 'Must select exactly 2 resources' };
  }

  // Deduct the card
  player.developmentCards.yearOfPlenty -= 1;

  // Give the resources
  resources.forEach(resource => {
    player.resources[resource] = (player.resources[resource] || 0) + 1;
  });

  playerData.updatePlayer(userId, {
    developmentCards: player.developmentCards,
    resources: player.resources
  });

  console.log(`🎁 ${player.name} played Year of Plenty and received ${resources.join(' and ')}`);
  
  io.emit('playersUpdated', playerData.getPlayers());
  socket.emit('yearOfPlentyPlayed', { userId, resources });

  return { success: true };
}

// Handle playing a Monopoly card
function handlePlayMonopoly(data, getCurrentPlayerUserId, io, socket) {
  const { userId, resource } = data;
  const player = playerData.findPlayer(userId);

  if (!player || userId !== getCurrentPlayerUserId()) {
    return { success: false, error: 'Not authorized' };
  }

  if (player.developmentCards.monopoly < 1) {
    socket.emit('playCardFailed', { reason: 'No Monopoly cards' });
    return { success: false, error: 'No Monopoly cards' };
  }

  if (!resource) {
    return { success: false, error: 'Must select a resource' };
  }

  // Deduct the card
  player.developmentCards.monopoly -= 1;

  // Steal the resource from all other players
  const allPlayers = playerData.getPlayers();
  let totalStolen = 0;

  allPlayers.forEach(otherPlayer => {
    if (otherPlayer.userId !== userId && otherPlayer.resources[resource] > 0) {
      const amount = otherPlayer.resources[resource];
      totalStolen += amount;
      otherPlayer.resources[resource] = 0;
      playerData.updatePlayer(otherPlayer.userId, { resources: otherPlayer.resources });
      console.log(`💰 ${player.name} stole ${amount} ${resource} from ${otherPlayer.name}`);
    }
  });

  // Give all stolen resources to the player
  player.resources[resource] = (player.resources[resource] || 0) + totalStolen;

  playerData.updatePlayer(userId, {
    developmentCards: player.developmentCards,
    resources: player.resources
  });

  console.log(`💰 ${player.name} played Monopoly on ${resource} and received ${totalStolen} total`);
  
  io.emit('playersUpdated', playerData.getPlayers());
  socket.emit('monopolyPlayed', { userId, resource, totalStolen });

  return { success: true };
}

// Handle playing a Road Building card
function handlePlayRoadBuilding(data, getCurrentPlayerUserId, io, socket) {
  const { userId } = data;
  const player = playerData.findPlayer(userId);

  if (!player || userId !== getCurrentPlayerUserId()) {
    return { success: false, error: 'Not authorized' };
  }

  if (player.developmentCards.roadBuilding < 1) {
    socket.emit('playCardFailed', { reason: 'No Road Building cards' });
    return { success: false, error: 'No Road Building cards' };
  }

  // Deduct the card
  player.developmentCards.roadBuilding -= 1;

  playerData.updatePlayer(userId, {
    developmentCards: player.developmentCards
  });

  console.log(`🛣️ ${player.name} played Road Building card`);
  
  io.emit('playersUpdated', playerData.getPlayers());
  socket.emit('roadBuildingPlayed', { userId });

  return { success: true };
}

// Handle playing a victory point card
function handlePlayVictoryPoint(data, getCurrentPlayerUserId, io) {
  const { userId } = data;
  const player = playerData.findPlayer(userId);

  if (!player || userId !== getCurrentPlayerUserId()) {
    return { success: false, error: 'Not authorized' };
  }

  if (!player.developmentCards.victoryPoint || player.developmentCards.victoryPoint < 1) {
    return { success: false, error: 'No victory point cards' };
  }

  player.developmentCards.victoryPoint -= 1;
  
  if (!player.revealedVictoryPoints) {
    player.revealedVictoryPoints = 0;
  }
  player.revealedVictoryPoints += 1;
  player.score += 1;

  playerData.updatePlayer(userId, { 
    developmentCards: player.developmentCards,
    revealedVictoryPoints: player.revealedVictoryPoints,
    score: player.score
  });

  console.log(`🏆 ${player.name} revealed a Victory Point card! (Score: ${player.score})`);
  
  io.emit('playersUpdated', playerData.getPlayers());
  io.emit('victoryPointRevealed', { 
    userId, 
    playerName: player.name,
    newScore: player.score,
    totalRevealed: player.revealedVictoryPoints
  });

  if (player.score >= 10) {
    console.log(`🎉 ${player.name} has won the game!`);
    io.emit('gameWon', {
      winnerId: userId,
      winnerName: player.name,
      finalScore: player.score
    });
  }

  return { success: true };
}

module.exports = {
  getPlayersAdjacentToTile,
  stealRandomResource,
  handleMoveRobber,
  handleStealResource,
  handleBuyDevelopmentCard,
  handlePlayKnight,
  handlePlayYearOfPlenty,
  handlePlayMonopoly,
  handlePlayRoadBuilding,
  handlePlayVictoryPoint
};