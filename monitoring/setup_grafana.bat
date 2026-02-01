@echo off 
echo Setting up Grafana monitoring... 
docker run -d --name=grafana -p 3000:3000 grafana/grafana 
timeout /t 10 
echo Grafana running at http://localhost:3000 
echo Default login: admin/admin 
