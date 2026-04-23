-- Western Anatolia Timeline Database
-- Google Cloud SQL MySQL Database Schema (Simple Version)
-- Created for timeline_db database

-- Use the database
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
    FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE
);

-- Insert default users (only if not exists)
INSERT INTO users (username, password, email) 
SELECT 'admin', 'admin123', 'admin@timeline.com'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO users (username, password, email) 
SELECT 'demo', 'demo123', 'demo@timeline.com'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'demo');

-- Insert sample civilizations (only if not exists)
INSERT INTO civilizations (id, name, region, start_year, end_year, description, color, tags) 
SELECT 'civ_minoan', 'Minoan Civilization', 'Crete', -3000, -1100, 'Ancient Aegean civilization centered on Crete', '#8B4513', JSON_ARRAY('Bronze Age', 'Maritime', 'Palace Culture')
WHERE NOT EXISTS (SELECT 1 FROM civilizations WHERE id = 'civ_minoan');

INSERT INTO civilizations (id, name, region, start_year, end_year, description, color, tags) 
SELECT 'civ_hittite', 'Hittite Empire', 'Central Anatolia', -1650, -1180, 'Ancient Anatolian empire known for iron working', '#CD853F', JSON_ARRAY('Iron Age', 'Empire', 'Military')
WHERE NOT EXISTS (SELECT 1 FROM civilizations WHERE id = 'civ_hittite');

INSERT INTO civilizations (id, name, region, start_year, end_year, description, color, tags) 
SELECT 'civ_mycenaean', 'Mycenaean Greece', 'Mainland Greece', -1600, -1100, 'Late Bronze Age civilization of ancient Greece', '#DAA520', JSON_ARRAY('Bronze Age', 'Warfare', 'Linear B')
WHERE NOT EXISTS (SELECT 1 FROM civilizations WHERE id = 'civ_mycenaean');

INSERT INTO civilizations (id, name, region, start_year, end_year, description, color, tags) 
SELECT 'civ_mesopotamia', 'Mesopotamian Civilizations', 'Mesopotamia', -3500, -539, 'Cradle of civilization between Tigris and Euphrates', '#B8860B', JSON_ARRAY('Cuneiform', 'City-States', 'Agriculture')
WHERE NOT EXISTS (SELECT 1 FROM civilizations WHERE id = 'civ_mesopotamia');

INSERT INTO civilizations (id, name, region, start_year, end_year, description, color, tags) 
SELECT 'civ_ancient_greece', 'Ancient Greece', 'Greek Peninsula', -800, -146, 'Classical civilization known for philosophy and democracy', '#4682B4', JSON_ARRAY('Philosophy', 'Democracy', 'Art')
WHERE NOT EXISTS (SELECT 1 FROM civilizations WHERE id = 'civ_ancient_greece');

INSERT INTO civilizations (id, name, region, start_year, end_year, description, color, tags) 
SELECT 'civ_western_anatolia', 'Western Anatolia', 'Western Turkey', -3000, -30, 'Various civilizations in western Anatolia', '#c9a227', JSON_ARRAY('Trade', 'Cultural Exchange', 'Strategic Location')
WHERE NOT EXISTS (SELECT 1 FROM civilizations WHERE id = 'civ_western_anatolia');

-- Insert sample events (only if not exists)
INSERT INTO events (id, title, description, start_year, end_year, period, civilization_id, tags) 
SELECT 'evt_minoan_palaces', 'First Minoan Palaces', 'Construction of the first palatial complexes in Crete', -2000, -1900, 'Protopalatial', 'civ_minoan', JSON_ARRAY('Architecture', 'Palace Culture')
WHERE NOT EXISTS (SELECT 1 FROM events WHERE id = 'evt_minoan_palaces');

