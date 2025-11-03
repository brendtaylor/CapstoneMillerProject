# Step 1: Build and start containers
docker-compose up -d --build

# Step 2: Create database manually
docker exec -i sql-server-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'TestPassword!2025' -Q "CREATE DATABASE TICKET_SYSTEM"

# Step 3: Restart API container
docker-compose restart api

# Step 4: Copy and run schema script
docker cp "Database/createDatabaseAndTables.sql" sql-server-db:/tmp/createDb.sql
docker exec -i sql-server-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'TestPassword!2025' -C -i /tmp/createDb.sql

# Step 5: Copy and run seed data
docker cp "Database/seedData.txt" sql-server-db:/tmp/seed.sql
docker exec -i sql-server-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'TestPassword!2025' -d TICKET_SYSTEM -C -i /tmp/seed.sql
