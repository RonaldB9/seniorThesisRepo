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
    roadPlacedThisTurn
}) {
    return (
        <div className="action-buttons">
            {/* Roll Dice Button - Only in playing phase */}
            {gamePhase === 'playing' && userId === currentTurnUserId && (
                <button 
                    onClick={handleRollDice} 
                    disabled={diceRoll !== null || isRolling}
                    className="roll-dice-button"
                >
                    {isRolling ? '🎲 Rolling...' : '🎲 Roll Dice'}
                </button>
            )}
            
            {/* Build House Button - Only in playing phase */}
            {gamePhase === 'playing' && userId === currentTurnUserId && !buildingHouse && !buildingRoad && !buildingCity && (
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
            {gamePhase === 'playing' && userId === currentTurnUserId && !buildingHouse && !buildingRoad && !buildingCity && (
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
            {gamePhase === 'playing' && userId === currentTurnUserId && !buildingHouse && !buildingRoad && !buildingCity && (
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
            {gamePhase === 'playing' && userId === currentTurnUserId && (
                <button 
                    onClick={handleBuyDevelopmentCard}
                    disabled={!canBuyDevCard()}
                    className="buy-dev-card-button"
                    title={`Need: 1 Ore, 1 Sheep, 1 Wheat (${devCardDeckCount} cards left)`}
                >
                    🃏 Buy Dev Card ({devCardDeckCount})
                </button>
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
                disabled={gamePhase === 'setup' ? (!housePlacedThisTurn && !roadPlacedThisTurn) : !diceRoll}
                className="end-turn-button"
            >
                End Turn
            </button>
        </div>
    );
}

export default ActionButtons;