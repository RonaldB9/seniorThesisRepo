import { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import catanTitle from '../Images/catanTitle.gif';
import sheep from '../Images/sheepFrolick.png';
import Game from '../MainGamePage/Game';
import socket from '../socket';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://catan-game-server.onrender.com';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}

function Home() {
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [tempName, setTempName] = useState('');

//Get or generate persistent user ID
useEffect(() => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('userId', id);
    }
    setUserId(id);

    //Identify user to socket server
    socket.emit('identify', { userId: id });
    console.log(`🔌 Identifying user ${id} to socket server from Home`);

    //Register user with backend
    fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id })
    })
      .then(res => res.json())
      .then(data => {
        setCurrentPlayer(data);
        //Show name dialog for new players
        setTempName(data.name);
        setShowNameDialog(true);
      })
      .catch(err => console.error('Registration failed:', err));
  }, []);

  const handleNameSubmit = () => {
    if (!tempName.trim()) {
      alert('Please enter a name');
      return;
    }

    fetch(`${API_BASE_URL}/api/players/${userId}/name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tempName.trim() })
    })
      .then(res => res.json())
      .then(data => {
        setCurrentPlayer(data);
        setShowNameDialog(false);
      })
      .catch(err => console.error('Failed to update name:', err));
  };

  //Socket listener for player list updates
  useEffect(() => {
    socket.on('playersUpdated', updatedPlayers => {
      setPlayers(updatedPlayers);
      if (userId) {
        const me = updatedPlayers.find(p => p.userId === userId);
        setCurrentPlayer(me);
      }
    });
    return () => {
      socket.off('playersUpdated');
    };
  }, [userId]);

  useEffect(() => {
    socket.on('startGame', () => {
      navigate('/game');
    });
    return () => {
      socket.off('startGame');
    };
  }, [navigate]);

  const readyUp = () => {
    if (!userId) return;
    fetch(`${API_BASE_URL}/api/players/${userId}/ready`, {
      method: 'POST'
    }).catch(err => console.error('Failed to toggle ready:', err));
  };

  const startGame = () => {
    const minPlayers = 2; //minimum players required
    const allReady = players.length >= minPlayers && players.every(player => player.ready);

    if (allReady) {
      socket.emit('startGameClicked');  //notify server someone clicked Start Game
    } else {
      alert(`You need at least ${minPlayers} players, and all must be ready!`);
    }
  };

  function RandomSheep() {
    const startX = 200 + Math.random() * 200;
    const startY = window.innerHeight - 150 + Math.random() * 50;

    const [position, setPosition] = useState({ x: startX, y: startY });
    const [facingRight, setFacingRight] = useState(true);

    const direction = useRef(Math.random() > 0.5 ? 1 : -1); //1 = right, -1 = left
    const speed = 0.5 + Math.random() * 0.3;
    const amplitude = 50 + Math.random() * 30; 

    const baseX = useRef(startX);

    useEffect(() => {
      const interval = setInterval(() => {
        let newX = position.x + speed * direction.current;

        //Reverse direction if exceeding amplitude
        if (newX > baseX.current + amplitude) direction.current = -1;
        if (newX < baseX.current - amplitude) direction.current = 1;

        setFacingRight(direction.current === -1);
        setPosition(prev => ({ ...prev, x: newX }));
      }, 16);

      return () => clearInterval(interval);
    }, [position.x]);

    return (
      <img
        src={sheep}
        alt="Sheep"
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: '60px',
          height: '60px',
          transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)',
          transition: 'left 0.016s linear',
          zIndex: 1
        }}
      />
    );
  }
  return (
    <div className='loadBackround'>
      <div className="background">
        <div className="images">
          <img src={catanTitle} alt="Catan Title" />
        </div>

        <RandomSheep />
        <RandomSheep />
        <RandomSheep />

        {/* Name Dialog */}
        {showNameDialog && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '15px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h2 style={{ marginTop: 0, color: '#333' }}>Welcome to Catan!</h2>
              <p style={{ color: '#666' }}>Choose your player name:</p>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                placeholder="Enter your name..."
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
              <button
                onClick={handleNameSubmit}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Join Game
              </button>
            </div>
          </div>
        )}

        <div className="contentHomePage">
          {/*Player list*/}
          <div className="playerStartUp">
            <h2>Players:</h2>
            {players.map((player, index) => (
              <div key={player.userId} className="player-block">
                <h3 style={{ color: player.color }} className="players">{player.name}</h3>
                <h4>{player.ready ? "✅ Ready" : "❌ Not Ready"}</h4>
              </div>
            ))}
          </div>

          {/*Start Game*/}
          <div className="startGame">
            <h3 className="startText">Start Game</h3>
            <button onClick={readyUp}>
              {currentPlayer?.ready ? 'Unready' : 'Ready Up'}
            </button>
            <button onClick={startGame}>Start Game</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;