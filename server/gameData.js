function generateCatanBoard() {
  let resourceTiles = [
    "Brick", "Brick", "Brick",
    "Ore", "Ore", "Ore",
    "Desert",
    "Wood", "Wood", "Wood", "Wood",
    "Sheep", "Sheep", "Sheep", "Sheep",
    "Wheat", "Wheat", "Wheat", "Wheat"
  ];

  // Shuffle
  for (let i = resourceTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resourceTiles[i], resourceTiles[j]] = [resourceTiles[j], resourceTiles[i]];
  }

  let resourceTokens = [8, 3, 6, 2, 5, 10, 8, 4, 11, 12, 9, 10, 5, 4, 9, 3, 6, 11];

  const desertIndex = resourceTiles.findIndex(tile => tile === "Desert");

  if (desertIndex !== -1) {
    resourceTokens.splice(desertIndex, 0, null); // desert has no token
  }

  console.log('Resource Tiles:', resourceTiles);
  console.log('Resource Tokens:', resourceTokens);

  return { resourceTiles, resourceTokens };
}

module.exports = generateCatanBoard;
