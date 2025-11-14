import React, { useState } from 'react';
import '../css/DevelopmentCards.css';

// Year of Plenty Dialog - Choose 2 resources
export function YearOfPlentyDialog({ onConfirm, onCancel }) {
    const [selectedResources, setSelectedResources] = useState([]);

    const resources = [
        { key: 'wood', emoji: '🪵', name: 'Wood' },
        { key: 'brick', emoji: '🧱', name: 'Brick' },
        { key: 'sheep', emoji: '🐑', name: 'Sheep' },
        { key: 'wheat', emoji: '🌾', name: 'Wheat' },
        { key: 'ore', emoji: '⛏️', name: 'Ore' }
    ];

    const handleResourceClick = (resourceKey) => {
        if (selectedResources.length < 2) {
            setSelectedResources([...selectedResources, resourceKey]);
        }
    };

    const handleRemoveResource = (index) => {
        const newSelected = [...selectedResources];
        newSelected.splice(index, 1);
        setSelectedResources(newSelected);
    };

    const handleConfirm = () => {
        if (selectedResources.length === 2) {
            onConfirm(selectedResources);
        }
    };

    return (
        <div className="dev-card-dialog-overlay">
            <div className="dev-card-dialog">
                <h3>🎁 Year of Plenty</h3>
                <p className="dev-card-instruction">
                    Choose 2 resources to receive from the bank
                </p>
                
                <div className="selected-resources">
                    {selectedResources.map((resource, index) => {
                        const res = resources.find(r => r.key === resource);
                        return (
                            <div key={index} className="selected-resource-chip" onClick={() => handleRemoveResource(index)}>
                                <span>{res.emoji}</span>
                                <span className="remove-chip">×</span>
                            </div>
                        );
                    })}
                    {selectedResources.length < 2 && (
                        <div className="resource-placeholder">
                            {2 - selectedResources.length} more
                        </div>
                    )}
                </div>

                <div className="resource-grid">
                    {resources.map(resource => (
                        <button
                            key={resource.key}
                            onClick={() => handleResourceClick(resource.key)}
                            disabled={selectedResources.length >= 2}
                            className="resource-choice-btn"
                        >
                            <span className="resource-emoji">{resource.emoji}</span>
                            <span className="resource-name">{resource.name}</span>
                        </button>
                    ))}
                </div>

                <div className="dev-card-actions">
                    <button 
                        onClick={handleConfirm}
                        disabled={selectedResources.length !== 2}
                        className="dev-card-confirm-button"
                    >
                        Confirm
                    </button>
                    <button 
                        onClick={onCancel}
                        className="dev-card-cancel-button"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// Monopoly Dialog - Choose 1 resource type to steal from all players
export function MonopolyDialog({ onConfirm, onCancel }) {
    const [selectedResource, setSelectedResource] = useState(null);

    const resources = [
        { key: 'wood', emoji: '🪵', name: 'Wood' },
        { key: 'brick', emoji: '🧱', name: 'Brick' },
        { key: 'sheep', emoji: '🐑', name: 'Sheep' },
        { key: 'wheat', emoji: '🌾', name: 'Wheat' },
        { key: 'ore', emoji: '⛏️', name: 'Ore' }
    ];

    const handleConfirm = () => {
        if (selectedResource) {
            onConfirm(selectedResource);
        }
    };

    return (
        <div className="dev-card-dialog-overlay">
            <div className="dev-card-dialog">
                <h3>💰 Monopoly</h3>
                <p className="dev-card-instruction">
                    Choose a resource type. All other players must give you all their resources of that type!
                </p>

                <div className="resource-grid">
                    {resources.map(resource => (
                        <button
                            key={resource.key}
                            onClick={() => setSelectedResource(resource.key)}
                            className={`resource-choice-btn ${selectedResource === resource.key ? 'selected' : ''}`}
                        >
                            <span className="resource-emoji">{resource.emoji}</span>
                            <span className="resource-name">{resource.name}</span>
                        </button>
                    ))}
                </div>

                <div className="dev-card-actions">
                    <button 
                        onClick={handleConfirm}
                        disabled={!selectedResource}
                        className="dev-card-confirm-button"
                    >
                        Confirm
                    </button>
                    <button 
                        onClick={onCancel}
                        className="dev-card-cancel-button"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// Road Building Dialog - Informational
export function RoadBuildingDialog({ onConfirm, onCancel }) {
    return (
        <div className="dev-card-dialog-overlay">
            <div className="dev-card-dialog">
                <h3>🛣️ Road Building</h3>
                <p className="dev-card-instruction">
                    You can now build 2 roads for free! Click on available road spots to place them.
                </p>

                <div className="dev-card-actions">
                    <button 
                        onClick={onConfirm}
                        className="dev-card-confirm-button"
                    >
                        Start Building
                    </button>
                    <button 
                        onClick={onCancel}
                        className="dev-card-cancel-button"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}