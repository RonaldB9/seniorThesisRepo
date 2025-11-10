import { useState, useEffect } from 'react';
import socket from '../socket';

// Helper function to get adjacent houses
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

export function useGameLogic() {
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
    const [placedCities, setPlacedCities] = useState({});
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [unavailableHouses, setUnavailableHouses] = useState(new Set());
    const [unavailableRoads, setUnavailableRoads] = useState(new Set());
    const [housePlacedThisTurn, setHousePlacedThisTurn] = useState(false);
    const [roadPlacedThisTurn, setRoadPlacedThisTurn] = useState(false);
    const [allPlayers, setAllPlayers] = useState([]);
    const [gamePhase, setGamePhase] = useState('setup');
    const [diceRoll, setDiceRoll] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [buildingHouse, setBuildingHouse] = useState(false);
    const [buildingRoad, setBuildingRoad] = useState(false);
    const [buildingCity, setBuildingCity] = useState(false);
    const [portRoadData, setPortRoadData] = useState([]);
    const [devCardDeckCount, setDevCardDeckCount] = useState(25);
    const [robberTileIndex, setRobberTileIndex] = useState(null);
    const [movingRobber, setMovingRobber] = useState(false);
    const [playersToStealFrom, setPlayersToStealFrom] = useState([]);
    const [showStealDialog, setShowStealDialog] = useState(false);

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

    // Get userId on mount
    useEffect(() => {
        const id = localStorage.getItem('userId');
        setUserId(id);

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
                setPortRoadData(data.portRoadData);
            });

        fetch('http://localhost:3001/api/houses')
            .then((res) => res.json())
            .then((data) => {
                setPlacedHouses(data);
                updateUnavailableHouses(data);
            })
            .catch(err => console.error('Failed to fetch houses:', err));

        fetch('http://localhost:3001/api/roads')
            .then((res) => res.json())
            .then((data) => {
                setPlacedRoads(data);
                updateUnavailableRoads(data);
            })
            .catch(err => console.error('Failed to fetch roads:', err));

        fetch('http://localhost:3001/api/cities')
            .then((res) => res.json())
            .then((data) => {
                setPlacedCities(data);
            })
            .catch(err => console.error('Failed to fetch cities:', err));

        fetch('http://localhost:3001/api/robber')
            .then((res) => res.json())
            .then((data) => {
                setRobberTileIndex(data.tileIndex);
            })
            .catch(err => console.error('Failed to fetch robber:', err));
    }, []);

    // Socket listeners for deck updates
    useEffect(() => {
        const handleDeckUpdate = (data) => {
            setDevCardDeckCount(data.cardsRemaining);
        };

        const handleCardBought = (data) => {
            alert(`You received a ${data.cardType} card!`);
        };

        socket.on('deckUpdate', handleDeckUpdate);
        socket.on('cardBought', handleCardBought);
        
        return () => {
            socket.off('deckUpdate', handleDeckUpdate);
            socket.off('cardBought', handleCardBought);
        };
    }, []);

    // Reset selection when turn changes
    useEffect(() => {
        setSelectedHouseIndex(null);
        setSelectedRoadIndex(null);
        setHousePlacedThisTurn(false);
        setRoadPlacedThisTurn(false);
        setDiceRoll(null);
        setIsRolling(false);
        setBuildingHouse(false);
        setBuildingRoad(false);
        setBuildingCity(false);
        setMovingRobber(false);
        setShowStealDialog(false);
        setPlayersToStealFrom([]);
    }, [currentTurnUserId]);

    // Check if setup phase is complete
    useEffect(() => {
        const totalHouses = Object.keys(placedHouses).length;
        const totalRoads = Object.keys(placedRoads).length;
        const requiredHouses = allPlayers.length * 2;
        const requiredRoads = allPlayers.length * 2;
        
        if (totalHouses >= requiredHouses && totalRoads >= requiredRoads && gamePhase === 'setup' && allPlayers.length > 0) {
            setGamePhase('playing');
        }
    }, [placedHouses, placedRoads, allPlayers.length, gamePhase]);

    // Socket listeners
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

        const handleCityPlaced = (data) => {
            setPlacedCities(prev => ({
                ...prev,
                [data.houseIndex]: data
            }));
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
            
            // If rolled a 7, need to move robber
            if (data.total === 7) {
                setMovingRobber(true);
            }
        };

        const handleRobberMoved = (data) => {
            setRobberTileIndex(data.tileIndex);
            setMovingRobber(false);
            
            // If current player and there are players to steal from
            if (data.userId === userId && data.playersToStealFrom && data.playersToStealFrom.length > 0) {
                setPlayersToStealFrom(data.playersToStealFrom);
                setShowStealDialog(true);
            }
        };

        const handleResourceStolen = (data) => {
            if (data.fromUserId === userId) {
                alert(`${data.thiefName} stole a resource from you!`);
            } else if (data.thief === userId) {
                alert(`You stole ${data.resource} from ${data.fromName}!`);
            }
        };

        const handleDiscardRequired = (data) => {
            if (data.userId === userId) {
                alert(`You rolled a 7! You must discard ${data.cardsToDiscard} cards.`);
                // TODO: Add discard UI
            }
        };

        socket.on('currentTurn', handleCurrentTurn);
        socket.on('housePlaced', handleHousePlaced);
        socket.on('roadPlaced', handleRoadPlaced);
        socket.on('cityPlaced', handleCityPlaced);
        socket.on('playersUpdated', handlePlayersUpdated);
        socket.on('diceRolled', handleDiceRolled);
        socket.on('robberMoved', handleRobberMoved);
        socket.on('resourceStolen', handleResourceStolen);
        socket.on('discardRequired', handleDiscardRequired);
        
        if (socket.connected) {
            socket.emit('requestCurrentTurn');
        }
        
        return () => {
            socket.off('currentTurn', handleCurrentTurn);
            socket.off('housePlaced', handleHousePlaced);
            socket.off('roadPlaced', handleRoadPlaced);
            socket.off('cityPlaced', handleCityPlaced);
            socket.off('playersUpdated', handlePlayersUpdated);
            socket.off('diceRolled', handleDiceRolled);
            socket.off('robberMoved', handleRobberMoved);
            socket.off('resourceStolen', handleResourceStolen);
            socket.off('discardRequired', handleDiscardRequired);
        };
    }, [userId]);

    return {
        resourceTiles,
        resourceTokens,
        houseData,
        roadData,
        currentTurnUserId,
        userId,
        selectedHouseIndex,
        setSelectedHouseIndex,
        selectedRoadIndex,
        setSelectedRoadIndex,
        placedHouses,
        placedRoads,
        placedCities,
        currentPlayer,
        unavailableHouses,
        unavailableRoads,
        housePlacedThisTurn,
        setHousePlacedThisTurn,
        roadPlacedThisTurn,
        setRoadPlacedThisTurn,
        allPlayers,
        gamePhase,
        diceRoll,
        isRolling,
        setIsRolling,
        buildingHouse,
        setBuildingHouse,
        buildingRoad,
        setBuildingRoad,
        buildingCity,
        setBuildingCity,
        portRoadData,
        devCardDeckCount,
        robberTileIndex,
        movingRobber,
        setMovingRobber,
        playersToStealFrom,
        setPlayersToStealFrom,
        showStealDialog,
        setShowStealDialog
    };
}