#!/bin/bash
echo "=== Testing postgres.js load ==="
node -e "const h=require('/var/www/western-anatolia/expo/api/postgres.js'); console.log('handler:', typeof h, typeof h.default);"

echo ""
echo "=== Testing /api/postgres endpoint ==="
curl -s -X POST http://localhost:8084/api/postgres \
  -H 'Content-Type: application/json' \
  -d '{"action":"getCivilizations"}' | head -c 500

echo ""
echo "=== Testing /api/postgres saveCellData ==="
curl -s -X POST http://localhost:8084/api/postgres \
  -H 'Content-Type: application/json' \
  -d '{"action":"saveCellData","data":{"id":"test-123","year":-1500,"civilizationId":"test-civ","photos":[],"tags":[],"notes":"test"}}' | head -c 500
