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
    newlyPurchasedCards,
    showPlayerTradeDialog,
    setShowPlayerTradeDialog,
    showPortTradeDialog,
    setShowPortTradeDialog
}) {
    // Check if it's the current player's turn
    const isMyTurn = userId === currentTurnUserId;
    
    // Check if dice have been rolled (only relevant in playing phase)
    const hasDiceRoll = gamePhase === 'playing' ? diceRoll !== null : true;

    // Don't show action buttons container at all if not your turn
    if (!isMyTurn) {
        return null;
    }

    return (
        <div className="action-buttons">
            {/* Roll Dice Button - Only in playing phase */}
            {gamePhase === 'playing' && isMyTurn && !movingRobber && !buildingFreeRoads && (
                <button 
                    onClick={handleRollDice} 
                    disabled={diceRoll !== null || isRolling}
                    className="roll-dice-button"
                >
                    {isRolling ? '🎲 Rolling...' : '🎲 Roll Dice'}
                </button>
            )}
            
            {/* Build House Button - Only in playing phase, disabled until dice rolled */}
            {gamePhase === 'playing' && isMyTurn && !buildingHouse && !buildingRoad && !buildingCity && !movingRobber && !buildingFreeRoads && (
                <button 
                    onClick={handleBuildHouse} 
                    disabled={!hasDiceRoll || !canBuildHouse()}
                    className="build-house-button"
                    title={
                        !hasDiceRoll
                            ? 'Roll dice first'
                            : !currentPlayer?.resources || 
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
            
            {/* Build Road Button - Only in playing phase, disabled until dice rolled */}
            {gamePhase === 'playing' && isMyTurn && !buildingHouse && !buildingRoad && !buildingCity && !movingRobber && !buildingFreeRoads && (
                <button 
                    onClick={handleBuildRoad} 
                    disabled={!hasDiceRoll || !canBuildRoad()}
                    className="build-road-button"
                    title={
                        !hasDiceRoll
                            ? 'Roll dice first'
                            : !currentPlayer?.resources || 
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

            {/* Build City Button - Only in playing phase, disabled until dice rolled */}
            {gamePhase === 'playing' && isMyTurn && !buildingHouse && !buildingRoad && !buildingCity && !movingRobber && !buildingFreeRoads && (
                <button 
                    onClick={handleBuildCity} 
                    disabled={!hasDiceRoll || !canBuildCity()}
                    className="build-city-button"
                    title={
                        !hasDiceRoll
                            ? 'Roll dice first'
                            : !currentPlayer?.resources || 
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

            {/* Development Card Button - disabled until dice rolled */}
            {gamePhase === 'playing' && isMyTurn && !movingRobber && !buildingFreeRoads && (
                <button 
                    onClick={handleBuyDevelopmentCard}
                    disabled={!hasDiceRoll || !canBuyDevCard()}
                    className="buy-dev-card-button"
                    title={
                        !hasDiceRoll
                            ? 'Roll dice first'
                            : `Need: 1 Ore, 1 Sheep, 1 Wheat (${devCardDeckCount} cards left)`
                    }
                >
                    🃏 Buy Dev Card ({devCardDeckCount})
                </button>
            )}

            {/* Development Card Play Buttons - disabled until dice rolled */}
            {gamePhase === 'playing' && isMyTurn && !movingRobber && !buildingFreeRoads && (
                <>
                    {/* Play Knight Card Button */}
                    <button 
                        onClick={handlePlayKnight}
                        disabled={
                            !hasDiceRoll ||
                            !currentPlayer?.developmentCards?.knight || 
                            currentPlayer.developmentCards.knight < 1 || 
                            devCardPlayedThisTurn ||
                            newlyPurchasedCards.knight
                        }
                        className="play-knight-button"
                        title={
                            !hasDiceRoll
                                ? 'Roll dice first'
                                : newlyPurchasedCards.knight 
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
                            !hasDiceRoll ||
                            !currentPlayer?.developmentCards?.yearOfPlenty || 
                            currentPlayer.developmentCards.yearOfPlenty < 1 || 
                            devCardPlayedThisTurn ||
                            newlyPurchasedCards.yearOfPlenty
                        }
                        className="play-year-button"
                        title={
                            !hasDiceRoll
                                ? 'Roll dice first'
                                : newlyPurchasedCards.yearOfPlenty 
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
                            !hasDiceRoll ||
                            !currentPlayer?.developmentCards?.monopoly || 
                            currentPlayer.developmentCards.monopoly < 1 || 
                            devCardPlayedThisTurn ||
                            newlyPurchasedCards.monopoly
                        }
                        className="play-monopoly-button"
                        title={
                            !hasDiceRoll
                                ? 'Roll dice first'
                                : newlyPurchasedCards.monopoly 
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
                            !hasDiceRoll ||
                            !currentPlayer?.developmentCards?.roadBuilding || 
                            currentPlayer.developmentCards.roadBuilding < 1 || 
                            devCardPlayedThisTurn ||
                            newlyPurchasedCards.roadBuilding
                        }
                        className="play-road-building-button"
                        title={
                            !hasDiceRoll
                                ? 'Roll dice first'
                                : newlyPurchasedCards.roadBuilding 
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
                            !hasDiceRoll ||
                            !currentPlayer?.developmentCards?.victoryPoint || 
                            currentPlayer.developmentCards.victoryPoint < 1 || 
                            devCardPlayedThisTurn ||
                            newlyPurchasedCards.victoryPoint
                        }
                        className="play-victory-button"
                        title={
                            !hasDiceRoll
                                ? 'Roll dice first'
                                : newlyPurchasedCards.victoryPoint 
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

            {/* Trade Buttons - Only available during playing phase, disabled until dice rolled */}
            {gamePhase === 'playing' && isMyTurn && !movingRobber && !buildingFreeRoads && (
            <>
                <button 
                onClick={() => setShowPlayerTradeDialog(true)}
                disabled={!hasDiceRoll}
                className="trade-button trade-player-button"
                title={!hasDiceRoll ? 'Roll dice first' : 'Propose a trade with another player'}
                >
                💱 Player Trade
                </button>
                
                <button 
                onClick={() => setShowPortTradeDialog(true)}
                disabled={!hasDiceRoll}
                className="trade-button trade-port-button"
                title={!hasDiceRoll ? 'Roll dice first' : 'Trade with the bank using ports'}
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
            
            {/* End Turn Button - only show for current player */}
            {isMyTurn && (
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
            )}
        </div>
    );
}

export default ActionButtons;