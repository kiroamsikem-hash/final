-- Western Anatolia Timeline Database
-- Google Cloud SQL MySQL Database Schema
-- Created for timeline_db database

-- Create database (if needed)
CREATE DATABASE IF NOT EXISTS timeline_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE timeline_db;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Civilizations table
CREATE TABLE IF NOT EXISTS civilizations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    start_year INT,
    end_year INT,
    description TEXT,
    color VARCHAR(7) DEFAULT '#c9a227',
    tags JSON,
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE
);

-- Cell data table for timeline cells
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE,
    INDEX idx_year_civ (year, civilization_id)
);

-- Insert default users
INSERT IGNORE INTO users (username, password, email) VALUES 
('admin', 'admin123', 'admin@timeline.com'),
('demo', 'demo123', 'demo@timeline.com');

-- Insert sample civilizations
INSERT IGNORE INTO civilizations (id, name, region, start_year, end_year, description, color, tags) VALUES 
('civ_minoan', 'Minoan Civilization', 'Crete', -3000, -1100, 'Ancient Aegean civilization centered on Crete', '#8B4513', '["Bronze Age", "Maritime", "Palace Culture"]'),
('civ_hittite', 'Hittite Empire', 'Central Anatolia', -1650, -1180, 'Ancient Anatolian empire known for iron working', '#CD853F', '["Iron Age", "Empire", "Military"]'),
('civ_mycenaean', 'Mycenaean Greece', 'Mainland Greece', -1600, -1100, 'Late Bronze Age civilization of ancient Greece', '#DAA520', '["Bronze Age", "Warfare", "Linear B"]'),
('civ_mesopotamia', 'Mesopotamian Civilizations', 'Mesopotamia', -3500, -539, 'Cradle of civilization between Tigris and Euphrates', '#B8860B', '["Cuneiform", "City-States", "Agriculture"]'),
('civ_ancient_greece', 'Ancient Greece', 'Greek Peninsula', -800, -146, 'Classical civilization known for philosophy and democracy', '#4682B4', '["Philosophy", "Democracy", "Art"]'),
('civ_western_anatolia', 'Western Anatolia', 'Western Turkey', -3000, -30, 'Various civilizations in western Anatolia', '#c9a227', '["Trade", "Cultural Exchange", "Strategic Location"]');

-- Insert sample events
INSERT IGNORE INTO events (id, title, description, start_year, end_year, period, civilization_id, tags) VALUES 
('evt_minoan_palaces', 'First Minoan Palaces', 'Construction of the first palatial complexes in Crete', -2000, -1900, 'Protopalatial', 'civ_minoan', '["Architecture", "Palace Culture"]'),
('evt_knossos_peak', 'Peak of Knossos Palace', 'Knossos reaches its greatest extent and influence', -1700, -1450, 'Neopalatial', 'civ_minoan', '["Architecture", "Peak Period"]'),
('evt_mycenaean_rise', 'Rise of Mycenaean Civilization', 'Emergence of Mycenaean palace centers', -1600, -1500, 'Other', 'civ_mycenaean', '["Emergence", "Palace Centers"]'),
('evt_trojan_war', 'Trojan War (Traditional Date)', 'Legendary war between Greeks and Trojans', -1194, -1184, 'Other', 'civ_mycenaean', '["War", "Legend", "Epic"]'),
('evt_sea_peoples', 'Sea Peoples Invasions', 'Mysterious invasions that ended Bronze Age civilizations', -1200, -1150, 'Postpalatial', 'civ_hittite', '["Invasion", "Bronze Age Collapse"]'),
('evt_hittite_peak', 'Hittite Empire Peak', 'Height of Hittite power under Suppiluliuma I', -1344, -1322, 'Other', 'civ_hittite', '["Empire", "Peak Period"]'),
('evt_greek_colonization', 'Greek Colonization Period', 'Greeks establish colonies across the Mediterranean', -750, -550, 'Archaic', 'civ_ancient_greece', '["Colonization", "Expansion"]'),
('evt_persian_wars', 'Persian Wars', 'Conflicts between Greek city-states and Persian Empire', -499, -449, 'Classical', 'civ_ancient_greece', '["War", "Independence"]'),
('evt_alexander', 'Alexander the Great', 'Macedonian conquest of the Persian Empire', -336, -323, 'Classical', 'civ_ancient_greece', '["Conquest", "Hellenization"]'),
('evt_roman_conquest', 'Roman Conquest of Greece', 'Rome conquers and annexes Greek territories', -146, -146, 'Hellenistic', 'civ_ancient_greece', '["Conquest", "End of Independence"]'),
('evt_lydian_kingdom', 'Lydian Kingdom', 'Powerful kingdom in western Anatolia, invented coinage', -700, -546, 'Archaic', 'civ_western_anatolia', '["Kingdom", "Innovation", "Coinage"]'),
('evt_ionian_revolt', 'Ionian Revolt', 'Greek cities in Anatolia revolt against Persian rule', -499, -493, 'Classical', 'civ_western_anatolia', '["Revolt", "Independence"]'),
('evt_pergamon_kingdom', 'Kingdom of Pergamon', 'Hellenistic kingdom in western Anatolia', -281, -133, 'Hellenistic', 'civ_western_anatolia', '["Hellenistic", "Art", "Library"]');

