// PostgreSQL API endpoint - MUCH BETTER for large data!
const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://admin:senin_cok_guclu_sifren@db.senindomainin.com:6432/ana_veritabani',
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database tables
async function initializeTables() {
  try {
    console.log('🔄 Initializing PostgreSQL tables...');
    
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Civilizations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS civilizations (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        region VARCHAR(100),
        start_year INTEGER,
        end_year INTEGER,
        description TEXT,
        color VARCHAR(7),
        tags JSONB,
        photo_url TEXT,
        display_order INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        start_year INTEGER,
        end_year INTEGER,
        period VARCHAR(50),
        civilization_id VARCHAR(50),
        tags JSONB,
        photo_url TEXT,
        color VARCHAR(7),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE
      )
    `);

    // Cell data table - JSONB for photos (handles large data!)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cell_data (
        id VARCHAR(100) PRIMARY KEY,
        year INTEGER NOT NULL,
        civilization_id VARCHAR(50) NOT NULL,
        photos JSONB,
        tags JSONB,
        notes TEXT,
        name VARCHAR(100),
        related_cells JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE
      )
    `);

    // Insert default admin user
    await pool.query(`
      INSERT INTO users (username, password) VALUES ('admin', 'melih.Berat2009')
      ON CONFLICT (username) DO NOTHING
    `);

    console.log('✅ PostgreSQL tables initialized successfully');
    return true;
  } catch (error) {
    console.error('⚠️ PostgreSQL initialization failed:', error.message);
    return false;
  }
}

// Initialize on startup
let databaseAvailable = false;
const initPromise = initializeTables().then(result => {
  databaseAvailable = !!result;
  return result;
});

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await initPromise;

  if (!databaseAvailable) {
    return res.status(503).json({ error: 'Database not available' });
  }

  try {
    const { action, data } = req.body;

    switch (action) {
      case 'login':
        return await handleLogin(req, res, data);
      case 'getCivilizations':
        return await handleGetCivilizations(req, res);
      case 'getEvents':
        return await handleGetEvents(req, res);
      case 'getCellData':
        return await handleGetCellData(req, res);
      case 'getPeriods':
        return await handleGetPeriods(req, res);
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
    console.error('PostgreSQL Error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Login
async function handleLogin(req, res, data) {
  const { username, password } = data;
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

  if (result.rows.length > 0 && result.rows[0].password === password) {
    res.status(200).json({ success: true, data: { username } });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
}

// Get civilizations
async function handleGetCivilizations(req, res) {
  const result = await pool.query('SELECT * FROM civilizations ORDER BY display_order ASC NULLS LAST, start_year DESC');
  res.status(200).json({ success: true, data: result.rows });
}

// Get events
async function handleGetEvents(req, res) {
  const result = await pool.query('SELECT * FROM events ORDER BY start_year DESC');
  res.status(200).json({ success: true, data: result.rows });
}

// Get cell data
async function handleGetCellData(req, res) {
  const result = await pool.query('SELECT * FROM cell_data');
  res.status(200).json({ success: true, data: result.rows });
}

// Get periods
async function handleGetPeriods(req, res) {
  const result = await pool.query('SELECT DISTINCT period FROM events WHERE period IS NOT NULL ORDER BY period');
  const periods = result.rows.map(row => row.period);
  res.status(200).json({ success: true, data: periods });
}

// Save civilization
async function handleSaveCivilization(req, res, data) {
  const { id, name, region, startYear, start_year, endYear, end_year, description, color, tags, photoUrl, photo_url, displayOrder, display_order } = data;
  
  await pool.query(`
    INSERT INTO civilizations (id, name, region, start_year, end_year, description, color, tags, photo_url, display_order)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    region = EXCLUDED.region,
    start_year = EXCLUDED.start_year,
    end_year = EXCLUDED.end_year,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    tags = EXCLUDED.tags,
    photo_url = EXCLUDED.photo_url,
    display_order = EXCLUDED.display_order
  `, [id, name, region, start_year || startYear, end_year || endYear, description, color, JSON.stringify(tags || []), photo_url || photoUrl, display_order || displayOrder]);

  res.status(200).json({ success: true });
}

// Save event
async function handleSaveEvent(req, res, data) {
  const { id, title, description, startYear, start_year, endYear, end_year, period, civilizationId, civilization_id, tags, photoUrl, photo_url, color } = data;
  
  await pool.query(`
    INSERT INTO events (id, title, description, start_year, end_year, period, civilization_id, tags, photo_url, color)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    start_year = EXCLUDED.start_year,
    end_year = EXCLUDED.end_year,
    period = EXCLUDED.period,
    civilization_id = EXCLUDED.civilization_id,
    tags = EXCLUDED.tags,
    photo_url = EXCLUDED.photo_url,
    color = EXCLUDED.color
  `, [id, title, description, start_year || startYear, end_year || endYear, period, civilization_id || civilizationId, JSON.stringify(tags || []), photo_url || photoUrl, color]);

  res.status(200).json({ success: true });
}

// Save cell data - JSONB handles large photos!
async function handleSaveCellData(req, res, data) {
  console.log('📥 Saving cell data to PostgreSQL');
  
  const { id, year, civilizationId, civilization_id, photos, tags, notes, name, relatedCells, related_cells } = data;
  
  const finalCivId = civilization_id || civilizationId;
  const finalRelatedCells = related_cells || relatedCells;
  
  try {
    await pool.query(`
      INSERT INTO cell_data (id, year, civilization_id, photos, tags, notes, name, related_cells)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
      photos = EXCLUDED.photos,
      tags = EXCLUDED.tags,
      notes = EXCLUDED.notes,
      name = EXCLUDED.name,
      related_cells = EXCLUDED.related_cells
    `, [id, year, finalCivId, JSON.stringify(photos || []), JSON.stringify(tags || []), notes, name, JSON.stringify(finalRelatedCells || [])]);
    
    console.log('✅ Cell data saved to PostgreSQL!');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ PostgreSQL save error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Delete civilization
async function handleDeleteCivilization(req, res, data) {
  await pool.query('DELETE FROM civilizations WHERE id = $1', [data.id]);
  res.status(200).json({ success: true });
}

// Delete event
async function handleDeleteEvent(req, res, data) {
  await pool.query('DELETE FROM events WHERE id = $1', [data.id]);
  res.status(200).json({ success: true });
}

module.exports = handler;
module.exports.default = handler;
