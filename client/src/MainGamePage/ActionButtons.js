import React from 'react';

function ActionButtons({ 
    gamePhase,
    userId,
    currentTurnUserId,
    diceRoll,
    isRolling,
    handleRollDice,
    buildingHouse,
    buildingRoad,
    buildingCity,
    handleBuildHouse,
    canBuildHouse,
    currentPlayer,
    availableHouseIndicesForBuilding,
    handleBuildRoad,
    canBuildRoad,
    availableRoadIndices,
    handleBuildCity,
    canBuildCity,
    upgradeableSettlements,
    handleBuyDevelopmentCard,
    canBuyDevCard,
    devCardDeckCount,
    handleCancelBuild,
    handleEndTurn,
    housePlacedThisTurn,
    roadPlacedThisTurn,
    handlePlayKnight,
    handlePlayYearOfPlenty,
    handlePlayMonopoly,
    handlePlayRoadBuilding,
    handlePlayVictoryPoint,
    movingRobber,
    buildingFreeRoads,
    devCardPlayedThisTurn,
    newlyPurchasedCards
}) {
    return (
        <div className="action-buttons">
            {/* Roll Dice Button - Only in playing phase */}
            {gamePhase === 'playing' && userId === currentTurnUserId && !movingRobber && !buildingFreeRoads && (
                <button 
                    onClick={handleRollDice} 
                    disabled={diceRoll !== null || isRolling}
                    className="roll-dice-button"
                >
                    {isRolling ? '🎲 Rolling...' : '🎲 Roll Dice'}
                </button>
            )}
            
            {/* Build House Button - Only in playing phase */}
            {gamePhase === 'playing' && userId === currentTurnUserId && !buildingHouse && !buildingRoad && !buildingCity && !movingRobber && !buildingFreeRoads && (
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
                    }
                >
                    🏠 Build House
                </button>
            )}
            
            {/* Build Road Button - Only in playing phase */}
            {gamePhase === 'playing' && userId === currentTurnUserId && !buildingHouse && !buildingRoad && !buildingCity && !movingRobber && !buildingFreeRoads && (
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

            {/* Build City Button - Only in playing phase */}
            {gamePhase === 'playing' && userId === currentTurnUserId && !buildingHouse && !buildingRoad && !buildingCity && !movingRobber && !buildingFreeRoads && (
                <button 
                    onClick={handleBuildCity} 
                    disabled={!canBuildCity()}
                    className="build-city-button"
                    title={
                        !currentPlayer?.resources || 
                        currentPlayer.resources.ore < 3 || 
                        currentPlayer.resources.wheat < 2
                            ? 'Need: 3 Ore, 2 Wheat'
                            : upgradeableSettlements.length === 0
                            ? 'No settlements to upgrade'
                            : 'Upgrade settlement to city'
                    }
                >
                    🏛️ Build City
                </button>
            )}

            {/* Development Card Button */}
            {gamePhase === 'playing' && userId === currentTurnUserId && !movingRobber && !buildingFreeRoads && (
                <button 
                    onClick={handleBuyDevelopmentCard}
                    disabled={!canBuyDevCard()}
                    className="buy-dev-card-button"
                    title={`Need: 1 Ore, 1 Sheep, 1 Wheat (${devCardDeckCount} cards left)`}
                >
                    🃏 Buy Dev Card ({devCardDeckCount})
                </button>
            )}

            {/* Development Card Play Buttons */}
            {gamePhase === 'playing' && userId === currentTurnUserId && !movingRobber && !buildingFreeRoads && (
                <>
                    {/* Play Knight Card Button */}
                    <button 
                        onClick={handlePlayKnight}
                        disabled={
                            !currentPlayer?.developmentCards?.knight || 
                            currentPlayer.developmentCards.knight < 1 || 
                            devCardPlayedThisTurn ||
                            newlyPurchasedCards.knight  // ← ADD THIS
                        }
                        className="play-knight-button"
                        title={
                            newlyPurchasedCards.knight 
                                ? "Dev cards can't be played the turn they're purchased" 
                                : devCardPlayedThisTurn 
                                ? "Only 1 dev card per turn" 
                                : "Play a Knight card to move the robber"
                        }
                    >
                        🗡️ Knight ({currentPlayer?.developmentCards?.knight || 0})
                    </button>

                    {/* Play Year of Plenty Button */}
                    <button 
                        onClick={handlePlayYearOfPlenty}
                        disabled={
                            !currentPlayer?.developmentCards?.yearOfPlenty || 
                            currentPlayer.developmentCards.yearOfPlenty < 1 || 
                            devCardPlayedThisTurn ||
                            newlyPurchasedCards.yearOfPlenty  // ← ADD THIS
                        }
                        className="play-year-button"
                        title={
                            newlyPurchasedCards.yearOfPlenty 
                                ? "Dev cards can't be played the turn they're purchased" 
                                : devCardPlayedThisTurn 
                                ? "Only 1 dev card per turn" 
                                : "Take 2 resources from the bank"
                        }
                    >
                        🎁 Year of Plenty ({currentPlayer?.developmentCards?.yearOfPlenty || 0})
                    </button>

                    {/* Play Monopoly Button */}
                    <button 
                        onClick={handlePlayMonopoly}
                        disabled={
                            !currentPlayer?.developmentCards?.monopoly || 
                            currentPlayer.developmentCards.monopoly < 1 || 
                            devCardPlayedThisTurn ||
                            newlyPurchasedCards.monopoly  // ← ADD THIS
                        }
                        className="play-monopoly-button"
                        title={
                            newlyPurchasedCards.monopoly 
                                ? "Dev cards can't be played the turn they're purchased" 
                                : devCardPlayedThisTurn 
                                ? "Only 1 dev card per turn" 
                                : "Take all of one resource from other players"
                        }
                    >
                        💰 Monopoly ({currentPlayer?.developmentCards?.monopoly || 0})
                    </button>

                    {/* Play Road Building Button */}
                    <button 
                        onClick={handlePlayRoadBuilding}
                        disabled={
                            !currentPlayer?.developmentCards?.roadBuilding || 
                            currentPlayer.developmentCards.roadBuilding < 1 || 
                            devCardPlayedThisTurn ||
                            newlyPurchasedCards.roadBuilding  // ← ADD THIS
                        }
                        className="play-road-building-button"
                        title={
                            newlyPurchasedCards.roadBuilding 
                                ? "Dev cards can't be played the turn they're purchased" 
                                : devCardPlayedThisTurn 
                                ? "Only 1 dev card per turn" 
                                : "Build 2 roads for free"
                        }
                    >
                        🛣️ Road Building ({currentPlayer?.developmentCards?.roadBuilding || 0})
                    </button>

                    {/* Play Victory Point Button */}
                    <button 
                        onClick={handlePlayVictoryPoint}
                        disabled={
                            !currentPlayer?.developmentCards?.victoryPoint || 
                            currentPlayer.developmentCards.victoryPoint < 1 || 
                            devCardPlayedThisTurn ||
                            newlyPurchasedCards.victoryPoint  // ← ADD THIS
                        }
                        className="play-victory-button"
                        title={
                            newlyPurchasedCards.victoryPoint 
                                ? "Dev cards can't be played the turn they're purchased" 
                                : devCardPlayedThisTurn 
                                ? "Only 1 dev card per turn" 
                                : "Reveal a victory point card"
                        }
                    >
                        🏆 Victory Point ({currentPlayer?.developmentCards?.victoryPoint || 0})
                    </button>
                </>
            )}

            {/* Trade Buttons - Only available during playing phase */}
            {gamePhase === 'playing' && userId === currentTurnUserId && !movingRobber && !buildingFreeRoads && (
            <>
                <button 
                onClick={() => setShowPlayerTradeDialog(true)}
                className="trade-button trade-player-button"
                title="Propose a trade with another player"
                >
                💱 Player Trade
                </button>
                
                <button 
                onClick={() => setShowPortTradeDialog(true)}
                className="trade-button trade-port-button"
                title="Trade with the bank using ports"
                >
                🏦 Port Trade
                </button>
            </>
            )}
            
            {/* Cancel Build Button */}
            {gamePhase === 'playing' && (buildingHouse || buildingRoad || buildingCity) && (
                <button 
                    onClick={handleCancelBuild}
                    className="cancel-build-button"
                >
                    ❌ Cancel
                </button>
            )}
            
            {/* End Turn Button */}
            <button 
                onClick={handleEndTurn} 
                disabled={
                    (gamePhase === 'setup' && (!housePlacedThisTurn && !roadPlacedThisTurn)) || 
                    (gamePhase === 'playing' && !diceRoll) ||
                    movingRobber ||
                    buildingFreeRoads
                }
                className="end-turn-button"
            >
                End Turn
            </button>
        </div>
    );
}

export default ActionButtons;