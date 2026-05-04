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

// ============================================================================
// BACKUP via Resend (email)
// ============================================================================
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const BACKUP_EMAIL = process.env.BACKUP_EMAIL || 'mwlih28@gmail.com';
const BACKUP_FROM = process.env.BACKUP_FROM || 'Anatolia Timeline <onboarding@resend.dev>';

async function buildServerSnapshot() {
  const { pool } = require('./expo/api/postgres.js');
  const civs = (await pool.query('SELECT * FROM civilizations ORDER BY display_order ASC NULLS LAST')).rows;
  const events = (await pool.query('SELECT * FROM events')).rows;
  const cells = (await pool.query('SELECT * FROM cell_data')).rows;
  return {
    version: 1,
    source: 'server-cron',
    timestamp: new Date().toISOString(),
    civilizations: civs,
    events,
    cellData: cells,
    note: 'Bu yedek sunucu tarafindan otomatik olusturuldu. Depo (IndexedDB) icerikleri yalnizca tarayicidan tetiklenen yedeklerde bulunur.',
  };
}

async function sendBackupEmail(payload, opts = {}) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY env variable not set on server');
  const to = opts.to || BACKUP_EMAIL;
  const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

  const finalPayload = payload || (await buildServerSnapshot());
  const articleFiles = Array.isArray(opts.articleFiles) ? opts.articleFiles : [];

  const jsonStr = JSON.stringify(finalPayload, null, 2);
  const jsonBuf = Buffer.from(jsonStr, 'utf8');

  const attachments = [
    {
      filename: `anatolia-timeline-${dateStr}.json`,
      content: jsonBuf.toString('base64'),
    },
  ];

  // Cap total attachment size at ~35MB to stay under Resend's 40MB limit.
  let totalBytes = jsonBuf.length;
  let skipped = 0;
  for (const f of articleFiles) {
    if (!f || !f.filename || !f.base64) continue;
    const approxBytes = Math.floor((f.base64.length * 3) / 4);
    if (totalBytes + approxBytes > 35 * 1024 * 1024) {
      skipped += 1;
      continue;
    }
    attachments.push({ filename: f.filename, content: f.base64 });
    totalBytes += approxBytes;
  }

  const civCount = finalPayload?.civilizations?.length || 0;
  const eventCount = finalPayload?.events?.length || 0;
  const cellCount = finalPayload?.cellData?.length || 0;
  const articleMetaCount = finalPayload?.articles?.length || 0;
  const sizeMB = (totalBytes / 1024 / 1024).toFixed(2);

  const html = `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; color:#0b0e14; max-width:560px;">
      <h2 style="color:#c9a227; margin:0 0 12px;">Anatolia Timeline · Yedek</h2>
      <p style="margin:0 0 8px; color:#475569;">Tarih: <strong>${new Date().toLocaleString('tr-TR')}</strong></p>
      <ul style="line-height:1.7;">
        <li><strong>${civCount}</strong> medeniyet</li>
        <li><strong>${eventCount}</strong> olay</li>
        <li><strong>${cellCount}</strong> hücre verisi</li>
        <li><strong>${articleMetaCount}</strong> depo dosyası (meta) · <strong>${articleFiles.length - skipped}</strong> dosya iliştirildi${skipped > 0 ? ` (${skipped} dosya boyut sınırı nedeniyle atlandı)` : ''}</li>
      </ul>
      <p style="color:#64748b; font-size:13px;">Toplam ek boyutu: ~${sizeMB} MB</p>
    </div>
  `;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: BACKUP_FROM,
      to: [to],
      subject: `Anatolia Timeline Yedeği · ${dateStr}`,
      html,
      attachments,
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Resend ${resp.status}: ${t}`);
  }
  return await resp.json();
}

app.post('/api/backup', async (req, res) => {
  try {
    const body = req.body || {};
    const payload = body.payload || null;
    const articleFiles = body.articleFiles || [];
    const result = await sendBackupEmail(payload, { articleFiles });
    res.json({ success: true, id: result?.id, to: BACKUP_EMAIL });
  } catch (err) {
    console.error('[Backup] error:', err.message || err);
    res.status(500).json({ success: false, error: String(err.message || err) });
  }
});

// Daily cron at 03:00 server time
function scheduleDailyBackup() {
  const computeNextDelay = () => {
    const now = new Date();
    const next = new Date(now);
    next.setHours(3, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next.getTime() - now.getTime();
  };
  const run = async () => {
    try {
      console.log('[Backup] running scheduled backup ->', BACKUP_EMAIL);
      await sendBackupEmail(null);
      console.log('[Backup] scheduled backup sent');
    } catch (err) {
      console.error('[Backup] scheduled backup failed:', err.message || err);
    } finally {
      setTimeout(run, computeNextDelay());
    }
  };
  const delay = computeNextDelay();
  setTimeout(run, delay);
  console.log(`[Backup] daily cron scheduled at 03:00 -> first run in ${(delay / 1000 / 60).toFixed(1)} minutes`);
}

if (RESEND_API_KEY) {
  scheduleDailyBackup();
} else {
  console.warn('[Backup] RESEND_API_KEY missing -> daily backup cron NOT scheduled');
}

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
