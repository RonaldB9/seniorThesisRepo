const express = require('express');
const cors = require('cors');
const generateCatanBoard = require('./gameData');

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/api/board', (req, res) => {
  const boardData = generateCatanBoard();
  res.json(boardData);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});