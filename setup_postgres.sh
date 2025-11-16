#!/bin/bash

# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE shop_db;
CREATE USER shop_user WITH PASSWORD 'shop_password';
GRANT ALL PRIVILEGES ON DATABASE shop_db TO shop_user;
ALTER USER shop_user CREATEDB;
\q
EOF

echo "PostgreSQL setup complete!"
echo "Database: shop_db"
echo "User: shop_user"
echo "Password: shop_password"