import React from 'react';

function Scoreboard({ allPlayers, userId, currentTurnUserId }) {
    return (
        <div className="scoreboard">
            <h3>Scoreboard</h3>
            {allPlayers.map((player) => (
                <div 
                    key={player.userId} 
                    className={`score-item ${player.userId === userId ? 'current-user' : ''}`}
                >
                    <span style={{ color: player.color, fontWeight: 'bold' }}>
                        {player.name} {player.userId === userId && '(You)'}
                    </span>
                    <span className="score-points">{player.score} points</span>
                    {player.userId === currentTurnUserId && (
                        <span className="turn-indicator">← Current Turn</span>
                    )}
                    
                    {player.userId === userId && player.resources && (
                        <div className="player-resources">
                            <div className="resource-item">🪵 {player.resources.wood || 0}</div>
                            <div className="resource-item">🧱 {player.resources.brick || 0}</div>
                            <div className="resource-item">🐑 {player.resources.sheep || 0}</div>
                            <div className="resource-item">🌾 {player.resources.wheat || 0}</div>
                            <div className="resource-item">⛏️ {player.resources.ore || 0}</div>
                        </div>
                    )}

                    {player.userId === userId && player.developmentCards && (
                        <div className="player-dev-cards">
                            <div className="dev-card-item">🗡️ Knights: {player.developmentCards.knight || 0}</div>
                            <div className="dev-card-item">🏆 VP: {player.developmentCards.victoryPoint || 0}</div>
                            <div className="dev-card-item">🛣️ Road Building: {player.developmentCards.roadBuilding || 0}</div>
                            <div className="dev-card-item">🎁 Year of Plenty: {player.developmentCards.yearOfPlenty || 0}</div>
                            <div className="dev-card-item">💰 Monopoly: {player.developmentCards.monopoly || 0}</div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default Scoreboard;