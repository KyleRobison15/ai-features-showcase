import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import router from './routes';

// Load environment variables (Railway provides them directly in production)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Create our "app" in express
const app = express();

// Middleware
app.use(express.json());

// Health check endpoint (Railway uses this)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use(router);

// Serve React static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../client/dist');

  // Serve static files
  app.use(express.static(clientDistPath));

  // SPA fallback - send index.html for all non-API routes
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
