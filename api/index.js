import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Serve static files from public folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.get('/api/data', async (req, res) => {
  res.status(200).json({ message: 'API works' });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

export default app;
