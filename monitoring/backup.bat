@echo off 
echo Creating backup of Agentic AI Platform... 
set timestamp=1-02_1525 
7z a -tzip "D:\AGENTIC_AI\backups\agentic_backup_%timestamp%.zip" "D:\AGENTIC_AI\*" -x!D:\AGENTIC_AI\backups\* -x!D:\AGENTIC_AI\logs\* 
echo Backup complete! 
