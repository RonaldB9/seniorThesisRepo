import './css/App.css';
import catanTitle from './Images/catanTitle.png';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Game from './Game'; 

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

//home page
function Home() {
  const navigate = useNavigate();
  const players = ['Player 1', 'Player 2', 'Player 3', 'Player 4']; //dymanic eventually

  const startGame = () => {
    navigate('/game');
  };

  return (
    <div className="background">
      <div className="images">
        <img src={catanTitle} alt="Catan Title"/>
      </div>

      <h1 className="title">Trade Build Settle</h1>

      <div class='contentHomePage'>
        <div className="playerStartUp">
          <h2>Players:</h2>
          {players.map((player, index) => (
            <div key={index} class="player-block">
              <h3 className="players">{player}</h3>
              <h4>Ready/Not Ready</h4>
            </div>
          ))}
        </div>
        
        <div class='startGame'>
          <h3 class="startText">Start Game</h3>
          <button onClick={startGame}>Start Game</button>
        </div>
      </div>
    </div>
  );
}

export default App;
