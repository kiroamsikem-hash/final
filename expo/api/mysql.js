// Google Cloud SQL MySQL API endpoint
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'timeline_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool for better performance
const pool = mysql.createPool(dbConfig);

// Initialize database tables
async function initializeTables() {
  try {
    console.log('🔄 Initializing database tables...');
    
    // Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Civilizations table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS civilizations (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        region VARCHAR(100),
        start_year INT,
        end_year INT,
        description TEXT,
        color VARCHAR(7),
        tags JSON,
        photo_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Events table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        start_year INT,
        end_year INT,
        period VARCHAR(50),
        civilization_id VARCHAR(50),
        tags JSON,
        photo_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE
      )
    `);

    // Cell data table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS cell_data (
        id VARCHAR(100) PRIMARY KEY,
        year INT NOT NULL,
        civilization_id VARCHAR(50) NOT NULL,
        photos JSON,
        tags JSON,
        notes TEXT,
        name VARCHAR(100),
        related_cells JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE
      )
    `);

    // Insert default users if they don't exist
    await pool.execute(`
      INSERT IGNORE INTO users (username, password) VALUES 
      ('admin', 'admin123'),
      ('demo', 'demo123')
    `);

    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('⚠️ Database initialization failed:', error.message);
    console.log('📱 App will run in demo mode');
    return false;
  }
}

// Initialize tables on startup (with timeout)
let databaseAvailable = false;
const initPromise = Promise.race([
  initializeTables(),
  new Promise(resolve => setTimeout(() => resolve(false), 5000)) // 5 second timeout
]).then(result => {
  databaseAvailable = !!result;
  return result;
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Wait for database initialization
  await initPromise;

  if (!databaseAvailable) {
    return res.status(503).json({ 
      error: 'Database not available', 
      message: 'App running in demo mode' 
    });
  }

  try {
    const { action, data } = req.body;

    switch (action) {
      case 'login':
        return await handleLogin(req, res, data);
      case 'register':
        return await handleRegister(req, res, data);
      case 'getCivilizations':
        return await handleGetCivilizations(req, res);
      case 'getEvents':
        return await handleGetEvents(req, res);
      case 'getCellData':
        return await handleGetCellData(req, res);
      case 'saveCivilization':
        return await handleSaveCivilization(req, res, data);
      case 'saveEvent':
        return await handleSaveEvent(req, res, data);
      case 'saveCellData':
        return await handleSaveCellData(req, res, data);
      case 'deleteCivilization':
        return await handleDeleteCivilization(req, res, data);
      case 'deleteEvent':
        return await handleDeleteEvent(req, res, data);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('MySQL Error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Login handler - now supports bcrypt hashed passwords
async function handleLogin(req, res, data) {
  const { username, password } = data;
  
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );

  if (rows.length > 0) {
    const user = rows[0];
    
    // Check if password is hashed (starts with $2a$ or $2b$ for bcrypt)
    const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
    
    let passwordMatch = false;
    if (isHashed) {
      // Compare with bcrypt
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      // Plain text comparison (for backward compatibility)
      passwordMatch = password === user.password;
    }
    
    if (passwordMatch) {
      res.status(200).json({ success: true, data: { username: user.username } });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
}

// Register handler
async function handleRegister(req, res, data) {
  const { username, password } = data;
  
  try {
    // Check if user already exists
    const [existing] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Username already exists' });
    }
    
    // Insert new user with hashed password
    await pool.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password] // Password is already hashed from auth.ts
    );
    
    res.status(200).json({ success: true, data: { username } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Safe JSON parse helper
function safeJSONParse(jsonString, defaultValue = []) {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('⚠️ Invalid JSON, returning default:', jsonString);
    return defaultValue;
  }
}

// Get civilizations
async function handleGetCivilizations(req, res) {
  const [rows] = await pool.execute('SELECT * FROM civilizations ORDER BY start_year DESC');
  
  const civilizations = rows.map(row => ({
    ...row,
    tags: safeJSONParse(row.tags, [])
  }));

  res.status(200).json({ success: true, data: civilizations });
}

// Get events
async function handleGetEvents(req, res) {
  const [rows] = await pool.execute('SELECT * FROM events ORDER BY start_year DESC');
  
  const events = rows.map(row => ({
    ...row,
    tags: safeJSONParse(row.tags, [])
  }));

  res.status(200).json({ success: true, data: events });
}

// Get cell data
async function handleGetCellData(req, res) {
  const [rows] = await pool.execute('SELECT * FROM cell_data');
  
  const cellData = rows.map(row => ({
    ...row,
    photos: safeJSONParse(row.photos, []),
    tags: safeJSONParse(row.tags, []),
    related_cells: safeJSONParse(row.related_cells, [])
  }));

  res.status(200).json({ success: true, data: cellData });
}

// Save civilization
async function handleSaveCivilization(req, res, data) {
  const { id, name, region, start_year, end_year, description, color, tags, photo_url } = data;
  
  await pool.execute(`
    INSERT INTO civilizations (id, name, region, start_year, end_year, description, color, tags, photo_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    region = VALUES(region),
    start_year = VALUES(start_year),
    end_year = VALUES(end_year),
    description = VALUES(description),
    color = VALUES(color),
    tags = VALUES(tags),
    photo_url = VALUES(photo_url)
  `, [id, name, region, start_year, end_year, description, color, JSON.stringify(tags || []), photo_url]);

  res.status(200).json({ success: true });
}

// Save event
async function handleSaveEvent(req, res, data) {
  const { id, title, description, start_year, end_year, period, civilization_id, tags, photo_url } = data;
  
  await pool.execute(`
    INSERT INTO events (id, title, description, start_year, end_year, period, civilization_id, tags, photo_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    start_year = VALUES(start_year),
    end_year = VALUES(end_year),
    period = VALUES(period),
    civilization_id = VALUES(civilization_id),
    tags = VALUES(tags),
    photo_url = VALUES(photo_url)
  `, [id, title, description, start_year, end_year, period, civilization_id, JSON.stringify(tags || []), photo_url]);

  res.status(200).json({ success: true });
}

// Save cell data
async function handleSaveCellData(req, res, data) {
  const { id, year, civilization_id, photos, tags, notes, name, related_cells } = data;
  
  await pool.execute(`
    INSERT INTO cell_data (id, year, civilization_id, photos, tags, notes, name, related_cells)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    photos = VALUES(photos),
    tags = VALUES(tags),
    notes = VALUES(notes),
    name = VALUES(name),
    related_cells = VALUES(related_cells)
  `, [id, year, civilization_id, JSON.stringify(photos || []), JSON.stringify(tags || []), notes, name, JSON.stringify(related_cells || [])]);

  res.status(200).json({ success: true });
}

// Delete civilization
async function handleDeleteCivilization(req, res, data) {
  const { id } = data;
  
  await pool.execute('DELETE FROM civilizations WHERE id = ?', [id]);
  res.status(200).json({ success: true });
}

// Delete event
async function handleDeleteEvent(req, res, data) {
  const { id } = data;
  
  await pool.execute('DELETE FROM events WHERE id = ?', [id]);
  res.status(200).json({ success: true });
}