const express = require('express');
const path = require('path');

const app = express();

// Serve static files from public folder (one level up)
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Serve index.html for all non-asset routes (SPA routing)
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath);
});

module.exports = app;

