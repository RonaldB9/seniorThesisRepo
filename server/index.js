const express = require('express');
const cors = require('cors');
const { generateCatanBoard, getHouseTileData } = require('./gameData');

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/api/board', (req, res) => {
  const boardData = generateCatanBoard();
  const houseData = getHouseTileData();
  res.json({
    resourceTiles: boardData.resourceTiles,
    resourceTokens: boardData.resourceTokens,
    houseData: houseData
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});