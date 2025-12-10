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
To start the server do the 'npm start' command in the MiHub_React_Template Folder.

To stop the server hold CTRL + C


Running Docker:
-----------------------------------------------------------------
In the project folder run:

1. docker-compose up -d --build




If having issues with docker try:
-----------------------------------------------------------------

1. docker-compose down -v

2. docker-compose up -d --build




(If you have scripts diables on the system)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass