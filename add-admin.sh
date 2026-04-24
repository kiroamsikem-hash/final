#!/bin/bash
sudo -u postgres psql timeline_pg << 'EOF'
INSERT INTO users (username, password) VALUES ('admin', 'melih.Berat2009') ON CONFLICT (username) DO UPDATE SET password='melih.Berat2009';
SELECT * FROM users;
EOF
echo "ADMIN USER ADDED"
