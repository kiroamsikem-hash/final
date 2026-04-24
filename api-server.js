const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  path: '/socket.io/'
});

const PORT = process.env.API_PORT || 8084;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import PostgreSQL handler (better for large data!)
const postgresHandler = require('./expo/api/postgres.js').default;

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Broadcast helper function
function broadcastDataChange(type, action, id) {
  console.log('📢 Broadcasting:', 'dataChanged', { type, action, id });
  io.emit('dataChanged', { type, action, id });
}

// API endpoint with WebSocket broadcasting - PostgreSQL
app.post('/api/postgres', async (req, res) => {
  try {
    const { action, data } = req.body;
    
    // Call the PostgreSQL handler
    await postgresHandler(req, res);
    
    // Broadcast changes for write operations
    if (action === 'saveCivilization') {
      broadcastDataChange('civilization', 'save', data?.id);
    } else if (action === 'saveEvent') {
      broadcastDataChange('event', 'save', data?.id);
    } else if (action === 'saveCellData') {
      broadcastDataChange('cellData', 'save', data?.id);
    } else if (action === 'deleteCivilization') {
      broadcastDataChange('civilization', 'delete', data?.id);
    } else if (action === 'deleteEvent') {
      broadcastDataChange('event', 'delete', data?.id);
    }
  } catch (error) {
    console.error('API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Keep MySQL endpoint for backward compatibility
app.post('/api/mysql', async (req, res) => {
  // Redirect to PostgreSQL
  req.url = '/api/postgres';
  return app.handle(req, res);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount 
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server with WebSocket running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
  console.log(`🔌 WebSocket path: /socket.io/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
