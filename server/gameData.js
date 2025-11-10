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

    return house_to_tile_map;
}

function getRoadSpotData() {
    const road_segments = [
        {x: -160, y: -235, connectedHouses: [0, 3], connectedRoads: [1, 6]},
        {x: -90, y: -235, connectedHouses: [0, 4], connectedRoads: [0, 2, 7]},
        {x: -35, y: -235, connectedHouses: [1, 4], connectedRoads: [1, 3, 7]},
        {x: 35, y: -235, connectedHouses: [1, 5], connectedRoads: [2, 4, 8]},
        {x: 90, y: -235, connectedHouses: [2, 5], connectedRoads: [3, 5, 8]},
        {x: 160, y: -235, connectedHouses: [2, 6], connectedRoads: [4, 9]},
        
        {x: -185, y: -190, connectedHouses: [3, 7], connectedRoads: [0, 10, 11]},
        {x: -60, y: -190, connectedHouses: [4, 8], connectedRoads: [1, 2, 12, 13]},
        {x: 60, y: -190, connectedHouses: [5, 9], connectedRoads: [3, 4, 14, 15]},
        {x: 185, y: -190, connectedHouses: [6, 10], connectedRoads: [5, 16, 17]},
        
        {x: -220, y: -140, connectedHouses: [7, 11], connectedRoads: [6, 11, 18]},
        {x: -160, y: -140, connectedHouses: [7, 12], connectedRoads: [6, 10, 12, 19]},
        {x: -90, y: -140, connectedHouses: [8, 12], connectedRoads: [11, 19, 7, 13]},
        {x: -35, y: -140, connectedHouses: [8, 13], connectedRoads: [7, 12, 14, 20]},
        {x: 35, y: -140, connectedHouses: [9, 13], connectedRoads: [13, 20, 8, 15]},
        {x: 90, y: -140, connectedHouses: [9, 14], connectedRoads: [8, 14, 16, 21]},
        {x: 160, y: -140, connectedHouses: [10, 14], connectedRoads: [15, 21, 9, 17]},
        {x: 220, y: -140, connectedHouses: [10, 15], connectedRoads: [16, 9, 22]},
        
        {x: -250, y: -95, connectedHouses: [11, 16], connectedRoads: [10, 23, 24]},
        {x: -125, y: -95, connectedHouses: [12, 17], connectedRoads: [11, 12, 25, 26]},
        {x: 0, y: -95, connectedHouses: [13, 18], connectedRoads: [13, 14, 27, 28]},
        {x: 125, y: -95, connectedHouses: [14, 19], connectedRoads: [15, 16, 29, 30]},
        {x: 250, y: -95, connectedHouses: [15, 20], connectedRoads: [17, 31, 32]},
        
        {x: -280, y: -45, connectedHouses: [16, 21], connectedRoads: [18, 24, 33]},
        {x: -220, y: -45, connectedHouses: [16, 22], connectedRoads: [18, 23, 25, 34]},
        {x: -160, y: -45, connectedHouses: [17, 22], connectedRoads: [19, 24, 26, 34]},
        {x: -90, y: -45, connectedHouses: [17, 23], connectedRoads: [19, 25, 27, 35]},
        {x: -35, y: -45, connectedHouses: [18, 23], connectedRoads: [26, 28, 35, 20]},
        {x: 35, y: -45, connectedHouses: [18, 24], connectedRoads: [20, 27, 29, 36]},
        {x: 90, y: -45, connectedHouses: [19, 24], connectedRoads: [21, 28, 30, 36]},
        {x: 160, y: -45, connectedHouses: [19, 25], connectedRoads: [21, 29, 31, 37]},
        {x: 220, y: -45, connectedHouses: [20, 25], connectedRoads: [30, 32, 22, 37]},
        {x: 280, y: -45, connectedHouses: [20, 26], connectedRoads: [22, 31, 38]},
        
        {x: -310, y: 0, connectedHouses: [21, 27], connectedRoads: [23, 39]},
        {x: -185, y: 0, connectedHouses: [22, 28], connectedRoads: [24, 25, 40, 41]},
        {x: -60, y: 0, connectedHouses: [23, 29], connectedRoads: [26, 27, 42, 43]},
        {x: 60, y: 0, connectedHouses: [24, 30], connectedRoads: [28, 29, 44, 45]},
        {x: 185, y: 0, connectedHouses: [25, 31], connectedRoads: [30, 31, 46, 47]},
        {x: 310, y: 0, connectedHouses: [26, 32], connectedRoads: [32, 48]},
        
        {x: -280, y: 45, connectedHouses: [27, 33], connectedRoads: [23, 40, 49]},
        {x: -220, y: 45, connectedHouses: [28, 33], connectedRoads: [39, 49, 34, 40]},
        {x: -160, y: 45, connectedHouses: [28, 34], connectedRoads: [34, 40, 42, 50]},
        {x: -90, y: 45, connectedHouses: [29, 34], connectedRoads: [35, 41, 43, 50]},
        {x: -35, y: 45, connectedHouses: [29, 35], connectedRoads: [35, 42, 44, 51]},
        {x: 35, y: 45, connectedHouses: [30, 35], connectedRoads: [36, 43, 45, 51]},
        {x: 90, y: 45, connectedHouses: [30, 36], connectedRoads: [36, 44, 46, 52]},
        {x: 160, y: 45, connectedHouses: [31, 36], connectedRoads: [37, 45, 47, 52]},
        {x: 220, y: 45, connectedHouses: [31, 37], connectedRoads: [37, 46, 48, 53]},
        {x: 280, y: 45, connectedHouses: [32, 37], connectedRoads: [38, 47, 53]},
        
        {x: -250, y: 95, connectedHouses: [33, 38], connectedRoads: [39, 40, 54]},
        {x: -125, y: 95, connectedHouses: [34, 39], connectedRoads: [41, 42, 55, 56]},
        {x: 0, y: 95, connectedHouses: [35, 40], connectedRoads: [43, 44, 57, 58]},
        {x: 125, y: 95, connectedHouses: [36, 41], connectedRoads: [45, 46, 59, 60]},
        {x: 250, y: 95, connectedHouses: [37, 42], connectedRoads: [47, 48, 61]},
        
        {x: -220, y: 140, connectedHouses: [38, 43], connectedRoads: [49, 55, 62]},
        {x: -160, y: 140, connectedHouses: [39, 43], connectedRoads: [54, 56, 50, 62]},
        {x: -90, y: 140, connectedHouses: [39, 44], connectedRoads: [55, 57, 50, 63]},
        {x: -35, y: 140, connectedHouses: [40, 44], connectedRoads: [56, 58, 51, 63]},
        {x: 35, y: 140, connectedHouses: [40, 45], connectedRoads: [57, 59, 51, 64]},
        {x: 90, y: 140, connectedHouses: [41, 45], connectedRoads: [58, 60, 52, 64]},
        {x: 160, y: 140, connectedHouses: [41, 46], connectedRoads: [59, 61, 52, 65]},
        {x: 220, y: 140, connectedHouses: [42, 46], connectedRoads: [60, 53, 65]},
        
        {x: -185, y: 190, connectedHouses: [43, 47], connectedRoads: [54, 55, 66]},
        {x: -60, y: 190, connectedHouses: [44, 48], connectedRoads: [56, 57, 67, 68]},
        {x: 60, y: 190, connectedHouses: [45, 49], connectedRoads: [58, 59, 69, 70]},
        {x: 185, y: 190, connectedHouses: [46, 50], connectedRoads: [60, 61, 71]},
        
        {x: -160, y: 235, connectedHouses: [47, 51], connectedRoads: [62, 67]},
        {x: -90, y: 235, connectedHouses: [48, 51], connectedRoads: [66, 68, 63]},
        {x: -35, y: 235, connectedHouses: [48, 52], connectedRoads: [67, 69, 63]},
        {x: 35, y: 235, connectedHouses: [49, 52], connectedRoads: [68, 70, 64]},
        {x: 90, y: 235, connectedHouses: [49, 53], connectedRoads: [69, 71, 64]},
        {x: 160, y: 235, connectedHouses: [50, 53], connectedRoads: [70, 65]}
    ];

    return road_segments;
}

