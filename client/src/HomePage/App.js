import { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import catanTitle from '../Images/catanTitle.gif';
import sheep from '../Images/sheepFrolick.png';
import Game from '../MainGamePage/Game';
import socket from '../socket';


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

  // Get or generate persistent user ID
  useEffect(() => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('userId', id);
    }
    setUserId(id);

    // Register user with backend
    fetch('http://localhost:3001/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id })
    })
      .then(res => res.json())
      .then(data => setCurrentPlayer(data))
      .catch(err => console.error('Registration failed:', err));
  }, []);

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
    fetch(`http://localhost:3001/api/players/${userId}/ready`, {
      method: 'POST'
    }).catch(err => console.error('Failed to toggle ready:', err));
  };

  const startGame = () => {
    const minPlayers = 2; // minimum players required
    const allReady = players.length >= minPlayers && players.every(player => player.ready);

    if (allReady) {
      socket.emit('startGameClicked');  // notify server someone clicked Start Game
    } else {
      alert(`You need at least ${minPlayers} players, and all must be ready!`);
    }
  };

  function RandomSheep() {
    // Start somewhere near bottom of screen
    const startX = 200 + Math.random() * 200;
    const startY = window.innerHeight - 150 + Math.random() * 50;

    const [position, setPosition] = useState({ x: startX, y: startY });
    const [facingRight, setFacingRight] = useState(true);

    const direction = useRef(Math.random() > 0.5 ? 1 : -1); // 1 = right, -1 = left
    const speed = 0.5 + Math.random() * 0.3; // px per frame
    const amplitude = 50 + Math.random() * 30; // how far from baseX

    const baseX = useRef(startX);

    useEffect(() => {
      const interval = setInterval(() => {
        let newX = position.x + speed * direction.current;

        // Reverse direction if exceeding amplitude
        if (newX > baseX.current + amplitude) direction.current = -1;
        if (newX < baseX.current - amplitude) direction.current = 1;

        setFacingRight(direction.current === -1);
        setPosition(prev => ({ ...prev, x: newX }));
      }, 16); // ~60fps

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
          transition: 'left 0.016s linear', // smooth movement
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

        {/*<h1 className="title">Trade Build Settle</h1>*/}

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
