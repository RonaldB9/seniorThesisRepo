import React, { useState } from 'react';
import '../css/DiscardDialog.css';

function DiscardDialog({ 
    currentPlayer, 
    cardsToDiscard, 
    onDiscard, 
    onCancel 
}) {
    const [selectedCards, setSelectedCards] = useState({
        wood: 0,
        brick: 0,
        sheep: 0,
        wheat: 0,
        ore: 0
    });

    const handleIncrement = (resource) => {
        const totalSelected = Object.values(selectedCards).reduce((sum, count) => sum + count, 0);
        const availableCount = currentPlayer.resources[resource] || 0;
        
        if (totalSelected < cardsToDiscard && selectedCards[resource] < availableCount) {
            setSelectedCards(prev => ({
                ...prev,
                [resource]: prev[resource] + 1
            }));
        }
    };

    const handleDecrement = (resource) => {
        if (selectedCards[resource] > 0) {
            setSelectedCards(prev => ({
                ...prev,
                [resource]: prev[resource] - 1
            }));
        }
    };

    const handleSubmit = () => {
        const totalSelected = Object.values(selectedCards).reduce((sum, count) => sum + count, 0);
        
        if (totalSelected === cardsToDiscard) {
            onDiscard(selectedCards);
        }
    };

    const totalSelected = Object.values(selectedCards).reduce((sum, count) => sum + count, 0);
    const isValid = totalSelected === cardsToDiscard;

    const resourceEmojis = {
        wood: '🪵',
        brick: '🧱',
        sheep: '🐑',
        wheat: '🌾',
        ore: '⛏️'
    };

    const resourceNames = {
        wood: 'Wood',
        brick: 'Brick',
        sheep: 'Sheep',
        wheat: 'Wheat',
        ore: 'Ore'
    };

    return (
        <div className="discard-dialog-overlay">
            <div className="discard-dialog">
                <h3>⚠️ Discard {cardsToDiscard} Cards</h3>
                <p className="discard-instruction">
                    You have more than 7 cards. Select {cardsToDiscard} cards to discard.
                </p>
                
                <div className="discard-progress">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill"
                            style={{ 
                                width: `${(totalSelected / cardsToDiscard) * 100}%`,
                                backgroundColor: isValid ? '#4CAF50' : '#FF6B6B'
                            }}
                        />
                    </div>
                    <span className="progress-text">
                        {totalSelected} / {cardsToDiscard} selected
                    </span>
                </div>

                <div className="discard-resources">
                    {Object.keys(resourceEmojis).map(resource => {
                        const available = currentPlayer.resources[resource] || 0;
                        if (available === 0) return null;
                        
                        return (
                            <div key={resource} className="discard-resource-item">
                                <div className="resource-header">
                                    <span className="resource-emoji">{resourceEmojis[resource]}</span>
                                    <span className="resource-name">{resourceNames[resource]}</span>
                                    <span className="resource-available">({available} available)</span>
                                </div>
                                <div className="resource-controls">
                                    <button 
                                        onClick={() => handleDecrement(resource)}
                                        disabled={selectedCards[resource] === 0}
                                        className="resource-btn"
                                    >
                                        −
                                    </button>
                                    <span className="resource-count">{selectedCards[resource]}</span>
                                    <button 
                                        onClick={() => handleIncrement(resource)}
                                        disabled={
                                            selectedCards[resource] >= available || 
                                            totalSelected >= cardsToDiscard
                                        }
                                        className="resource-btn"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="discard-actions">
                    <button 
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className="discard-submit-button"
                    >
                        Discard Cards
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DiscardDialog;