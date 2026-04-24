#!/bin/bash
echo "=== Removing foreign key constraints from cell_data and events ==="
sudo -u postgres psql timeline_pg << 'EOF'
-- Remove FK from cell_data
ALTER TABLE cell_data DROP CONSTRAINT IF EXISTS cell_data_civilization_id_fkey;

-- Remove FK from events  
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_civilization_id_fkey;

-- Verify
\d cell_data
EOF
echo "=== FK constraints removed ==="
