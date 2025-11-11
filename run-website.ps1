# Start website up

# Start Docker
Set-Location "./Project"
docker-compose up -d --build

# Start Website
Set-Location "..\ProjectTempate\UM Flint Quality Template\UM Flint Quality Template\MiHub_React_Template"
npm start
