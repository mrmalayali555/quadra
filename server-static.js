const express = require('express');
const path = require('path');

const app = express();

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Handle SPA routing - serve index.html for all routes except API
app.get('*', (req, res) => {
  // Don't redirect API routes
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API route not found' });
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
