
' This script runs Ngrok completely hidden in the background
Set WshShell = CreateObject("WScript.Shell")

' Read the domain from a text file or configure it here
Dim domain
domain = "starch-juniper-atrium.ngrok-free.dev" ' e.g., agenticai.ngrok-free.app

' Start ngrok silently
WshShell.Run "cmd /c ngrok http --domain=" & domain & " 11434", 0, False