INSERT INTO events (id, title, description, start_year, end_year, period, civilization_id, tags) 
SELECT 'evt_knossos_peak', 'Peak of Knossos Palace', 'Knossos reaches its greatest extent and influence', -1700, -1450, 'Neopalatial', 'civ_minoan', JSON_ARRAY('Architecture', 'Peak Period')
WHERE NOT EXISTS (SELECT 1 FROM events WHERE id = 'evt_knossos_peak');

INSERT INTO events (id, title, description, start_year, end_year, period, civilization_id, tags) 
SELECT 'evt_mycenaean_rise', 'Rise of Mycenaean Civilization', 'Emergence of Mycenaean palace centers', -1600, -1500, 'Other', 'civ_mycenaean', JSON_ARRAY('Emergence', 'Palace Centers')
WHERE NOT EXISTS (SELECT 1 FROM events WHERE id = 'evt_mycenaean_rise');

INSERT INTO events (id, title, description, start_year, end_year, period, civilization_id, tags) 
SELECT 'evt_trojan_war', 'Trojan War (Traditional Date)', 'Legendary war between Greeks and Trojans', -1194, -1184, 'Other', 'civ_mycenaean', JSON_ARRAY('War', 'Legend', 'Epic')
WHERE NOT EXISTS (SELECT 1 FROM events WHERE id = 'evt_trojan_war');

INSERT INTO events (id, title, description, start_year, end_year, period, civilization_id, tags) 
SELECT 'evt_sea_peoples', 'Sea Peoples Invasions', 'Mysterious invasions that ended Bronze Age civilizations', -1200, -1150, 'Postpalatial', 'civ_hittite', JSON_ARRAY('Invasion', 'Bronze Age Collapse')
WHERE NOT EXISTS (SELECT 1 FROM events WHERE id = 'evt_sea_peoples');

INSERT INTO events (id, title, description, start_year, end_year, period, civilization_id, tags) 
SELECT 'evt_hittite_peak', 'Hittite Empire Peak', 'Height of Hittite power under Suppiluliuma I', -1344, -1322, 'Other', 'civ_hittite', JSON_ARRAY('Empire', 'Peak Period')
WHERE NOT EXISTS (SELECT 1 FROM events WHERE id = 'evt_hittite_peak');

INSERT INTO events (id, title, description, start_year, end_year, period, civilization_id, tags) 
SELECT 'evt_greek_colonization', 'Greek Colonization Period', 'Greeks establish colonies across the Mediterranean', -750, -550, 'Archaic', 'civ_ancient_greece', JSON_ARRAY('Colonization', 'Expansion')
WHERE NOT EXISTS (SELECT 1 FROM events WHERE id = 'evt_greek_colonization');

INSERT INTO events (id, title, description, start_year, end_year, period, civilization_id, tags) 
SELECT 'evt_persian_wars', 'Persian Wars', 'Conflicts between Greek city-states and Persian Empire', -499, -449, 'Classical', 'civ_ancient_greece', JSON_ARRAY('War', 'Independence')
WHERE NOT EXISTS (SELECT 1 FROM events WHERE id = 'evt_persian_wars');

INSERT INTO events (id, title, description, start_year, end_year, period, civilization_id, tags) 
SELECT 'evt_alexander', 'Alexander the Great', 'Macedonian conquest of the Persian Empire', -336, -323, 'Classical', 'civ_ancient_greece', JSON_ARRAY('Conquest', 'Hellenization')
WHERE NOT EXISTS (SELECT 1 FROM events WHERE id = 'evt_alexander');

INSERT INTO events (id, title, description, start_year, end_year, period, civilization_id, tags) 
SELECT 'evt_roman_conquest', 'Roman Conquest of Greece', 'Rome conquers and annexes Greek territories', -146, -146, 'Hellenistic', 'civ_ancient_greece', JSON_ARRAY('Conquest', 'End of Independence')
WHERE NOT EXISTS (SELECT 1 FROM events WHERE id = 'evt_roman_conquest');

