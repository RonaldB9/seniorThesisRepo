import React from 'react';
import brickTile from '../Images/Tiles/brickTile.png';
import oreTile from '../Images/Tiles/oreTile.png';
import woodTile from '../Images/Tiles/woodTile.png';
import sheepTile from '../Images/Tiles/sheepTile.png';
import wheatTile from '../Images/Tiles/wheatTile.png';
import desertTile from '../Images/Tiles/desertTile.png';
import chooseCircle from '../Images/chooseCircle.png';
import redHouse from '../Images/Houses/redHouse.png';
import greenHouse from '../Images/Houses/greenHouse.png';
import greenRoad from '../Images/greenRoad.png';
import redRoad from '../Images/redRoad.png';
import blueRoad from '../Images/blueRoad.png';
import portRoad from '../Images/Ports/portRoad.png';
import robber from '../Images/robber.jpg';
import ThreetoOnePort from '../Images/Ports/3to1Port.jpg';
import TwotoOneBrick from '../Images/Ports/2To1Brick.jpg';
import TwotoOneSheep from '../Images/Ports/2To1Sheep.jpg';
import TwotoOneStone from '../Images/Ports/2To1Stone.jpg';
import TwotoOneWood from '../Images/Ports/2To1Wood.jpg';
import TwotoOneWheat from '../Images/Ports/2To1Wheat.jpg';

const resourceImages = {
    Brick: brickTile,
    Ore: oreTile,
    Wood: woodTile,
    Sheep: sheepTile,
    Wheat: wheatTile,
    Desert: desertTile
};

