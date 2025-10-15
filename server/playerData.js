const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'players.json');

// Helper: read player data from file
function readPlayers() {
  try {
    const data = fs.readFileSync(dataFile, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // file doesn't exist, return empty list
      return [];
    }
    throw err;
  }
}

// Helper: write player data to file
function writePlayers(players) {
  fs.writeFileSync(dataFile, JSON.stringify(players, null, 2));
}

// Get all players
function getPlayers() {
  return readPlayers();
}

// Find player by userId
function findPlayer(userId) {
  const players = readPlayers();
  return players.find(p => p.userId === userId);
}

// Add new player
function addPlayer(player) {
  const players = readPlayers();
  players.push(player);
  writePlayers(players);
}

// Update player (by userId)
function updatePlayer(userId, updates) {
  const players = readPlayers();
  const index = players.findIndex(p => p.userId === userId);
  if (index === -1) return null;
  players[index] = { ...players[index], ...updates };
  writePlayers(players);
  return players[index];
}

module.exports = {
  getPlayers,
  findPlayer,
  addPlayer,
  updatePlayer,
  writePlayers
};
