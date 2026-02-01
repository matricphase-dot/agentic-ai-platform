@echo off 
echo Running investor demo sequence... 
start pitch\pitch_deck.html 
timeout /t 2 
start launch.py 
timeout /t 3 
start http://localhost:8000 
echo Demo ready for investors! 
