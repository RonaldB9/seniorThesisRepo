import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/App.css';
import '../css/Game.css'; 
import '../css/Robber.css';
import '../css/DevelopmentCards.css'; 
import '../css/ActionButtons.css'; 
import '../css/VictoryPopup.css';
import socket from '../socket';
import { useGameLogic } from './useGameLogic';
import GameBoard from './GameBoard';
import Scoreboard from './Scoreboard';
import ActionButtons from './ActionButtons';
import DiscardDialog from './DiscardDialog';
import VictoryPopup from './VictoryPopup';
import { YearOfPlentyDialog, MonopolyDialog, RoadBuildingDialog } from './DevelopmentCardDialogs';

function Game() {
    const navigate = useNavigate();
    const gameState = useGameLogic();
    
    const [showVictoryPopup, setShowVictoryPopup] = useState(false);
    const [victoryData, setVictoryData] = useState(null);
    
    const {
        resourceTiles, resourceTokens, houseData, roadData, currentTurnUserId, userId,
        selectedHouseIndex, setSelectedHouseIndex, selectedRoadIndex, setSelectedRoadIndex,
        placedHouses, placedRoads, placedCities, currentPlayer, unavailableHouses, unavailableRoads,
        housePlacedThisTurn, setHousePlacedThisTurn, roadPlacedThisTurn, setRoadPlacedThisTurn,
        allPlayers, gamePhase, diceRoll, isRolling, setIsRolling,
        buildingHouse, setBuildingHouse, buildingRoad, setBuildingRoad, buildingCity, setBuildingCity,
        portRoadData, devCardDeckCount, robberTileIndex, movingRobber, setMovingRobber,
        playersToStealFrom, setPlayersToStealFrom, showStealDialog, setShowStealDialog,
        needsToDiscard, setNeedsToDiscard, cardsToDiscard, showYearOfPlentyDialog, setShowYearOfPlentyDialog,
        showMonopolyDialog, setShowMonopolyDialog, showRoadBuildingDialog, setShowRoadBuildingDialog,
        buildingFreeRoads, setBuildingFreeRoads, freeRoadsRemaining, setFreeRoadsRemaining, largestArmyPlayer
    } = gameState;

    // Listen for game won event
    useEffect(() => {
        const handleGameWon = (data) => {
            console.log(`🎉 Game won by ${data.winnerName}!`);
            setVictoryData({
                winnerName: data.winnerName,
                winnerColor: data.winnerColor,
                finalScore: data.finalScore
            });
            setShowVictoryPopup(true);
        };

        socket.on('gameWon', handleGameWon);

        return () => {
            socket.off('gameWon', handleGameWon);
        };
    }, [navigate]);

    const handleReturnToLobby = () => {
        setShowVictoryPopup(false);
        navigate('/');
    };

    const handleHouseClick = (index) => {
        // Setup phase logic
        if (userId === currentTurnUserId && selectedHouseIndex === null && !housePlacedThisTurn && gamePhase === 'setup') {
            setSelectedHouseIndex(index);
            setHousePlacedThisTurn(true);
            socket.emit('houseSelected', {
                userId,
                houseIndex: index,
                position: houseData[index]
            });
        }
        
        // Playing phase logic - building house
        if (userId === currentTurnUserId && buildingHouse && gamePhase === 'playing') {
            setSelectedHouseIndex(index);
            socket.emit('buildHouse', {
                userId,
                houseIndex: index,
                position: houseData[index]
            });
            setBuildingHouse(false);
        }

        // Playing phase logic - upgrading to city
        if (userId === currentTurnUserId && buildingCity && gamePhase === 'playing') {
            socket.emit('buildCity', {
                userId,
                houseIndex: index,
                position: houseData[index]
            });
            setBuildingCity(false);
        }
    };

    const handleRoadClick = (index) => {
        // Setup phase logic
        if (userId === currentTurnUserId && selectedRoadIndex === null && !roadPlacedThisTurn && gamePhase === 'setup') {
            setSelectedRoadIndex(index);
            setRoadPlacedThisTurn(true);
            socket.emit('roadSelected', {
                userId,
                roadIndex: index,
                position: roadData[index]
            });
        }
        
        // Playing phase logic - building road (paid)
        if (userId === currentTurnUserId && buildingRoad && !buildingFreeRoads && gamePhase === 'playing') {
            setSelectedRoadIndex(index);
            socket.emit('buildRoad', {
                userId,
                roadIndex: index,
                position: roadData[index]
            });
            setBuildingRoad(false);
        }
        
        // Road Building card - free roads
        if (userId === currentTurnUserId && buildingFreeRoads && freeRoadsRemaining > 0 && gamePhase === 'playing') {
            setSelectedRoadIndex(index);
            socket.emit('buildFreeRoad', {
                userId,
                roadIndex: index,
                position: roadData[index]
            });
            setFreeRoadsRemaining(prev => {
                const newCount = prev - 1;
                if (newCount === 0) {
                    setBuildingFreeRoads(false);
                }
                return newCount;
            });
        }
    };

    const handleTileClick = (tileIndex) => {
        if (!movingRobber || userId !== currentTurnUserId || tileIndex === robberTileIndex) {
            return;
        }

        console.log(`Moving robber to tile ${tileIndex}`);
        socket.emit('moveRobber', {
            userId,
            tileIndex
        });
        setMovingRobber(false);
    };

    const handleStealFrom = (targetUserId) => {
        socket.emit('stealResource', {
            thiefUserId: userId,
            victimUserId: targetUserId
        });
        setShowStealDialog(false);
        setPlayersToStealFrom([]);
    };

    const handleDiscard = (selectedCards) => {
        socket.emit('discardCards', {
            userId,
            cards: selectedCards
        });
        setNeedsToDiscard(false);
    };

    const handleEndTurn = () => {
        if (userId && currentTurnUserId && userId === currentTurnUserId) {
            socket.emit('endTurn');
            setSelectedHouseIndex(null);
            setSelectedRoadIndex(null);
            setHousePlacedThisTurn(false);
            setRoadPlacedThisTurn(false);
            setBuildingHouse(false);
            setBuildingRoad(false);
            setBuildingCity(false);
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
        }
    };

    const handleBuildRoad = () => {
        if (userId === currentTurnUserId && gamePhase === 'playing' && canBuildRoad()) {
            setBuildingRoad(true);
        }
    };

    const handleBuildCity = () => {
        if (userId === currentTurnUserId && gamePhase === 'playing' && canBuildCity()) {
            setBuildingCity(true);
        }
    };

    const handleCancelBuild = () => {
        setBuildingHouse(false);
        setBuildingRoad(false);
        setBuildingCity(false);
    };

    const handleBuyDevelopmentCard = () => {
        if (userId === currentTurnUserId && gamePhase === 'playing' && canBuyDevCard()) {
            socket.emit('buyDevelopmentCard', { userId });
        }
    };

    const handlePlayKnight = () => {
        if (userId === currentTurnUserId && gamePhase === 'playing' && currentPlayer?.developmentCards?.knight > 0) {
            socket.emit('playKnight', { userId });
            setMovingRobber(true);
        }
    };

    const canBuildHouse = () => {
        if (!currentPlayer || !currentPlayer.resources) return false;
        const { wood, wheat, brick, sheep } = currentPlayer.resources;
        const hasResources = wood >= 1 && wheat >= 1 && brick >= 1 && sheep >= 1;
        const hasAvailableSpots = availableHouseIndicesForBuilding.length > 0;
        return hasResources && hasAvailableSpots;
    };

    const canBuildRoad = () => {
        if (!currentPlayer || !currentPlayer.resources) return false;
        const { wood, brick } = currentPlayer.resources;
        const hasResources = wood >= 1 && brick >= 1;
        const hasAvailableSpots = availableRoadIndices.length > 0;
        return hasResources && hasAvailableSpots;
    };

    const canBuildCity = () => {
        if (!currentPlayer || !currentPlayer.resources) return false;
        const { ore, wheat } = currentPlayer.resources;
        const hasResources = ore >= 3 && wheat >= 2;
        const hasSettlementsToUpgrade = getUpgradeableSettlements().length > 0;
        return hasResources && hasSettlementsToUpgrade;
    };

    const canBuyDevCard = () => {
        if (!currentPlayer || !currentPlayer.resources) return false;
        const { ore, sheep, wheat } = currentPlayer.resources;
        return ore >= 1 && sheep >= 1 && wheat >= 1 && devCardDeckCount > 0;
    };

    const getUpgradeableSettlements = () => {
        const userSettlements = Object.entries(placedHouses)
            .filter(([index, house]) => 
                house.userId === userId && !placedCities[index]
            )
            .map(([index, _]) => parseInt(index));
        return userSettlements;
    };

    const handlePlayYearOfPlenty = () => {
        if (userId === currentTurnUserId && currentPlayer?.developmentCards?.yearOfPlenty > 0) {
            setShowYearOfPlentyDialog(true);
        }
    };

    const handleConfirmYearOfPlenty = (resources) => {
        socket.emit('playYearOfPlenty', { userId, resources });
        setShowYearOfPlentyDialog(false);
    };

    const handlePlayMonopoly = () => {
        if (userId === currentTurnUserId && currentPlayer?.developmentCards?.monopoly > 0) {
            setShowMonopolyDialog(true);
        }
    };

    const handleConfirmMonopoly = (resource) => {
        socket.emit('playMonopoly', { userId, resource });
        setShowMonopolyDialog(false);
    };

    const handlePlayRoadBuilding = () => {
        if (userId === currentTurnUserId && currentPlayer?.developmentCards?.roadBuilding > 0) {
            setShowRoadBuildingDialog(true);
        }
    };

    const handleConfirmRoadBuilding = () => {
        socket.emit('playRoadBuilding', { userId });
        setShowRoadBuildingDialog(false);
        setBuildingFreeRoads(true);
        setFreeRoadsRemaining(2);
    };

    const handlePlayVictoryPoint = () => {
        if (userId === currentTurnUserId && currentPlayer?.developmentCards?.victoryPoint > 0) {
            if (window.confirm('Reveal a Victory Point card? This will add 1 point to your score.')) {
                socket.emit('playVictoryPoint', { userId });
            }
        }
    };

    const housesPlacedByCurrentUser = Object.values(placedHouses).filter(
        house => house.userId === userId
    ).length;

    const roadsPlacedByCurrentUser = Object.values(placedRoads).filter(
        road => road.userId === userId
    ).length;

    const currentUserHouseIndices = Object.entries(placedHouses)
        .filter(([_, house]) => house.userId === userId)
        .map(([index, _]) => parseInt(index));

    const currentUserRoadIndices = Object.entries(placedRoads)
        .filter(([_, road]) => road.userId === userId)
        .map(([index, _]) => parseInt(index));

    const getAvailableRoadsForUser = () => {
        if (currentUserHouseIndices.length === 0) return [];
        
        return roadData.reduce((availableRoads, road, roadIndex) => {
            const isConnectedToUserHouse = road.connectedHouses?.some(houseIndex => 
                currentUserHouseIndices.includes(houseIndex)
            );
            
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
    const upgradeableSettlements = getUpgradeableSettlements();

    return (
        <div className="backgroundGame">
            
            {/* Victory Popup */}
            {showVictoryPopup && victoryData && (
                <VictoryPopup
                    winnerName={victoryData.winnerName}
                    winnerColor={victoryData.winnerColor}
                    finalScore={victoryData.finalScore}
                    onClose={handleReturnToLobby}
                />
            )}

            <div
                className={`your-turn-banner ${
                    userId === currentTurnUserId ? 'your-turn' : 'not-your-turn'
                }`}
                >
                {userId === currentTurnUserId ? (
                    <>
                    🎯 Your Turn!
                    {gamePhase === 'setup' && selectedHouseIndex !== null && ` (House ${selectedHouseIndex} selected)`}
                    {gamePhase === 'setup' && selectedRoadIndex !== null && ` (Road ${selectedRoadIndex} selected)`}
                    {gamePhase === 'playing' && !diceRoll && ' Roll the dice!'}
                    {gamePhase === 'playing' && diceRoll && ` Rolled: ${diceRoll.total}`}
                    {buildingHouse && ' - Select a spot for your house'}
                    {buildingRoad && ' - Select a spot for your road'}
                    {buildingFreeRoads && ` - Place ${freeRoadsRemaining} free road(s)`}
                    {buildingCity && ' - Select a settlement to upgrade'}
                    {movingRobber && ' - Select a tile to move the robber'}
                    </>
                ) : (
                    <>⏳ Not your turn</>
                )}
            </div>

            <Scoreboard 
                allPlayers={allPlayers} 
                userId={userId} 
                currentTurnUserId={currentTurnUserId} 
                largestArmyPlayer={largestArmyPlayer}
            />

            {gamePhase === 'playing' && diceRoll && (
                <div className="dice-display">
                    <div className="dice-container">
                        <div className="die">{diceRoll.die1}</div>
                        <div className="die">{diceRoll.die2}</div>
                    </div>
                    <div className="dice-total">Total: {diceRoll.total}</div>
                    {diceRoll.total === 7 && (
                        <div className="robber-message">Move the Robber! 🦹</div>
                    )}
                </div>
            )}

            {/* Discard Dialog */}
            {needsToDiscard && currentPlayer && (
                <DiscardDialog
                    currentPlayer={currentPlayer}
                    cardsToDiscard={cardsToDiscard}
                    onDiscard={handleDiscard}
                    onCancel={() => setNeedsToDiscard(false)}
                />
            )}

            {/* Steal Dialog */}
            {showStealDialog && playersToStealFrom.length > 0 && (
                <div className="steal-dialog-overlay">
                    <div className="steal-dialog">
                        <h3>Choose a player to steal from:</h3>
                        <div className="steal-options">
                            {playersToStealFrom.map((player) => (
                                <button 
                                    key={player.userId}
                                    onClick={() => handleStealFrom(player.userId)}
                                    className="steal-player-button"
                                    style={{ borderColor: player.color }}
                                >
                                    <span style={{ color: player.color, fontWeight: 'bold' }}>
                                        {player.name}
                                    </span>
                                    <span className="steal-card-count">
                                        ({player.totalCards} cards)
                                    </span>
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => {
                                setShowStealDialog(false);
                                setPlayersToStealFrom([]);
                            }}
                            className="steal-cancel-button"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Year of Plenty Dialog */}
            {showYearOfPlentyDialog && (
                <YearOfPlentyDialog
                    onConfirm={handleConfirmYearOfPlenty}
                    onCancel={() => setShowYearOfPlentyDialog(false)}
                />
            )}

            {/* Monopoly Dialog */}
            {showMonopolyDialog && (
                <MonopolyDialog
                    onConfirm={handleConfirmMonopoly}
                    onCancel={() => setShowMonopolyDialog(false)}
                />
            )}

            {/* Road Building Dialog */}
            {showRoadBuildingDialog && (
                <RoadBuildingDialog
                    onConfirm={handleConfirmRoadBuilding}
                    onCancel={() => setShowRoadBuildingDialog(false)}
                />
            )}

            <GameBoard
                resourceTiles={resourceTiles}
                resourceTokens={resourceTokens}
                houseData={houseData}
                roadData={roadData}
                portRoadData={portRoadData}
                placedHouses={placedHouses}
                placedRoads={placedRoads}
                placedCities={placedCities}
                gamePhase={gamePhase}
                userId={userId}
                currentTurnUserId={currentTurnUserId}
                housePlacedThisTurn={housePlacedThisTurn}
                selectedHouseIndex={selectedHouseIndex}
                unavailableHouses={unavailableHouses}
                handleHouseClick={handleHouseClick}
                buildingHouse={buildingHouse}
                availableHouseIndicesForBuilding={availableHouseIndicesForBuilding}
                buildingCity={buildingCity}
                upgradeableSettlements={upgradeableSettlements}
                housesPlacedByCurrentUser={housesPlacedByCurrentUser}
                roadsPlacedByCurrentUser={roadsPlacedByCurrentUser}
                roadPlacedThisTurn={roadPlacedThisTurn}
                selectedRoadIndex={selectedRoadIndex}
                unavailableRoads={unavailableRoads}
                availableRoadIndices={availableRoadIndices}
                handleRoadClick={handleRoadClick}
                buildingRoad={buildingRoad}
                robberTileIndex={robberTileIndex}
                movingRobber={movingRobber}
                handleTileClick={handleTileClick}
                buildingFreeRoads={buildingFreeRoads}
                freeRoadsRemaining={freeRoadsRemaining}
            />

            <ActionButtons
                gamePhase={gamePhase}
                userId={userId}
                currentTurnUserId={currentTurnUserId}
                diceRoll={diceRoll}
                isRolling={isRolling}
                handleRollDice={handleRollDice}
                buildingHouse={buildingHouse}
                buildingRoad={buildingRoad}
                buildingCity={buildingCity}
                handleBuildHouse={handleBuildHouse}
                canBuildHouse={canBuildHouse}
                currentPlayer={currentPlayer}
                availableHouseIndicesForBuilding={availableHouseIndicesForBuilding}
                handleBuildRoad={handleBuildRoad}
                canBuildRoad={canBuildRoad}
                availableRoadIndices={availableRoadIndices}
                handleBuildCity={handleBuildCity}
                canBuildCity={canBuildCity}
                upgradeableSettlements={upgradeableSettlements}
                handleBuyDevelopmentCard={handleBuyDevelopmentCard}
                canBuyDevCard={canBuyDevCard}
                devCardDeckCount={devCardDeckCount}
                handleCancelBuild={handleCancelBuild}
                handleEndTurn={handleEndTurn}
                housePlacedThisTurn={housePlacedThisTurn}
                roadPlacedThisTurn={roadPlacedThisTurn}
                handlePlayKnight={handlePlayKnight}
                movingRobber={movingRobber}
                handlePlayYearOfPlenty={handlePlayYearOfPlenty}
                handlePlayMonopoly={handlePlayMonopoly}
                handlePlayRoadBuilding={handlePlayRoadBuilding}
                handlePlayVictoryPoint={handlePlayVictoryPoint}
                buildingFreeRoads={buildingFreeRoads}
            />
        </div>
        
    );
}

export default Game;