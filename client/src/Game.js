import React, { useEffect, useState } from 'react';
import './css/App.css';
import './css/Game.css'; 
//images
import catanTitle from './Images/catanTitle.png';
import brickTile from './Images/brickTile.png';
import oreTile from './Images/oreTile.png';
import woodTile from './Images/woodTile.png';
import sheepTile from './Images/sheepTile.png';
import wheatTile from './Images/wheatTile.png';
import desertTile from './Images/desertTile.png';
import chooseCircle from './Images/chooseCircle.png';
import redHouse from './Images/redHouse.png';
import greenHouse from './Images/greenHouse.png';
import greenRoad from './Images/greenRoad.png';
import redRoad from './Images/redRoad.png';
import blueRoad from './Images/blueRoad.png';
import ThreetoOnePort from './Images/3to1Port.jpg';
import TwotoOneBrick from './Images/2To1Brick.jpg';
import TwotoOneSheep from './Images/2To1Sheep.jpg';
import TwotoOneStone from './Images/2To1Stone.jpg';
import TwotoOneWood from './Images/2To1Wood.jpg';
import TwotoOneWheat from './Images/2To1Wheat.jpg';
import socket from './socket';

function Game() {
    //map resources
    const resourceImages = {
        Brick: brickTile,
        Ore: oreTile,
        Wood: woodTile,
        Sheep: sheepTile,
        Wheat: wheatTile,
        Desert: desertTile
    };

    const [resourceTiles, setResourceTiles] = useState([]);
    const [resourceTokens, setResourceTokens] = useState([]);
    const [houseData, setHouseData] = useState([]);
    const [roadData, setRoadData] = useState([]);
    const [currentTurnUserId, setCurrentTurnUserId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [selectedHouseIndex, setSelectedHouseIndex] = useState(null);
    const [selectedRoadIndex, setSelectedRoadIndex] = useState(null);
    const [placedHouses, setPlacedHouses] = useState({});
    const [placedRoads, setPlacedRoads] = useState({});
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [unavailableHouses, setUnavailableHouses] = useState(new Set());
    const [unavailableRoads, setUnavailableRoads] = useState(new Set());
    const [housePlacedThisTurn, setHousePlacedThisTurn] = useState(false);
    const [roadPlacedThisTurn, setRoadPlacedThisTurn] = useState(false);
    const [allPlayers, setAllPlayers] = useState([]);
    const [gamePhase, setGamePhase] = useState('setup'); // 'setup' or 'playing'
    const [diceRoll, setDiceRoll] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [buildingHouse, setBuildingHouse] = useState(false);
    const [buildingRoad, setBuildingRoad] = useState(false);

    // Get userId on mount
    useEffect(() => {
        const id = localStorage.getItem('userId');
        setUserId(id);

        // Fetch current player data
        if (id) {
            fetch(`http://localhost:3001/api/players`)
            .then((res) => res.json())
            .then((players) => {
                const player = players.find(p => p.userId === id);
                setCurrentPlayer(player);
                setAllPlayers(players);
            })
            .catch(err => console.error('Failed to fetch player:', err));
        }
    }, []);

    // Fetch board data
    useEffect(() => {
        fetch('http://localhost:3001/api/board')
        .then((res) => res.json())
        .then((data) => {
            setResourceTiles(data.resourceTiles);
            setResourceTokens(data.resourceTokens);
            setHouseData(data.houseData);
            setRoadData(data.roadData);
        });

        // Fetch existing placed houses
        fetch('http://localhost:3001/api/houses')
        .then((res) => res.json())
        .then((data) => {
            setPlacedHouses(data);
            updateUnavailableHouses(data);
        })
        .catch(err => console.error('Failed to fetch houses:', err));

        // Fetch existing placed roads
        fetch('http://localhost:3001/api/roads')
        .then((res) => res.json())
        .then((data) => {
            setPlacedRoads(data);
            updateUnavailableRoads(data);
        })
        .catch(err => console.error('Failed to fetch roads:', err));
    }, []);

    // Helper function to find adjacent houses
    const getAdjacentHouses = (houseIndex) => {
        const adjacencyMap = {
            0: [3, 4], 1: [4, 5], 2: [5, 6],
            3: [0, 7], 4: [0, 1, 8], 5: [1, 2, 9], 6: [2, 10],
            7: [3, 11, 12], 8: [4, 12, 13], 9: [5, 13, 14], 10: [6, 14, 15],
            11: [7, 16], 12: [7, 8, 17], 13: [8, 9, 18], 14: [9, 10, 19], 15: [10, 20],
            16: [11, 21, 22], 17: [12, 22, 23], 18: [13, 23, 24], 19: [14, 24, 25], 20: [15, 25, 26], 
            21: [16, 27], 22: [16, 17, 28], 23: [17, 18, 29], 24: [18, 19, 30], 25: [19, 20, 31], 26: [20, 32],
            27: [21, 33], 28: [22, 33, 34], 29: [23, 34, 35], 30: [24, 35, 36], 31: [25, 36, 37], 32: [26, 37],
            33: [27, 28, 38], 34: [28, 29, 39], 35: [29, 30, 40], 36: [30, 31, 41], 37: [31, 32, 42],
            38: [33, 43], 39: [34, 43, 44], 40: [35, 44, 45], 41: [36, 45, 46], 42: [37, 46],
            43: [38, 39, 47], 44: [39, 40, 48], 45: [40, 41, 49], 46: [41, 42, 50],
            47: [43, 51], 48: [44, 51, 52], 49: [45, 52, 53], 50: [46, 53],
            51: [47, 48], 52: [48, 49], 53: [49, 50]
        };
        return adjacencyMap[houseIndex] || [];
    };

    // Update unavailable houses based on placed houses
    const updateUnavailableHouses = (placedHousesObj) => {
        const unavailable = new Set();
        
        Object.keys(placedHousesObj).forEach(houseIndexStr => {
            const houseIndex = parseInt(houseIndexStr);
            unavailable.add(houseIndex);
            
            const adjacent = getAdjacentHouses(houseIndex);
            adjacent.forEach(adj => unavailable.add(adj));
        });
        
        setUnavailableHouses(unavailable);
    };

    // Update unavailable roads based on placed roads
    const updateUnavailableRoads = (placedRoadsObj) => {
        const unavailable = new Set();
        
        Object.keys(placedRoadsObj).forEach(roadIndexStr => {
            const roadIndex = parseInt(roadIndexStr);
            unavailable.add(roadIndex);
        });
        
        setUnavailableRoads(unavailable);
    };

    // Reset selection and placement flags when turn changes
    useEffect(() => {
        setSelectedHouseIndex(null);
        setSelectedRoadIndex(null);
        setHousePlacedThisTurn(false);
        setRoadPlacedThisTurn(false);
        setDiceRoll(null);
        setIsRolling(false);
        setBuildingHouse(false);
        setBuildingRoad(false);
    }, [currentTurnUserId]);

    // Check if setup phase is complete
    useEffect(() => {
        const totalHouses = Object.keys(placedHouses).length;
        const totalRoads = Object.keys(placedRoads).length;
        const requiredHouses = allPlayers.length * 2;
        const requiredRoads = allPlayers.length * 2;
        
        console.log(`Setup check - Houses: ${totalHouses}/${requiredHouses}, Roads: ${totalRoads}/${requiredRoads}, Phase: ${gamePhase}`);
        
        if (totalHouses >= requiredHouses && totalRoads >= requiredRoads && gamePhase === 'setup' && allPlayers.length > 0) {
            console.log('🎮 Setup complete! Moving to playing phase');
            setGamePhase('playing');
        }
    }, [placedHouses, placedRoads, allPlayers.length, gamePhase]);

    // Set up socket listeners ONCE on mount
    useEffect(() => {
        const handleCurrentTurn = (turnUserId) => {
            setCurrentTurnUserId(turnUserId);
        };

        const handleHousePlaced = (data) => {
            setPlacedHouses(prev => {
                const updated = {
                    ...prev,
                    [data.houseIndex]: data
                };
                updateUnavailableHouses(updated);
                return updated;
            });
        };

        const handleRoadPlaced = (data) => {
            setPlacedRoads(prev => {
                const updated = {
                    ...prev,
                    [data.roadIndex]: data
                };
                updateUnavailableRoads(updated);
                return updated;
            });
        };

        const handlePlayersUpdated = (players) => {
            setAllPlayers(players);
            if (userId) {
                const player = players.find(p => p.userId === userId);
                setCurrentPlayer(player);
            }
        };

        const handleDiceRolled = (data) => {
            setDiceRoll(data);
            setIsRolling(false);
            console.log(`🎲 Dice rolled: ${data.die1} + ${data.die2} = ${data.total}`);
        };

        socket.on('currentTurn', handleCurrentTurn);
        socket.on('housePlaced', handleHousePlaced);
        socket.on('roadPlaced', handleRoadPlaced);
        socket.on('playersUpdated', handlePlayersUpdated);
        socket.on('diceRolled', handleDiceRolled);
        
        if (socket.connected) {
            console.log("📌 Requesting current turn...");
            socket.emit('requestCurrentTurn', (response) => {
                console.log("📤 Got response:", response);
            });
        }
        
        return () => {
            socket.off('currentTurn', handleCurrentTurn);
            socket.off('housePlaced', handleHousePlaced);
            socket.off('roadPlaced', handleRoadPlaced);
            socket.off('playersUpdated', handlePlayersUpdated);
            socket.off('diceRolled', handleDiceRolled);
        };
    }, [userId]);

    const handleHouseClick = (index) => {
        // Setup phase logic
        if (userId === currentTurnUserId && selectedHouseIndex === null && !housePlacedThisTurn && gamePhase === 'setup') {
            setSelectedHouseIndex(index);
            setHousePlacedThisTurn(true);
            console.log(`🏠 Selected house ${index} at position:`, houseData[index]);
            
            socket.emit('houseSelected', {
                userId,
                houseIndex: index,
                position: houseData[index]
            });
        }
        
        // Playing phase logic - building house
        if (userId === currentTurnUserId && buildingHouse && gamePhase === 'playing') {
            setSelectedHouseIndex(index);
            console.log(`🏠 Building house ${index} at position:`, houseData[index]);
            
            socket.emit('buildHouse', {
                userId,
                houseIndex: index,
                position: houseData[index]
            });
            
            setBuildingHouse(false);
        }
    };

    const handleRoadClick = (index) => {
        // Setup phase logic
        if (userId === currentTurnUserId && selectedRoadIndex === null && !roadPlacedThisTurn && gamePhase === 'setup') {
            setSelectedRoadIndex(index);
            setRoadPlacedThisTurn(true);
            console.log(`🛣️ Selected road ${index} at position:`, roadData[index]);
            
            socket.emit('roadSelected', {
                userId,
                roadIndex: index,
                position: roadData[index]
            });
        }
        
        // Playing phase logic - building road
        if (userId === currentTurnUserId && buildingRoad && gamePhase === 'playing') {
            setSelectedRoadIndex(index);
            console.log(`🛣️ Building road ${index} at position:`, roadData[index]);
            
            socket.emit('buildRoad', {
                userId,
                roadIndex: index,
                position: roadData[index]
            });
            
            setBuildingRoad(false);
        }
    };

    const handleEndTurn = () => {
        if (userId && currentTurnUserId && userId === currentTurnUserId) {
            console.log("✅ Emitting endTurn");
            socket.emit('endTurn');
            setSelectedHouseIndex(null);
            setSelectedRoadIndex(null);
            setHousePlacedThisTurn(false);
            setRoadPlacedThisTurn(false);
            setDiceRoll(null);
            setBuildingHouse(false);
            setBuildingRoad(false);
        } else {
            console.log("❌ Not your turn or userId not set");
        }
    };

    const handleRollDice = () => {
        if (userId === currentTurnUserId && gamePhase === 'playing' && !diceRoll) {
            setIsRolling(true);
            socket.emit('rollDice', { userId });
        }
    };

    const handleBuildHouse = () => {
        if (userId === currentTurnUserId && gamePhase === 'playing' && canBuildHouse()) {
            setBuildingHouse(true);
            console.log('🏗️ Entering house building mode');
        }
    };

    const handleBuildRoad = () => {
        if (userId === currentTurnUserId && gamePhase === 'playing' && canBuildRoad()) {
            setBuildingRoad(true);
            console.log('🏗️ Entering road building mode');
        }
    };

    const handleCancelBuild = () => {
        setBuildingHouse(false);
        setBuildingRoad(false);
        console.log('❌ Cancelled building');
    };

    // Check if player has enough resources to build a house
    const canBuildHouse = () => {
    if (!currentPlayer || !currentPlayer.resources) return false;
        const { wood, wheat, brick, sheep } = currentPlayer.resources;
        const hasResources = wood >= 1 && wheat >= 1 && brick >= 1 && sheep >= 1;
        const hasAvailableSpots = availableHouseIndicesForBuilding.length > 0;
        return hasResources && hasAvailableSpots;
};

    // Check if player has enough resources to build a road
    const canBuildRoad = () => {
    if (!currentPlayer || !currentPlayer.resources) return false;
        const { wood, brick } = currentPlayer.resources;
        const hasResources = wood >= 1 && brick >= 1;
        const hasAvailableSpots = availableRoadIndices.length > 0;
        return hasResources && hasAvailableSpots;
};

    const housesPlacedByCurrentUser = Object.values(placedHouses).filter(
        house => house.userId === userId
    ).length;

    const roadsPlacedByCurrentUser = Object.values(placedRoads).filter(
        road => road.userId === userId
    ).length;

    // Get house indices placed by current user
    const currentUserHouseIndices = Object.entries(placedHouses)
        .filter(([_, house]) => house.userId === userId)
        .map(([index, _]) => parseInt(index));

    // Get road indices placed by current user
    const currentUserRoadIndices = Object.entries(placedRoads)
        .filter(([_, road]) => road.userId === userId)
        .map(([index, _]) => parseInt(index));

    // Filter roads that are connected to current user's houses or roads
    const getAvailableRoadsForUser = () => {
        if (currentUserHouseIndices.length === 0) return [];
        
        return roadData.reduce((availableRoads, road, roadIndex) => {
            // Check if this road is connected to any of the user's houses
            const isConnectedToUserHouse = road.connectedHouses?.some(houseIndex => 
                currentUserHouseIndices.includes(houseIndex)
            );
            
            // Check if this road is connected to any of the user's roads
            const isConnectedToUserRoad = road.connectedRoads?.some(roadIdx => 
                currentUserRoadIndices.includes(roadIdx)
            );
            
            if (isConnectedToUserHouse || isConnectedToUserRoad) {
                availableRoads.push(roadIndex);
            }
            
            return availableRoads;
        }, []);
    };

    const availableRoadIndices = getAvailableRoadsForUser();

    // Get available house spots for building (must be connected to user's roads)
    const getAvailableHousesForBuilding = () => {
        if (currentUserRoadIndices.length === 0) return [];
        
        const availableHouses = [];
        
        roadData.forEach((road, roadIndex) => {
            if (currentUserRoadIndices.includes(roadIndex)) {
                road.connectedHouses?.forEach(houseIndex => {
                    if (!placedHouses[houseIndex] && !unavailableHouses.has(houseIndex)) {
                        availableHouses.push(houseIndex);
                    }
                });
            }
        });
        
        return [...new Set(availableHouses)];
    };

    const availableHouseIndicesForBuilding = getAvailableHousesForBuilding();

    return (
    <div className="background">
        <div className="images">
          <img src={catanTitle} alt="Catan Title"/>
        </div>
        {userId === currentTurnUserId && (
            <div className="your-turn-banner">
                🎯 Your Turn! 
                {gamePhase === 'setup' && selectedHouseIndex !== null && ` (House ${selectedHouseIndex} selected)`}
                {gamePhase === 'setup' && selectedRoadIndex !== null && ` (Road ${selectedRoadIndex} selected)`}
                {gamePhase === 'playing' && !diceRoll && ' Roll the dice!'}
                {gamePhase === 'playing' && diceRoll && ` Rolled: ${diceRoll.total}`}
                {buildingHouse && ' - Select a spot for your house'}
                {buildingRoad && ' - Select a spot for your road'}
            </div>
        )}
        <h1 className="title">Game {gamePhase === 'setup' ? '(Setup)' : '(Playing)'}</h1>

        {/* Scoreboard */}
        <div className="scoreboard">
            <h3>Scoreboard</h3>
            {allPlayers.map((player) => (
                <div 
                    key={player.userId} 
                    className={`score-item ${player.userId === userId ? 'current-user' : ''}`}>
                    <span style={{ color: player.color, fontWeight: 'bold' }}>
                        {player.name} {player.userId === userId && '(You)'}
                    </span>
                    <span className="score-points">{player.score} points</span>
                    {player.userId === currentTurnUserId && <span className="turn-indicator">← Current Turn</span>}
                    
                    {player.userId === userId && player.resources && (
                        <div className="player-resources">
                            <div className="resource-item">🪵 {player.resources.wood || 0}</div>
                            <div className="resource-item">🧱 {player.resources.brick || 0}</div>
                            <div className="resource-item">🐑 {player.resources.sheep || 0}</div>
                            <div className="resource-item">🌾 {player.resources.wheat || 0}</div>
                            <div className="resource-item">⛏️ {player.resources.ore || 0}</div>
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* Dice Roll Display */}
        {gamePhase === 'playing' && diceRoll && (
            <div className="dice-display">
                <div className="dice-container">
                    <div className="die">{diceRoll.die1}</div>
                    <div className="die">{diceRoll.die2}</div>
                </div>
                <div className="dice-total">Total: {diceRoll.total}</div>
            </div>
        )}

        <div className="tiles-container">
        {resourceTiles.length > 1 && (
            <>
            {/* 1st Row */}
            <div className="tiles-row">
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[0]]} alt={resourceTiles[0]}/>
                    {resourceTokens[0] && ( <span className="token">{resourceTokens[0]}</span>)}
                </span>
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[1]]} alt={resourceTiles[1]}/>
                    {resourceTokens[1] && ( <span className="token">{resourceTokens[1]}</span>)}
                </span>
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[2]]} alt={resourceTiles[2]}/>
                    {resourceTokens[2] && ( <span className="token">{resourceTokens[2]}</span>)}
                </span>
            </div>

            {/* 2nd Row */}
            <div className="tiles-row">
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[11]]} alt={resourceTiles[11]}/>
                    {resourceTokens[11] && ( <span className="token">{resourceTokens[11]}</span>)}
                </span>
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[12]]} alt={resourceTiles[12]}/>
                    {resourceTokens[12] && ( <span className="token">{resourceTokens[12]}</span>)}
                </span>
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[13]]} alt={resourceTiles[13]}/>
                    {resourceTokens[13] && ( <span className="token">{resourceTokens[13]}</span>)}
                </span>
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[3]]} alt={resourceTiles[3]}/>
                    {resourceTokens[3] && ( <span className="token">{resourceTokens[3]}</span>)}
                </span>
            </div>

            {/* 3rd Row */}
            <div className="tiles-row">
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[10]]} alt={resourceTiles[10]}/>
                    {resourceTokens[10] && ( <span className="token">{resourceTokens[10]}</span>)}
                </span>
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[17]]} alt={resourceTiles[17]}/>
                    {resourceTokens[17] && ( <span className="token">{resourceTokens[17]}</span>)}
                </span>
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[18]]} alt={resourceTiles[18]}/>
                    {resourceTokens[18] && ( <span className="token">{resourceTokens[18]}</span>)}
                </span>
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[14]]} alt={resourceTiles[14]}/>
                    {resourceTokens[14] && ( <span className="token">{resourceTokens[14]}</span>)}
                </span>
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[4]]} alt={resourceTiles[4]}/>
                    {resourceTokens[4] && ( <span className="token">{resourceTokens[4]}</span>)}
                </span>
            </div>

            {/* 4th Row */}
            <div className="tiles-row">
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[9]]} alt={resourceTiles[9]}/>
                    {resourceTokens[9] && ( <span className="token">{resourceTokens[9]}</span>)}
                </span>
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[16]]} alt={resourceTiles[16]}/>
                    {resourceTokens[16] && ( <span className="token">{resourceTokens[16]}</span>)}
                </span>
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[15]]} alt={resourceTiles[15]}/>
                    {resourceTokens[15] && ( <span className="token">{resourceTokens[15]}</span>)}
                </span>
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[5]]} alt={resourceTiles[5]}/>
                    {resourceTokens[5] && ( <span className="token">{resourceTokens[5]}</span>)}
                </span>
            </div>

            {/* 5th Row */}
            <div className="tiles-row">
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[8]]} alt={resourceTiles[8]}/>
                    {resourceTokens[8] && ( <span className="token">{resourceTokens[8]}</span>)}
                </span>
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[7]]} alt={resourceTiles[7]}/>
                    {resourceTokens[7] && ( <span className="token">{resourceTokens[7]}</span>)}
                </span>
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[6]]} alt={resourceTiles[6]}/>
                    {resourceTokens[6] && ( <span className="token">{resourceTokens[6]}</span>)}
                </span>
            </div>

            {/*Ports*/}
            <img className="ports" src={ThreetoOnePort} style={{ top: `calc(50% - 300px)`, left: `calc(50% + 10px)`}} alt="3To1Port"/>
            <img className="ports" src={ThreetoOnePort} style={{ top: `calc(50% - 210px)`, left: `calc(50% + 210px)`}} alt="3To1Port2"/>
            <img className="ports" src={ThreetoOnePort} style={{ top: `calc(50% + 250px)`, left: `calc(50% + 10px)`}} alt="3To1Port3"/>
            <img className="ports" src={ThreetoOnePort} style={{ top: `calc(50% + 65px)`, left: `calc(50% - 310px)`}} alt="3To1Port4"/>

            <img className="ports" src={TwotoOneBrick} style={{ top: `calc(50% - 300px)`, left: `calc(50% - 200px)`}} alt="2To1Brick"/>
            <img className="ports" src={TwotoOneSheep} style={{ top: `calc(50% - 25px)`, left: `calc(50% + 330px)`}} alt="2To1Sheep"/>
            <img className="ports" src={TwotoOneStone} style={{ top: `calc(50% - 130px)`, left: `calc(50% - 310px)`}} alt="2To1Stone"/>
            <img className="ports" src={TwotoOneWood} style={{ top: `calc(50% + 250px)`, left: `calc(50% - 200px)`}} alt="2To1Wood"/>
            <img className="ports" src={TwotoOneWheat} style={{ top: `calc(50% + 150px)`, left: `calc(50% + 210px)`}} alt="2To1Wheat"/>
            
            {/* Show house options - ONLY during setup phase */}
            {gamePhase === 'setup' && userId === currentTurnUserId && housesPlacedByCurrentUser < 2 && !housePlacedThisTurn && Array.isArray(houseData) && houseData.map((house, index) => (
                !placedHouses[index] && !unavailableHouses.has(index) && (
                    <img 
                        key={index} 
                        src={chooseCircle} 
                        className={`house_marker fade-loop ${selectedHouseIndex === index ? 'selected' : ''}`}
                        alt={`House ${index}`}
                        onClick={() => handleHouseClick(index)}
                        style={{
                            position: 'absolute',
                            top: `calc(50% + ${house.y}px)`,
                            left: `calc(50% + ${house.x}px)`,
                            transform: 'translate(-50%, -50%)',
                            cursor: 'pointer',
                            opacity: selectedHouseIndex === index ? 1 : 0.7,
                            filter: selectedHouseIndex === index ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))' : 'none',
                            transition: 'all 0.3s ease'
                        }}
                    />
                )
            ))}

            {/* Show house building options - ONLY during playing phase when building */}
            {gamePhase === 'playing' && buildingHouse && userId === currentTurnUserId && Array.isArray(houseData) && houseData.map((house, index) => (
                availableHouseIndicesForBuilding.includes(index) && (
                    <img 
                        key={`build-house-${index}`} 
                        src={chooseCircle} 
                        className="house_marker fade-loop"
                        alt={`Build House ${index}`}
                        onClick={() => handleHouseClick(index)}
                        style={{
                            position: 'absolute',
                            top: `calc(50% + ${house.y}px)`,
                            left: `calc(50% + ${house.x}px)`,
                            transform: 'translate(-50%, -50%)',
                            cursor: 'pointer',
                            opacity: 0.7,
                            filter: 'drop-shadow(0 0 8px rgba(76, 175, 80, 0.8))',
                            transition: 'all 0.3s ease'
                        }}
                    />
                )
            ))}

            {/* Show road options - ONLY during setup phase */}
            {gamePhase === 'setup' && userId === currentTurnUserId && housePlacedThisTurn && roadsPlacedByCurrentUser < 2 && !roadPlacedThisTurn && Array.isArray(roadData) && roadData.map((road, index) => (
                !placedRoads[index] && !unavailableRoads.has(index) && availableRoadIndices.includes(index) && (
                    <img 
                        key={`road-${index}`} 
                        src={chooseCircle} 
                        className={`road_marker fade-loop ${selectedRoadIndex === index ? 'selected' : ''}`}
                        alt={`Road ${index}`}
                        onClick={() => handleRoadClick(index)}
                        style={{
                            position: 'absolute',
                            top: `calc(50% + ${road.y}px)`,
                            left: `calc(50% + ${road.x}px)`,
                            transform: 'translate(-50%, -50%)',
                            cursor: 'pointer',
                            opacity: selectedRoadIndex === index ? 1 : 0.5,
                            filter: selectedRoadIndex === index ? 'drop-shadow(0 0 8px rgba(100, 200, 255, 0.8))' : 'none',
                            transition: 'all 0.3s ease'
                        }}
                    />
                )
            ))}

            {/* Show road building options - ONLY during playing phase when building */}
            {gamePhase === 'playing' && buildingRoad && userId === currentTurnUserId && Array.isArray(roadData) && roadData.map((road, index) => (
                !placedRoads[index] && !unavailableRoads.has(index) && availableRoadIndices.includes(index) && (
                    <img 
                        key={`build-road-${index}`} 
                        src={chooseCircle} 
                        className="road_marker fade-loop"
                        alt={`Build Road ${index}`}
                        onClick={() => handleRoadClick(index)}
                        style={{
                            position: 'absolute',
                            top: `calc(50% + ${road.y}px)`,
                            left: `calc(50% + ${road.x}px)`,
                            transform: 'translate(-50%, -50%)',
                            cursor: 'pointer',
                            opacity: 0.7,
                            filter: 'drop-shadow(0 0 8px rgba(255, 152, 0, 0.8))',
                            transition: 'all 0.3s ease'
                        }}
                    />
                )
            ))}

            {/* Show placed houses */}
            {Array.isArray(houseData) && Object.entries(placedHouses).map(([index, house]) => (
                <img key={`placed-house-${index}`} src={house.playerName === 'Player 1' ? redHouse : greenHouse}
                    alt={`Placed house by ${house.playerName}`}
                    style={{
                        position: 'absolute',
                        top: `calc(50% + ${house.position.y}px)`,
                        left: `calc(50% + ${house.position.x}px)`,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        filter: `drop-shadow(30px, 30px, 10px ${house.playerColor}, 1)`,
                        width: '20px',
                        height: '20px'
                    }}/>
            ))}

            {/* Show placed roads */}
            {Array.isArray(roadData) && Object.entries(placedRoads).map(([index, road]) => (
                <img 
                    key={`placed-road-${index}`}
                    src={greenRoad}
                    alt={`Placed road by ${road.playerName}`}
                    style={{
                        position: 'absolute',
                        top: `calc(50% + ${road.position.y}px)`,
                        left: `calc(50% + ${road.position.x}px)`,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        width: '10px',
                        height: '60px',
                        zIndex: 1
                    }}/>
            ))}
            </>
        )}
        </div>
        {/* Action Buttons */}
            <div className="action-buttons">
                {/* Roll Dice Button - Only in playing phase */}
                {gamePhase === 'playing' && userId === currentTurnUserId && (
                    <button onClick={handleRollDice} disabled={diceRoll !== null || isRolling}
                        className="roll-dice-button"> {isRolling ? '🎲 Rolling...' : '🎲 Roll Dice'}</button>
                )}
                
                {/* Build House Button - Only in playing phase */}
                {gamePhase === 'playing' && userId === currentTurnUserId && !buildingHouse && !buildingRoad && (
                    <button 
                        onClick={handleBuildHouse} 
                        disabled={!canBuildHouse()}
                        className="build-house-button"
                        title={
                            !currentPlayer?.resources || 
                            currentPlayer.resources.wood < 1 || 
                            currentPlayer.resources.wheat < 1 || 
                            currentPlayer.resources.brick < 1 || 
                            currentPlayer.resources.sheep < 1
                                ? 'Need: 1 Wood, 1 Wheat, 1 Brick, 1 Sheep'
                                : availableHouseIndicesForBuilding.length === 0
                                ? 'No available spots to build'
                                : 'Build a settlement'
                        }>🏠 Build House
                    </button>
                )}
                
                {/* Build Road Button - Only in playing phase */}
                {gamePhase === 'playing' && userId === currentTurnUserId && !buildingHouse && !buildingRoad && (
                    <button 
                        onClick={handleBuildRoad} 
                        disabled={!canBuildRoad()}
                        className="build-road-button"
                        title={
                            !currentPlayer?.resources || 
                            currentPlayer.resources.wood < 1 || 
                            currentPlayer.resources.brick < 1
                                ? 'Need: 1 Wood, 1 Brick'
                                : availableRoadIndices.length === 0
                                ? 'No available spots to build'
                                : 'Build a road'
                        }
                    >
                        🛣️ Build Road
                    </button>
                )}
                
                {/* Cancel Build Button */}
                {gamePhase === 'playing' && (buildingHouse || buildingRoad) && (
                    <button 
                        onClick={handleCancelBuild}
                        className="cancel-build-button"
                    >
                        ❌ Cancel
                    </button>
                )}
                
                {/* End Turn Button */}
                <button onClick={handleEndTurn} 
                    disabled={gamePhase === 'setup' ? (!housePlacedThisTurn && !roadPlacedThisTurn) : !diceRoll}
                    className="end-turn-button">End Turn</button>
            </div>
    </div>
    )
}

export default Game;