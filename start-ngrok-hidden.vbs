
' This script runs Ngrok completely hidden in the background
Set WshShell = CreateObject("WScript.Shell")

' Read the domain from a text file or configure it here
Dim domain
domain = "starch-juniper-atrium.ngrok-free.dev" ' e.g., agenticai.ngrok-free.app

' Start ngrok silently
WshShell.CurrentDirectory = "E:\AgenticAI"
WshShell.Run "cmd /c ngrok.exe http --url=https://" & domain & " 11434 --host-header=rewrite", 0, False
