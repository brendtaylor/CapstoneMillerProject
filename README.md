# CapstoneMillerProject
This is the front end capstone project for miller industries.

Installation:
-----------------------------------------------------------------
To install Node.js : "winget install --id OpenJS.NodeJS.LTS -e"

You may need to add the 'nodejs' file path to the environment variable 'PATH'

To run this you'll need to do the 'npm install' command to install all dependencies.


//If issues with npm not having permissions do : "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser"


Running:
-----------------------------------------------------------------
To start the server do the 'npm start' command.

To stop the server do the CTRL + C


Running Docker:
In the project foler run:

1. docker-compose up -d --build

2. docker exec -it sql-server-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'TestPassword!2025' -C

3.  You should see a “1>”, enter the following:
    1> CREATE DATABASE TICKET_SYSTEM;
    2>GO
    1>exit

4. docker-compose restart api

5. docker cp Database/createDatabaseAndTables sql-server-db:/tmp/createDb.sql

6. docker exec -it sql-server-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'TestPassword!2025' -C -i /tmp/createDb.sql

7. docker cp "Database\seedData.txt" sql-server-db:/tmp/seed.sql

8. docker exec -it sql-server-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'TestPassword!2025' -d TICKET_SYSTEM -C -i /tmp/seed.sql 


Or

In Project Folder:

(If you have scripts diables on the system)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

.\setup.ps1