INSERT INTO events (id, title, description, start_year, end_year, period, civilization_id, tags) 
SELECT 'evt_lydian_kingdom', 'Lydian Kingdom', 'Powerful kingdom in western Anatolia, invented coinage', -700, -546, 'Archaic', 'civ_western_anatolia', JSON_ARRAY('Kingdom', 'Innovation', 'Coinage')
WHERE NOT EXISTS (SELECT 1 FROM events WHERE id = 'evt_lydian_kingdom');

INSERT INTO events (id, title, description, start_year, end_year, period, civilization_id, tags) 
SELECT 'evt_ionian_revolt', 'Ionian Revolt', 'Greek cities in Anatolia revolt against Persian rule', -499, -493, 'Classical', 'civ_western_anatolia', JSON_ARRAY('Revolt', 'Independence')
WHERE NOT EXISTS (SELECT 1 FROM events WHERE id = 'evt_ionian_revolt');

INSERT INTO events (id, title, description, start_year, end_year, period, civilization_id, tags) 
SELECT 'evt_pergamon_kingdom', 'Kingdom of Pergamon', 'Hellenistic kingdom in western Anatolia', -281, -133, 'Hellenistic', 'civ_western_anatolia', JSON_ARRAY('Hellenistic', 'Art', 'Library')
WHERE NOT EXISTS (SELECT 1 FROM events WHERE id = 'evt_pergamon_kingdom');

-- Sample cell data with photos and related cells (only if not exists)
INSERT INTO cell_data (id, year, civilization_id, photos, tags, notes, name, related_cells) 
SELECT 'cell_-1600_civ_minoan', -1600, 'civ_minoan', 
 JSON_ARRAY(), 
 JSON_ARRAY('Palace Period', 'Peak Culture'), 
 'Peak of Minoan civilization with elaborate palace complexes and advanced maritime trade networks.',
 'Minoan Peak Period',
 JSON_ARRAY(JSON_OBJECT('id', 'rel_1', 'year', -1500, 'civilizationId', 'civ_mycenaean', 'note', 'A1 - Cultural exchange with Mycenaeans'))
WHERE NOT EXISTS (SELECT 1 FROM cell_data WHERE id = 'cell_-1600_civ_minoan');

INSERT INTO cell_data (id, year, civilization_id, photos, tags, notes, name, related_cells) 
SELECT 'cell_-1200_civ_hittite', -1200, 'civ_hittite',
 JSON_ARRAY(),
 JSON_ARRAY('Bronze Age Collapse', 'Sea Peoples'),
 'Period of decline due to Sea Peoples invasions and internal conflicts.',
 'Hittite Decline',
 JSON_ARRAY(JSON_OBJECT('id', 'rel_2', 'year', -1200, 'civilizationId', 'civ_mycenaean', 'note', 'B2 - Simultaneous collapse period'))
WHERE NOT EXISTS (SELECT 1 FROM cell_data WHERE id = 'cell_-1200_civ_hittite');

INSERT INTO cell_data (id, year, civilization_id, photos, tags, notes, name, related_cells) 
SELECT 'cell_-750_civ_ancient_greece', -750, 'civ_ancient_greece',
 JSON_ARRAY(),
 JSON_ARRAY('Colonization', 'Expansion'),
 'Beginning of the Great Greek Colonization period, establishing cities across the Mediterranean.',
 'Greek Expansion',
 JSON_ARRAY(JSON_OBJECT('id', 'rel_3', 'year', -700, 'civilizationId', 'civ_western_anatolia', 'note', 'C3 - Greek colonies in Anatolia'))
WHERE NOT EXISTS (SELECT 1 FROM cell_data WHERE id = 'cell_-750_civ_ancient_greece');

-- Show summary
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as civilization_count FROM civilizations;
SELECT COUNT(*) as event_count FROM events;
SELECT COUNT(*) as cell_data_count FROM cell_data;