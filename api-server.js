const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log('📁 Uploads directory created:', UPLOADS_DIR);
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));

// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// Import PostgreSQL handler
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
    } else if (action === 'importSql') {
      io.emit('dataChanged', { type: 'all', action: 'reload' });
    }
  } catch (error) {
    console.error('API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Photo upload endpoint
app.post('/api/upload-photo', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📸 Photo uploaded:', req.file.filename);

    // Return the filename (not full path, just filename)
    res.json({
      success: true,
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete photo endpoint
app.post('/api/delete-photo', (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename required' });
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️  Photo deleted:', filename);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
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
