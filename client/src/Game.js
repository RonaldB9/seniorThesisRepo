import React, { useEffect, useState } from 'react';
import './App.css';
import './Game.css'; 
//images
import catanTitle from './Images/catanTitle.png';
import brickTile from './Images/brickTile.png';
import oreTile from './Images/oreTile.png';
import woodTile from './Images/woodTile.png';
import sheepTile from './Images/sheepTile.png';
import wheatTile from './Images/wheatTile.png';
import desertTile from './Images/desertTile.png';
import chooseCircle from './Images/chooseCircle.png';

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
    const [showhouseOptions, setShowOptions] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3001/api/board')
        .then((res) => res.json())
        .then((data) => {
            setResourceTiles(data.resourceTiles);
            setResourceTokens(data.resourceTokens);
            setHouseData(data.houseData);
        });
    }, []);

    const handleClick = () => {
        setShowOptions(true);
    };

    return (
    <div className="background">
        <div className="images">
          <img src={catanTitle} alt="Catan Title"/>
        </div>
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
            
            {/* Conditionally show fading image */}
                <>
                {showhouseOptions && Array.isArray(houseData) && houseData.map((house, index) => (
                    <img
                    key={index}
                    src={chooseCircle} // Or a house icon
                    className="house_marker fade-loop"
                    style={{
                        position: 'absolute',
                        top: `calc(50% + ${house.y}px)`,
                        left: `calc(50% + ${house.x}px)`,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none'
                    }}
                    alt={`House ${index}`}
                    />
                ))}
            </>

            <div class="endTurnDiv">
                <button onClick={handleClick}>End Turn</button>
            </div>

            </>
        )}
        </div>
    </div>
    )
}

export default Game;