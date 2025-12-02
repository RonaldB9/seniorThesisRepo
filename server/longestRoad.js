//Longest Road calculation and management

const playerData = require('./playerData');
const { checkForWin } = require('./DevelopmentCards');

/*
 Calculate the longest continuous road for a player
 A continuous road must be connected through houses or directly to other roads
 Returns the length of the longest road found
 */
function calculateLongestRoad(userId, placedRoads, placedHouses, roadData) {
  if (!roadData || roadData.length === 0) return 0;

  //Get all roads owned by this player
  const playerRoads = new Set();
  Object.entries(placedRoads).forEach(([roadIndex, road]) => {
    if (road.userId === userId) {
      playerRoads.add(parseInt(roadIndex));
    }
  });

  if (playerRoads.size === 0) return 0;

  //Get all houses owned by this player (including cities)
  const playerHouses = new Set();
  Object.entries(placedHouses).forEach(([houseIndex, house]) => {
    if (house.userId === userId) {
      playerHouses.add(parseInt(houseIndex));
    }
  });

  let longestPath = 0;

  //Start DFS from each road owned by the player
  playerRoads.forEach(startRoad => {
    const visited = new Set();
    const length = dfsLongestRoad(
      startRoad,
      visited,
      playerRoads,
      playerHouses,
      roadData,
      placedRoads,
      userId
    );
    longestPath = Math.max(longestPath, length);
  });

  return longestPath;
}

/*
 DFS to find longest path from a given road
 Explores all connected roads without revisiting
 */
function dfsLongestRoad(
  currentRoadIndex,
  visited,
  playerRoads,
  playerHouses,
  roadData,
  placedRoads,
  userId
) {
  visited.add(currentRoadIndex);
  
  const currentRoad = roadData[currentRoadIndex];
  if (!currentRoad) {
    visited.delete(currentRoadIndex);
    return 0;
  }

  let maxLength = 1; //Current road counts as 1

  //Get connected roads through houses or direct connections
  const connectedRoads = new Set();

  //Check houses connected to this road
  if (currentRoad.connectedHouses) {
    currentRoad.connectedHouses.forEach(houseIndex => {
      //Check if player owns this house
      if (playerHouses.has(houseIndex)) {
        const houseRoads = roadData.filter(road =>
          road.connectedHouses && road.connectedHouses.includes(houseIndex)
        );

        houseRoads.forEach((road, roadIdx) => {
          if (
            playerRoads.has(roadIdx) &&
            !visited.has(roadIdx) &&
            road.userId !== undefined //Make sure it's a placed road
          ) {
            connectedRoads.add(roadIdx);
          }
        });
      } else {
        //If opponent owns this house, we can't continue past it
        //This breaks the road chain
      }
    });
  }

  //Check directly connected roads
  if (currentRoad.connectedRoads) {
    currentRoad.connectedRoads.forEach(roadIdx => {
      if (playerRoads.has(roadIdx) && !visited.has(roadIdx)) {
        connectedRoads.add(roadIdx);
      }
    });
  }

  //Explore each connected road
  connectedRoads.forEach(nextRoad => {
    const length = dfsLongestRoad(
      nextRoad,
      visited,
      playerRoads,
      playerHouses,
      roadData,
      placedRoads,
      userId
    );
    maxLength = Math.max(maxLength, 1 + length);
  });

  visited.delete(currentRoadIndex);
  return maxLength;
}

/*
 Update longest road holder
 A player needs at least 5 continuous roads to qualify
 Awards 2 points to the player with the longest road
 */
function updateLongestRoad(
  allPlayers,
  placedRoads,
  placedHouses,
  roadData,
  currentLongestRoadPlayer,
  io
) {
  const MIN_ROAD_LENGTH = 5;
  let newLongestRoadPlayer = currentLongestRoadPlayer;
  let maxLength = 0;
  let maxLengthPlayerId = null;

  //Calculate longest road for each player
  const roadLengths = {};
  allPlayers.forEach(player => {
    const length = calculateLongestRoad(player.userId, placedRoads, placedHouses, roadData);
    roadLengths[player.userId] = length;

    if (length >= MIN_ROAD_LENGTH && length > maxLength) {
      maxLength = length;
      maxLengthPlayerId = player.userId;
    }
  });

  console.log(`📊 Road lengths:`, roadLengths);

  //Check if longest road holder changed
  if (maxLengthPlayerId !== currentLongestRoadPlayer) {
    //Remove points from previous holder
    if (currentLongestRoadPlayer) {
      const prevHolder = playerData.findPlayer(currentLongestRoadPlayer);
      if (prevHolder && prevHolder.score >= 2) {
        const newScore = prevHolder.score - 2;
        playerData.updatePlayer(currentLongestRoadPlayer, { score: newScore });
        console.log(`🛣️ ${prevHolder.name} lost Longest Road (-2 points)`);
      }
    }

    //Award points to new holder
    if (maxLengthPlayerId) {
      const newHolder = playerData.findPlayer(maxLengthPlayerId);
      if (newHolder) {
        const newScore = newHolder.score + 2;
        playerData.updatePlayer(maxLengthPlayerId, { score: newScore });
        console.log(
          `🛣️ ${newHolder.name} now has Longest Road with ${maxLength} roads! (+2 points, Score: ${newScore})`
        );

        newLongestRoadPlayer = maxLengthPlayerId;

        io.emit('longestRoadChanged', {
          previousHolder: currentLongestRoadPlayer,
          newHolder: maxLengthPlayerId,
          playerName: newHolder.name,
          roadLength: maxLength
        });

        //CHECK FOR WIN after awarding Longest Road points
        const updatedPlayer = playerData.findPlayer(maxLengthPlayerId);
        checkForWin(updatedPlayer, io);
      }
    } else {
      newLongestRoadPlayer = null;
      console.log(`🛣️ No one qualifies for Longest Road (minimum ${MIN_ROAD_LENGTH} roads needed)`);
    }

    io.emit('longestRoadUpdate', {
      currentHolder: newLongestRoadPlayer,
      holderName: newLongestRoadPlayer ? playerData.findPlayer(newLongestRoadPlayer)?.name : null,
      roadLengths
    });
  }

  return newLongestRoadPlayer;
}

module.exports = {
  calculateLongestRoad,
  updateLongestRoad
};