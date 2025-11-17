import React from 'react';

function Scoreboard({ allPlayers, userId, currentTurnUserId }) {
    return (
        <div className="scoreboard">
            <h3>Players</h3>
            {allPlayers.map((player) => (
                <div 
                    key={player.userId} 
                    className={`score-item ${player.userId === userId ? 'current-user' : ''}`}
                >
                    <div className="player-header">
                        <span style={{ color: player.color, fontWeight: 'bold', fontSize: '0.9em' }}>
                            {player.name} {player.userId === userId && '(You)'}
                        </span>
                        <span className="score-points">{player.score}pts</span>
                    </div>
                    
                    {player.userId === currentTurnUserId && (
                        <span className="turn-indicator">← Turn</span>
                    )}
                    
                    {player.userId === userId && player.resources && (
                        <div className="player-resources">
                            <div className="resource-item" title="Wood">🪵 {player.resources.wood || 0}</div>
                            <div className="resource-item" title="Brick">🧱 {player.resources.brick || 0}</div>
                            <div className="resource-item" title="Sheep">🐑 {player.resources.sheep || 0}</div>
                            <div className="resource-item" title="Wheat">🌾 {player.resources.wheat || 0}</div>
                            <div className="resource-item" title="Ore">⛏️ {player.resources.ore || 0}</div>
                        </div>
                    )}

                    {player.userId === userId && player.developmentCards && (
                        <div className="player-dev-cards">
                            <div className="dev-card-item" title="Knight">🗡️ Knights: {player.developmentCards.knight || 0}</div>
                            <div className="dev-card-item" title="Victory Point cards are hidden until revealed">
                                🏆 VP (Hidden): {player.developmentCards.victoryPoint || 0}
                            </div>
                            {player.revealedVictoryPoints > 0 && (
                                <div className="dev-card-item revealed-vp" title="Revealed Victory Points">
                                    ⭐ Revealed VP: {player.revealedVictoryPoints}
                                </div>
                            )}
                            <div className="dev-card-item" title="Road Builder">🛣️ Road Building: {player.developmentCards.roadBuilding || 0}</div>
                            <div className="dev-card-item" title="Year Of Plenty">🎁 Year of Plenty: {player.developmentCards.yearOfPlenty || 0}</div>
                            <div className="dev-card-item" title="Monopoly">💰 Monopoly: {player.developmentCards.monopoly || 0}</div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default Scoreboard;