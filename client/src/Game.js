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
    //const [showhouseOptions, setShowOptions] = useState(0);
    const [currentTurnUserId, setCurrentTurnUserId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [selectedHouseIndex, setSelectedHouseIndex] = useState(null);
    const [placedHouses, setPlacedHouses] = useState({});
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [unavailableHouses, setUnavailableHouses] = useState(new Set());

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
            //setShowOptions(data.houseData.length);
        });

        // Fetch existing placed houses
        fetch('http://localhost:3001/api/houses')
        .then((res) => res.json())
        .then((data) => {
            setPlacedHouses(data);
            updateUnavailableHouses(data);
        })
        .catch(err => console.error('Failed to fetch houses:', err));
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
            unavailable.add(houseIndex); // Add the placed house itself
            
            // Add all adjacent houses
            const adjacent = getAdjacentHouses(houseIndex);
            adjacent.forEach(adj => unavailable.add(adj));
        });
        
        setUnavailableHouses(unavailable);
    };

    // Update house options visibility when turn changes
    useEffect(() => {
        if (userId === currentTurnUserId) {
            //setShowOptions(houseData.length);
            setSelectedHouseIndex(null); // Reset selection on new turn
        }
    }, [currentTurnUserId, houseData.length, userId]);

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

        // Listen for currentTurn events
        socket.on('currentTurn', handleCurrentTurn);
        socket.on('housePlaced', handleHousePlaced);
        
        // Also request current turn on connect
        if (socket.connected) {
            console.log("📌 Requesting current turn...");
            socket.emit('requestCurrentTurn', (response) => {
                console.log("📤 Got response:", response);
            });
        }
        
        return () => {
            socket.off('currentTurn', handleCurrentTurn);
            socket.off('housePlaced', handleHousePlaced);
        };
    }, []);

    const handleHouseClick = (index) => {
        if (userId === currentTurnUserId && selectedHouseIndex === null) {
            setSelectedHouseIndex(index);
            console.log(`🏠 Selected house ${index} at position:`, houseData[index]);
            
            // Emit to server
            socket.emit('houseSelected', {
                userId,
                houseIndex: index,
                position: houseData[index]
            });
        }
    };

    const handleClick = () => {
        
        if (userId && currentTurnUserId && userId === currentTurnUserId) {
            console.log("✅ Emitting endTurn");
            socket.emit('endTurn');
            setSelectedHouseIndex(null); // Reset selection
        } else {
            console.log("❌ Not your turn or userId not set");
        }
    };

    return (
    <div className="background">
        <div className="images">
          <img src={catanTitle} alt="Catan Title"/>
        </div>
        {userId === currentTurnUserId && (
            <div className="your-turn-banner">🎯 Your Turn! {selectedHouseIndex !== null && `(House ${selectedHouseIndex} selected)`}</div>
        )}
        <h1 className="title">Game</h1>

        <div className="tiles-container">
        {resourceTiles.length > 1 && (
            <>
            {/* 1st Row */}
            <div className="tiles-row">
                {/* 0th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[0]]} alt={resourceTiles[0]}/>
                    {resourceTokens[0] && ( <span className="token">{resourceTokens[0]}</span>)}
                </span>

                {/* 1st Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[1]]} alt={resourceTiles[1]}/>
                    {resourceTokens[1] && ( <span className="token">{resourceTokens[1]}</span>)}
                </span>

                {/* 2nd Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[2]]} alt={resourceTiles[2]}/>
                    {resourceTokens[2] && ( <span className="token">{resourceTokens[2]}</span>)}
                </span>
            </div>

            {/* 2nd Row */}
            <div className="tiles-row">
                {/* 11th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[11]]} alt={resourceTiles[11]}/>
                    {resourceTokens[11] && ( <span className="token">{resourceTokens[11]}</span>)}
                </span>

                {/* 12th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[12]]} alt={resourceTiles[12]}/>
                    {resourceTokens[12] && ( <span className="token">{resourceTokens[12]}</span>)}
                </span>

                {/* 13th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[13]]} alt={resourceTiles[13]}/>
                    {resourceTokens[13] && ( <span className="token">{resourceTokens[13]}</span>)}
                </span>

                {/* 3rd Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[3]]} alt={resourceTiles[3]}/>
                    {resourceTokens[3] && ( <span className="token">{resourceTokens[3]}</span>)}
                </span>
            </div>

            {/* 3rd Row */}
            <div className="tiles-row">
                {/* 10th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[10]]} alt={resourceTiles[10]}/>
                    {resourceTokens[10] && ( <span className="token">{resourceTokens[10]}</span>)}
                </span>

                {/* 17th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[17]]} alt={resourceTiles[17]}/>
                    {resourceTokens[17] && ( <span className="token">{resourceTokens[17]}</span>)}
                </span>

                {/* 18th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[18]]} alt={resourceTiles[18]}/>
                    {resourceTokens[18] && ( <span className="token">{resourceTokens[18]}</span>)}
                </span>

                {/* 14th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[14]]} alt={resourceTiles[14]}/>
                    {resourceTokens[14] && ( <span className="token">{resourceTokens[14]}</span>)}
                </span>

                {/* 4th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[4]]} alt={resourceTiles[4]}/>
                    {resourceTokens[4] && ( <span className="token">{resourceTokens[4]}</span>)}
                </span>
            </div>

            {/* 4th Row */}
            <div className="tiles-row">
                {/* 9th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[9]]} alt={resourceTiles[9]}/>
                    {resourceTokens[9] && ( <span className="token">{resourceTokens[9]}</span>)}
                </span>

                {/* 16th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[16]]} alt={resourceTiles[16]}/>
                    {resourceTokens[16] && ( <span className="token">{resourceTokens[16]}</span>)}
                </span>

                {/* 15th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[15]]} alt={resourceTiles[15]}/>
                    {resourceTokens[15] && ( <span className="token">{resourceTokens[15]}</span>)}
                </span>

                {/* 5th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[5]]} alt={resourceTiles[5]}/>
                    {resourceTokens[5] && ( <span className="token">{resourceTokens[5]}</span>)}
                </span>
            </div>

            {/* 5th Row */}
            <div className="tiles-row">
                {/* 8th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[8]]} alt={resourceTiles[8]}/>
                    {resourceTokens[8] && ( <span className="token">{resourceTokens[8]}</span>)}
                </span>

                {/* 7th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[7]]} alt={resourceTiles[7]}/>
                    {resourceTokens[7] && ( <span className="token">{resourceTokens[7]}</span>)}
                </span>

                {/* 6th Tile */}
                <span className="tile">
                    <img className="tiles" src={resourceImages[resourceTiles[6]]} alt={resourceTiles[6]}/>
                    {resourceTokens[6] && ( <span className="token">{resourceTokens[6]}</span>)}
                </span>
            </div>
            
            {/* Show house options */}
            {userId === currentTurnUserId && Array.isArray(houseData) && houseData.map((house, index) => (
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

            {/* Show placed houses */}
            {Array.isArray(houseData) && Object.entries(placedHouses).map(([index, house]) => (
                <img 
                    key={`placed-${index}`}
                    src={house.playerName === 'Player 1' ? redHouse : greenHouse}
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
                    }}
                />
            ))}
            
            {/*End Turn Button*/}
            <div className="endTurnDiv">
                <button onClick={handleClick}>End Turn</button>
            </div>

            </>
        )}
        </div>
    </div>
    )
}

export default Game;