import React from 'react';
import '../css/VictoryPopup.css';

function VictoryPopup({ winnerName, winnerColor, finalScore, onClose }) {
    return (
        <div className="victory-overlay">
            <div className="victory-popup">
                <div className="victory-confetti">🎉</div>
                <h1 className="victory-title">Game Over!</h1>
                <div className="victory-content">
                    <h2 style={{ color: winnerColor }}>
                        {winnerName} Wins!
                    </h2>
                    <p className="victory-score">
                        Final Score: <strong>{finalScore} points</strong>
                    </p>
                    <div className="victory-trophy">🏆</div>
                </div>
                <button onClick={onClose} className="victory-button">
                    Return to Lobby Now
                </button>
            </div>
        </div>
    );
}

export default VictoryPopup;