# fix_syntax.py
import re

def fix_server_production():
    with open('server_production.py', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Check line 382 specifically
    if len(lines) >= 382:
        print(f"Line 382 before fix: {lines[381]}")
        
        # Common fix for unterminated strings
        lines[381] = lines[381].replace('print("', 'print("')
        
        # Check for missing closing quote
        if lines[381].count('"') % 2 != 0:
            # Add closing quote
            lines[381] = lines[381].rstrip() + '")' + '\n'
    
    with open('server_production.py', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print("Fixed syntax error in server_production.py")

if __name__ == "__main__":
    fix_server_production()