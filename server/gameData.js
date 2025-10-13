function generateCatanBoard() {
    //all resources
    let resourceTiles = [
        "Brick", "Brick", "Brick",
        "Ore", "Ore", "Ore",
        "Desert",
        "Wood", "Wood", "Wood", "Wood",
        "Sheep", "Sheep", "Sheep", "Sheep",
        "Wheat", "Wheat", "Wheat", "Wheat"
    ];

    //Shuffle
    for (let i = resourceTiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [resourceTiles[i], resourceTiles[j]] = [resourceTiles[j], resourceTiles[i]];
    }

    //resource tokens
    let resourceTokens = [8, 3, 6, 2, 5, 10, 8, 4, 11, 12, 9, 10, 5, 4, 9, 3, 6, 11];
    //insert null for desert 
    const desertIndex = resourceTiles.findIndex(tile => tile === "Desert");
    if (desertIndex !== -1) {
        resourceTokens.splice(desertIndex, 0, null); // desert has no token
    }

    console.log('Resource Tiles:', resourceTiles);
    console.log('Resource Tokens:', resourceTokens);

    return { resourceTiles, resourceTokens };
}

function getHouseTileData() {
    //coordinates, connected tiles
    const house_to_tile_map = [
        {x: -125, y: -252, tiles: [0]}, {x: 0, y: -252, tiles: [1]}, {x: 125, y: -252, tiles: [2]},
        {x: -185, y: -222, tiles: [0]}, {x: -65, y: -222, tiles: [0,1]}, {x: 65, y: -222, tiles: [1,2]}, {x: 185, y: -222, tiles: [2]},
        {x: -185, y: -157, tiles: [0,11]}, {x: -65, y: -157, tiles: [0,1,12]}, {x: 65, y: -157, tiles: [1,2,13]}, {x: 185, y: -157, tiles: [2,3]},
        {x: -250, y: -127, tiles: [11]}, {x: -125, y: -127, tiles: [0,11,12]}, {x: 0, y: -127, tiles: [1,12,13]}, {x: 125, y: -127, tiles: [2,3,13]}, {x: 250, y: -127, tiles: [3]},
        {x: -250, y: -62, tiles: [10,11]}, {x: -125, y: -62, tiles: [11,12,17]}, {x: 0, y: -62, tiles: [12,13,18]}, {x: 125, y: -62, tiles: [3,13,14]}, {x: 250, y: -62, tiles: [3,4]},
        {x: -310, y: -32, tiles: [10]}, {x: -185, y: -32, tiles: [10,11,17]}, {x: -65, y: -32, tiles: [12,17,18]}, {x: 65, y: -32, tiles: [13,14,18]}, {x: 185, y: -32, tiles: [3,4,14]}, {x: 310, y: -32, tiles: [4]},
        {x: -310, y: 33, tiles: [10]}, {x: -185, y: 33, tiles: [9,10,17]}, {x: -65, y: 33, tiles: [16,17,18]}, {x: 65, y: 33, tiles: [14,15,18]}, {x: 185, y: 33, tiles: [4,5,14]}, {x: 310, y: 33, tiles: [4]},
        {x: -250, y: 58, tiles: [9,10]}, {x: -125, y: 58, tiles: [9,16,17]}, {x: 0, y: 58, tiles: [15,16,18]}, {x: 125, y: 58, tiles: [5,14,15]}, {x: 250, y: 58, tiles: [4,5]},
        {x: -250, y: 128, tiles: [9]}, {x: -125, y: 128, tiles: [8,9,16]}, {x: 0, y: 128, tiles: [7,15,16]}, {x: 125, y: 128, tiles: [5,6,15]}, {x: 250, y: 128, tiles: [5]},
        {x: -185, y: 158, tiles: [8,9]}, {x: -65, y: 158, tiles: [7,8,16]}, {x: 65, y: 158, tiles: [6,7,15]}, {x: 185, y: 158, tiles: [5,6]},
        {x: -185, y: 218, tiles: [8]}, {x: -65, y: 218, tiles: [7,8]}, {x: 65, y: 218, tiles: [6,7,15]}, {x: 185, y: 218, tiles: [6]},
        {x: -125, y: 248, tiles: [8]}, {x: 0, y: 248, tiles: [7]}, {x: 125, y: 248, tiles: [6]}
    ];
    //console.log('House Data:', house_to_tile_map);

    return house_to_tile_map;
}

module.exports = {
  generateCatanBoard,
  getHouseTileData
};