-- Create indexes for better performance (MySQL compatible)
CREATE INDEX idx_events_civilization ON events(civilization_id);
CREATE INDEX idx_events_period ON events(period);
CREATE INDEX idx_events_years ON events(start_year, end_year);
CREATE INDEX idx_cell_data_year ON cell_data(year);
CREATE INDEX idx_cell_data_civilization ON cell_data(civilization_id);

-- Sample cell data with photos and related cells
INSERT IGNORE INTO cell_data (id, year, civilization_id, photos, tags, notes, name, related_cells) VALUES 
('cell_-1600_civ_minoan', -1600, 'civ_minoan', 
 '[]', 
 '["Palace Period", "Peak Culture"]', 
 'Peak of Minoan civilization with elaborate palace complexes and advanced maritime trade networks.',
 'Minoan Peak Period',
 '[{"id": "rel_1", "year": -1500, "civilizationId": "civ_mycenaean", "note": "A1 - Cultural exchange with Mycenaeans"}]'
),
('cell_-1200_civ_hittite', -1200, 'civ_hittite',
 '[]',
 '["Bronze Age Collapse", "Sea Peoples"]',
 'Period of decline due to Sea Peoples invasions and internal conflicts.',
 'Hittite Decline',
 '[{"id": "rel_2", "year": -1200, "civilizationId": "civ_mycenaean", "note": "B2 - Simultaneous collapse period"}]'
),
('cell_-750_civ_ancient_greece', -750, 'civ_ancient_greece',
 '[]',
 '["Colonization", "Expansion"]',
 'Beginning of the Great Greek Colonization period, establishing cities across the Mediterranean.',
 'Greek Expansion',
 '[{"id": "rel_3", "year": -700, "civilizationId": "civ_western_anatolia", "note": "C3 - Greek colonies in Anatolia"}]'
);

-- Create a view for easy data retrieval (MySQL compatible)
CREATE VIEW timeline_overview AS
SELECT 
    c.name as civilization_name,
    c.region,
    c.color,
    COUNT(DISTINCT e.id) as event_count,
    COUNT(DISTINCT cd.id) as cell_count,
    MIN(c.start_year) as earliest_year,
    MAX(c.end_year) as latest_year
FROM civilizations c
LEFT JOIN events e ON c.id = e.civilization_id
LEFT JOIN cell_data cd ON c.id = cd.civilization_id
GROUP BY c.id, c.name, c.region, c.color;

-- Show summary
SELECT 'Database setup completed successfully!' as status;
SELECT * FROM timeline_overview;