function GameBoard({ 
    resourceTiles, 
    resourceTokens,
    houseData,
    roadData,
    portRoadData,
    placedHouses,
    placedRoads,
    placedCities,
    gamePhase,
    userId,
    currentTurnUserId,
    housePlacedThisTurn,
    selectedHouseIndex,
    unavailableHouses,
    handleHouseClick,
    buildingHouse,
    availableHouseIndicesForBuilding,
    buildingCity,
    upgradeableSettlements,
    housesPlacedByCurrentUser,
    roadsPlacedByCurrentUser,
    roadPlacedThisTurn,
    selectedRoadIndex,
    unavailableRoads,
    availableRoadIndices,
    handleRoadClick,
    buildingRoad,
    robberTileIndex,
    movingRobber,
    handleTileClick
}) {
    return (
        <div className="tiles-container">
            {resourceTiles.length > 1 && (
                <>
                {/* Resource Tiles - 5 Rows */}
                <div className="tiles-row">
                    {[0, 1, 2].map(i => (
                        <span 
                            key={i} 
                            className={`tile ${movingRobber && userId === currentTurnUserId && robberTileIndex !== i ? 'tile-selectable' : ''}`}
                            onClick={() => movingRobber && userId === currentTurnUserId && handleTileClick && handleTileClick(i)}
                            style={{ cursor: movingRobber && userId === currentTurnUserId && robberTileIndex !== i ? 'pointer' : 'default' }}
                        >
                            <img className="tiles" src={resourceImages[resourceTiles[i]]} alt={resourceTiles[i]}/>
                            {resourceTokens[i] && robberTileIndex !== i && <span className="token">{resourceTokens[i]}</span>}
                            {robberTileIndex === i && (
                                <img 
                                    src={robber} 
                                    alt="Robber" 
                                    className="robber-icon"
                                />
                            )}
                        </span>
                    ))}
                </div>

                <div className="tiles-row">
                    {[11, 12, 13, 3].map(i => (
                        <span 
                            key={i} 
                            className={`tile ${movingRobber && userId === currentTurnUserId && robberTileIndex !== i ? 'tile-selectable' : ''}`}
                            onClick={() => movingRobber && userId === currentTurnUserId && handleTileClick && handleTileClick(i)}
                            style={{ cursor: movingRobber && userId === currentTurnUserId && robberTileIndex !== i ? 'pointer' : 'default' }}
                        >
                            <img className="tiles" src={resourceImages[resourceTiles[i]]} alt={resourceTiles[i]}/>
                            {resourceTokens[i] && robberTileIndex !== i && <span className="token">{resourceTokens[i]}</span>}
                            {robberTileIndex === i && (
                                <img 
                                    src={robber} 
                                    alt="Robber" 
                                    className="robber-icon"
                                />
                            )}
                        </span>
                    ))}
                </div>

                <div className="tiles-row">
                    {[10, 17, 18, 14, 4].map(i => (
                        <span 
                            key={i} 
                            className={`tile ${movingRobber && userId === currentTurnUserId && robberTileIndex !== i ? 'tile-selectable' : ''}`}
                            onClick={() => movingRobber && userId === currentTurnUserId && handleTileClick && handleTileClick(i)}
                            style={{ cursor: movingRobber && userId === currentTurnUserId && robberTileIndex !== i ? 'pointer' : 'default' }}
                        >
                            <img className="tiles" src={resourceImages[resourceTiles[i]]} alt={resourceTiles[i]}/>
                            {resourceTokens[i] && robberTileIndex !== i && <span className="token">{resourceTokens[i]}</span>}
                            {robberTileIndex === i && (
                                <img 
                                    src={robber} 
                                    alt="Robber" 
                                    className="robber-icon"
                                />
                            )}
                        </span>
                    ))}
                </div>

                <div className="tiles-row">
                    {[9, 16, 15, 5].map(i => (
                        <span 
                            key={i} 
                            className={`tile ${movingRobber && userId === currentTurnUserId && robberTileIndex !== i ? 'tile-selectable' : ''}`}
                            onClick={() => movingRobber && userId === currentTurnUserId && handleTileClick && handleTileClick(i)}
                            style={{ cursor: movingRobber && userId === currentTurnUserId && robberTileIndex !== i ? 'pointer' : 'default' }}
                        >
                            <img className="tiles" src={resourceImages[resourceTiles[i]]} alt={resourceTiles[i]}/>
                            {resourceTokens[i] && robberTileIndex !== i && <span className="token">{resourceTokens[i]}</span>}
                            {robberTileIndex === i && (
                                <img 
                                    src={robber} 
                                    alt="Robber" 
                                    className="robber-icon"
                                />
                            )}
                        </span>
                    ))}
                </div>

                <div className="tiles-row">
                    {[8, 7, 6].map(i => (
                        <span 
                            key={i} 
                            className={`tile ${movingRobber && userId === currentTurnUserId && robberTileIndex !== i ? 'tile-selectable' : ''}`}
                            onClick={() => movingRobber && userId === currentTurnUserId && handleTileClick && handleTileClick(i)}
                            style={{ cursor: movingRobber && userId === currentTurnUserId && robberTileIndex !== i ? 'pointer' : 'default' }}
                        >
                            <img className="tiles" src={resourceImages[resourceTiles[i]]} alt={resourceTiles[i]}/>
                            {resourceTokens[i] && robberTileIndex !== i && <span className="token">{resourceTokens[i]}</span>}
                            {robberTileIndex === i && (
                                <img 
                                    src={robber} 
                                    alt="Robber" 
                                    className="robber-icon"
                                />
                            )}
                        </span>
                    ))}
                </div>

                {/* Ports */}
                <img className="ports" src={ThreetoOnePort} style={{ top: `calc(50% - 300px)`, left: `calc(50% + 10px)`}} alt="3To1Port"/>
                <img className="ports" src={ThreetoOnePort} style={{ top: `calc(50% - 210px)`, left: `calc(50% + 210px)`}} alt="3To1Port2"/>
                <img className="ports" src={ThreetoOnePort} style={{ top: `calc(50% + 250px)`, left: `calc(50% + 10px)`}} alt="3To1Port3"/>
                <img className="ports" src={ThreetoOnePort} style={{ top: `calc(50% + 65px)`, left: `calc(50% - 310px)`}} alt="3To1Port4"/>
                <img className="ports" src={TwotoOneBrick} style={{ top: `calc(50% - 300px)`, left: `calc(50% - 200px)`}} alt="2To1Brick"/>
                <img className="ports" src={TwotoOneSheep} style={{ top: `calc(50% - 25px)`, left: `calc(50% + 330px)`}} alt="2To1Sheep"/>
                <img className="ports" src={TwotoOneStone} style={{ top: `calc(50% - 130px)`, left: `calc(50% - 310px)`}} alt="2To1Stone"/>
                <img className="ports" src={TwotoOneWood} style={{ top: `calc(50% + 250px)`, left: `calc(50% - 200px)`}} alt="2To1Wood"/>
                <img className="ports" src={TwotoOneWheat} style={{ top: `calc(50% + 150px)`, left: `calc(50% + 210px)`}} alt="2To1Wheat"/>
                
                {/* Port Roads */}
                {Array.isArray(portRoadData) && portRoadData.map((portRoadMapping, portIndex) => (
                    <React.Fragment key={`port-road-group-${portIndex}`}>
                        {portRoadMapping.roadSegments.map((segment, segmentIndex) => (
                            <img 
                                key={`port-road-${portIndex}-${segmentIndex}`}
                                src={portRoad}
                                alt={`Port Road`}
                                style={{
                                    position: 'absolute',
                                    top: `calc(50% + ${segment.y}px)`,
                                    left: `calc(50% + ${segment.x}px)`,
                                    transform: `translate(-50%, -50%) rotate(${segment.rotation}deg)`,
                                    pointerEvents: 'none',
                                    width: '7px',
                                    height: '30px',
                                    zIndex: 1
                                }}
                            />
                        ))}
                    </React.Fragment>
                ))}

                {/* House Selection Circles - Setup Phase */}
                {gamePhase === 'setup' && userId === currentTurnUserId && housesPlacedByCurrentUser < 2 && !housePlacedThisTurn && 
                    Array.isArray(houseData) && houseData.map((house, index) => (
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
                    ))
                }

                {/* House Building Circles - Playing Phase */}
                {gamePhase === 'playing' && buildingHouse && userId === currentTurnUserId && 
                    Array.isArray(houseData) && houseData.map((house, index) => (
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
                    ))
                }

                {/* City Upgrade Circles - Playing Phase */}
                {gamePhase === 'playing' && buildingCity && userId === currentTurnUserId && 
                    Array.isArray(houseData) && houseData.map((house, index) => (
                        upgradeableSettlements.includes(index) && (
                            <img 
                                key={`upgrade-city-${index}`} 
                                src={chooseCircle} 
                                className="house_marker fade-loop"
                                alt={`Upgrade to City ${index}`}
                                onClick={() => handleHouseClick(index)}
                                style={{
                                    position: 'absolute',
                                    top: `calc(50% + ${house.y}px)`,
                                    left: `calc(50% + ${house.x}px)`,
                                    transform: 'translate(-50%, -50%)',
                                    cursor: 'pointer',
                                    opacity: 0.7,
                                    filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.9))',
                                    transition: 'all 0.3s ease',
                                    width: '35px',
                                    height: '35px',
                                    zIndex: 10
                                }}
                            />
                        )
                    ))
                }

                {/* Road Selection Circles - Setup Phase */}
                {gamePhase === 'setup' && userId === currentTurnUserId && housePlacedThisTurn && roadsPlacedByCurrentUser < 2 && !roadPlacedThisTurn && 
                    Array.isArray(roadData) && roadData.map((road, index) => (
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
                    ))
                }

                {/* Road Building Circles - Playing Phase */}
                {gamePhase === 'playing' && buildingRoad && userId === currentTurnUserId && 
                    Array.isArray(roadData) && roadData.map((road, index) => (
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
                    ))
                }

                {/* Placed Houses */}
                {Array.isArray(houseData) && Object.entries(placedHouses).map(([index, house]) => {
                    const isCity = placedCities[index];
                    return (
                        <img 
                            key={`placed-house-${index}`} 
                            src={house.playerName === 'Player 1' ? redHouse : greenHouse}
                            alt={isCity ? `City by ${house.playerName}` : `House by ${house.playerName}`}
                            style={{
                                position: 'absolute',
                                top: `calc(50% + ${house.position.y}px)`,
                                left: `calc(50% + ${house.position.x}px)`,
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                filter: `drop-shadow(30px, 30px, 10px ${house.playerColor}, 1)`,
                                width: isCity ? '30px' : '20px',
                                height: isCity ? '30px' : '20px',
                                zIndex: 2,
                                border: isCity ? '3px solid gold' : 'none',
                                borderRadius: isCity ? '50%' : '0',
                                boxShadow: isCity ? '0 0 15px rgba(255, 215, 0, 0.8)' : 'none'
                            }}
                        />
                    );
                })}

                {/* Placed Roads */}
                {Array.isArray(roadData) && Object.entries(placedRoads).map(([index, road]) => {
                    let roadImage = greenRoad;
                    if (road.playerColor === 'red') {
                        roadImage = redRoad;
                    } else if (road.playerColor === 'blue') {
                        roadImage = blueRoad;
                    }
                    
                    const roadIdx = parseInt(index);
                    const roadInfo = roadData[roadIdx];
                    let rotation = 0;
                    
                    if (roadInfo && roadInfo.connectedHouses && roadInfo.connectedHouses.length >= 2) {
                        const house1 = houseData[roadInfo.connectedHouses[0]];
                        const house2 = houseData[roadInfo.connectedHouses[1]];
                        
                        if (house1 && house2) {
                            const dx = house2.x - house1.x;
                            const dy = house2.y - house1.y;
                            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                            rotation = angle + 90;
                        }
                    }
                    
                    return (
                        <img 
                            key={`placed-road-${index}`}
                            src={roadImage}
                            alt={`Placed road by ${road.playerName}`}
                            style={{
                                position: 'absolute',
                                top: `calc(50% + ${road.position.y}px)`,
                                left: `calc(50% + ${road.position.x}px)`,
                                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                                pointerEvents: 'none',
                                width: '10px',
                                height: '65px',
                                zIndex: 1
                            }}
                        />
                    );
                })}
                </>
            )}
        </div>
    );
}

export default GameBoard;