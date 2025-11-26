import React, { useState } from 'react';
import '../css/TradeDialog.css';

export function PlayerTradeDialog({ 
    currentPlayer, 
    allPlayers, 
    userId, 
    onProposeTrade, 
    onCancel 
}) {
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [offering, setOffering] = useState({
        wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0
    });
    const [requesting, setRequesting] = useState({
        wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0
    });
    const [error, setError] = useState('');

    const resources = ['wood', 'brick', 'sheep', 'wheat', 'ore'];
    const resourceEmojis = {
        wood: '🪵', brick: '🧱', sheep: '🐑', wheat: '🌾', ore: '⛏️'
    };

    const otherPlayers = allPlayers.filter(p => p.userId !== userId);

    const handleOfferingChange = (resource, amount) => {
        const maxAmount = currentPlayer?.resources?.[resource] || 0;
        const newAmount = Math.min(Math.max(0, amount), maxAmount);
        setOffering(prev => ({ ...prev, [resource]: newAmount }));
        setError(''); //Clear error when user makes changes
    };

    const handleRequestingChange = (resource, amount) => {
        setRequesting(prev => ({ ...prev, [resource]: Math.max(0, amount) }));
        setError(''); //Clear error when user makes changes
    };

    const handleProposeTrade = () => {
        console.log('🔵 Propose Trade clicked');
        console.log('Selected Player:', selectedPlayer);
        console.log('Offering:', offering);
        console.log('Requesting:', requesting);

        //Validation 1: Player selected
        if (!selectedPlayer) {
            const errorMsg = 'Please select a player to trade with';
            console.warn('❌ ' + errorMsg);
            setError(errorMsg);
            return;
        }

        //Validation 2: Has offering
        const hasOffering = Object.values(offering).some(v => v > 0);
        if (!hasOffering) {
            const errorMsg = 'You must offer at least one resource';
            console.warn('❌ ' + errorMsg);
            setError(errorMsg);
            return;
        }

        //Validation 3: Has requesting
        const hasRequesting = Object.values(requesting).some(v => v > 0);
        if (!hasRequesting) {
            const errorMsg = 'You must request at least one resource';
            console.warn('❌ ' + errorMsg);
            setError(errorMsg);
            return;
        }

        console.log('✅ All validations passed, emitting trade proposal');
        
        //Call the callback
        onProposeTrade({
            responderId: selectedPlayer.userId,
            offering,
            requesting
        });
    };

    return (
        <div className="trade-dialog-overlay">
            <div className="trade-dialog">
                <h3>💱 Player Trade</h3>

                {/* Error Display */}
                {error && (
                    <div style={{
                        backgroundColor: '#ffcdd2',
                        color: '#c62828',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}>
                        {error}
                    </div>
                )}

                {/* Player Selection */}
                <div className="trade-section">
                    <label>Trade With:</label>
                    {otherPlayers.length === 0 ? (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>No other players available</p>
                    ) : (
                        <select 
                            value={selectedPlayer?.userId || ''} 
                            onChange={(e) => {
                                const player = otherPlayers.find(p => p.userId === e.target.value);
                                setSelectedPlayer(player);
                                console.log('Selected player:', player);
                            }}
                            className="player-select"
                        >
                            <option value="">-- Select Player --</option>
                            {otherPlayers.map(player => (
                                <option key={player.userId} value={player.userId}>
                                    {player.name} ({player.color}) - {Object.values(player.resources || {}).reduce((sum, count) => sum + count, 0)} cards
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Offering Section */}
                <div className="trade-section">
                    <label>You Offer:</label>
                    <div className="trade-resources">
                        {resources.map(resource => (
                            <div key={resource} className="trade-resource-row">
                                <span className="resource-emoji">{resourceEmojis[resource]}</span>
                                <span className="resource-name">{resource}</span>
                                <input
                                    type="number"
                                    min="0"
                                    max={currentPlayer?.resources?.[resource] || 0}
                                    value={offering[resource]}
                                    onChange={(e) => handleOfferingChange(resource, parseInt(e.target.value) || 0)}
                                    className="trade-input"
                                />
                                <span className="available">
                                    (have: {currentPlayer?.resources?.[resource] || 0})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Exchange Arrow */}
                <div className="trade-exchange">⇅</div>

                {/* Requesting Section */}
                <div className="trade-section">
                    <label>You Receive:</label>
                    <div className="trade-resources">
                        {resources.map(resource => (
                            <div key={resource} className="trade-resource-row">
                                <span className="resource-emoji">{resourceEmojis[resource]}</span>
                                <span className="resource-name">{resource}</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={requesting[resource]}
                                    onChange={(e) => handleRequestingChange(resource, parseInt(e.target.value) || 0)}
                                    className="trade-input"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="trade-actions">
                    <button 
                        onClick={handleProposeTrade}
                        className="trade-propose-button"
                    >
                        Propose Trade
                    </button>
                    <button 
                        onClick={onCancel}
                        className="trade-cancel-button"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// Port Trade Dialog
export function PortTradeDialog({ 
    currentPlayer, 
    playerPorts, 
    onExecuteTrade, 
    onCancel 
}) {
    const [offering, setOffering] = useState({ resource: 'wood', amount: 4 });
    const [requesting, setRequesting] = useState({ resource: 'brick', amount: 1 });

    const resources = ['wood', 'brick', 'sheep', 'wheat', 'ore'];
    const resourceEmojis = {
        wood: '🪵', brick: '🧱', sheep: '🐑', wheat: '🌾', ore: '⛏️'
    };

    // Determine valid trade rates
    const getValidAmounts = () => {
        const offeredResource = offering.resource;
        const rates = [{ ratio: 4, label: '4:1 (no port)' }];

        if (playerPorts.some(p => p.type === '3:1')) {
            rates.push({ ratio: 3, label: '3:1 (generic port)' });
        }

        if (playerPorts.some(p => p.type === '2:1' && p.resources.includes(offeredResource))) {
            rates.push({ ratio: 2, label: '2:1 (specific port)' });
        }

        return rates;
    };

    const validRates = getValidAmounts();

    const handleExecuteTrade = () => {
        if (offering.resource === requesting.resource) {
            alert("Can't trade a resource for itself!");
            return;
        }

        onExecuteTrade({
            offering: { [offering.resource]: offering.amount },
            requesting: { [requesting.resource]: requesting.amount }
        });
    };

    return (
        <div className="trade-dialog-overlay">
            <div className="trade-dialog">
                <h3>🏦 Port Trade (Bank)</h3>

                {/* Port Info */}
                <div className="port-info">
                    <p>Available Ports:</p>
                    {playerPorts.length === 0 ? (
                        <p className="no-ports">No ports. Using 4:1 rate.</p>
                    ) : (
                        <div className="port-list">
                            {playerPorts.map((port, idx) => (
                                <span key={idx} className="port-badge">
                                    {port.type} {port.resources[0] === 'any' ? '(any)' : port.resources.join('/')}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Offering */}
                <div className="trade-section">
                    <label>You Give:</label>
                    <div className="port-trade-row">
                        <select 
                            value={offering.resource}
                            onChange={(e) => setOffering({...offering, resource: e.target.value})}
                            className="resource-select"
                        >
                            {resources.map(r => (
                                <option key={r} value={r}>
                                    {resourceEmojis[r]} {r}
                                </option>
                            ))}
                        </select>
                        <select 
                            value={offering.amount}
                            onChange={(e) => {
                                const rate = parseInt(e.target.value);
                                setOffering({...offering, amount: rate});
                            }}
                            className="amount-select"
                        >
                            {validRates.map(rate => (
                                <option key={rate.ratio} value={rate.ratio}>
                                    {rate.ratio} ({rate.label})
                                </option>
                            ))}
                        </select>
                        <span>max: {currentPlayer?.resources?.[offering.resource] || 0}</span>
                    </div>
                </div>

                {/* Exchange */}
                <div className="trade-exchange">⇅</div>

                {/* Requesting */}
                <div className="trade-section">
                    <label>You Get:</label>
                    <div className="port-trade-row">
                        <select 
                            value={requesting.resource}
                            onChange={(e) => setRequesting({...requesting, resource: e.target.value})}
                            className="resource-select"
                        >
                            {resources.map(r => (
                                <option key={r} value={r}>
                                    {resourceEmojis[r]} {r}
                                </option>
                            ))}
                        </select>
                        <span className="receiving-amount">1</span>
                    </div>
                </div>

                {/* Trade Rate Info */}
                <div className="trade-rate-info">
                    Trade Rate: {offering.amount}:1
                </div>

                {/* Actions */}
                <div className="trade-actions">
                    <button 
                        onClick={handleExecuteTrade}
                        className="trade-propose-button"
                    >
                        Execute Trade
                    </button>
                    <button 
                        onClick={onCancel}
                        className="trade-cancel-button"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// Trade Notification
export function TradeNotification({ trade, onAccept, onDecline }) {
    return (
        <div className="trade-notification">
            <div className="notification-content">
                <h4>Trade Proposal 💱</h4>
                <p><strong>{trade.initiatorName}</strong> wants to trade:</p>
                <div className="trade-summary">
                    <div className="trade-side">
                        <span className="side-label">Offering:</span>
                        {Object.entries(trade.offering).map(([res, amt]) => 
                            amt > 0 && <span key={res}>{amt}x {res}</span>
                        )}
                    </div>
                    <div className="trade-side">
                        <span className="side-label">For:</span>
                        {Object.entries(trade.requesting).map(([res, amt]) => 
                            amt > 0 && <span key={res}>{amt}x {res}</span>
                        )}
                    </div>
                </div>
                <div className="notification-actions">
                    <button onClick={onAccept} className="accept-btn">Accept</button>
                    <button onClick={onDecline} className="decline-btn">Decline</button>
                </div>
            </div>
        </div>
    );
}