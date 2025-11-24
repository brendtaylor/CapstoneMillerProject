#Just for reference

docker-compose down -v

docker-compose up --build -d 

docker cp ./Database/init.sql sql-server-db:/tmp/init.sql

docker exec -i sql-server-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "TestPassword!2025" -C -i /tmp/init.sql