function getPortRoadData() {
    const portRoadMappings = [
        // 3:1 Port at top-middle
        {
            roadSegments: [
                { x: 10, y: -270, rotation: 30 },
                { x: 40, y: -250, rotation: 0 }
            ]
        },
        // 3:1 Port at top-right  
        {
            roadSegments: [
                { x: 220, y: -160, rotation: 30 },
                { x: 240, y: -160, rotation: 0 }
            ]
        },
        // 3:1 Port at bottom-middle
        {
            roadSegments: [
                { x: 10, y: 230, rotation: -30 },
                { x: 60, y: 230, rotation: 0 }
            ]
        },
        // 3:1 Port at middle-left
        {
            roadSegments: [
                { x: -250, y: 110, rotation: -30 },
                { x: -250, y: 70, rotation: 30 }
            ]
        },
        // 2:1 Brick Port at top-left
        {
            roadSegments: [
                { x: -180, y: -240, rotation: 0 },
                { x: -140, y: -240, rotation: -30 }
            ]
        },
        // 2:1 Sheep Port at middle-right
        {
            roadSegments: [
                { x: 320, y: -10, rotation: -60 },
                { x: 320, y: 20, rotation: 60 }
            ]
        },
        // 2:1 Stone Port at left
        {
            roadSegments: [
                { x: -250, y: -120, rotation: 30 },
                { x: -250, y: -75, rotation: -30 }
            ]
        },
        // 2:1 Wood Port at bottom-left
        {
            roadSegments: [
                { x: -170, y: 220, rotation: 30 },
                { x: -145, y: 235, rotation: 30 }
            ]
        },
        // 2:1 Wheat Port at bottom-right
        {
            roadSegments: [
                { x: 220, y: 150, rotation: 0 },
                { x: 190, y: 170, rotation: -30 }
            ]
        }
    ];

    return portRoadMappings;
}

function createDevelopmentCardDeck() {
    // Standard Catan development card distribution
    const deck = [
        ...Array(14).fill('knight'),
        ...Array(5).fill('victoryPoint'),
        ...Array(2).fill('roadBuilding'),
        ...Array(2).fill('yearOfPlenty'),
        ...Array(2).fill('monopoly')
    ];
    
    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
}

module.exports = {
  generateCatanBoard,
  getHouseTileData,
  getRoadSpotData,
  getPortRoadData,
  createDevelopmentCardDeck
};