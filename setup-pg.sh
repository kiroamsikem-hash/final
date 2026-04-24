#!/bin/bash
sudo -u postgres psql << 'EOF'
CREATE USER timeline_admin WITH PASSWORD 'Timeline2024!Strong';
CREATE DATABASE timeline_pg OWNER timeline_admin;
GRANT ALL PRIVILEGES ON DATABASE timeline_pg TO timeline_admin;
\q
EOF
echo "DB SETUP DONE"
