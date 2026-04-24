#!/bin/bash
echo "=== TABLES ==="
sudo -u postgres psql timeline_pg -c '\dt'

echo "=== cell_data COLUMNS ==="
sudo -u postgres psql timeline_pg -c "SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name='cell_data' ORDER BY ordinal_position;"

echo "=== cell_data SAMPLE ==="
sudo -u postgres psql timeline_pg -c "SELECT id, year, civilization_id, length(photos::text) as photos_size, tags, notes FROM cell_data LIMIT 5;"

echo "=== RECENT API LOGS ==="
pm2 logs timeline-api --lines 20 --nostream
