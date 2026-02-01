#!/usr/bin/env python3
"""
Check all files for UTF-8 encoding issues
"""

import os
import sys

def check_file_encoding(filepath):
    """Check if a file can be read as UTF-8"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        return True, None
    except UnicodeDecodeError as e:
        return False, str(e)

# Check all relevant files
files_to_check = []

# Check templates
for file in os.listdir('templates'):
    if file.endswith('.html'):
        files_to_check.append(os.path.join('templates', file))

# Check static files
for root, dirs, files in os.walk('static'):
    for file in files:
        if file.endswith(('.css', '.js', '.html')):
            files_to_check.append(os.path.join(root, file))

# Check Python files
for file in os.listdir('.'):
    if file.endswith('.py'):
        files_to_check.append(file)

print("🔍 Checking files for UTF-8 encoding issues...\n")

problematic_files = []

for filepath in files_to_check:
    if os.path.exists(filepath):
        is_ok, error = check_file_encoding(filepath)
        if not is_ok:
            problematic_files.append((filepath, error))
            print(f"❌ PROBLEM: {filepath}")
            print(f"   Error: {error}")
        else:
            print(f"✅ OK: {filepath}")

if problematic_files:
    print(f"\n🚨 Found {len(problematic_files)} problematic files:")
    for filepath, error in problematic_files:
        print(f"  - {filepath}: {error}")
else:
    print("\n🎉 All files are UTF-8 compatible!")

# If we found problems, fix them
if problematic_files:
    print("\n🔄 Attempting to fix problematic files...")
    for filepath, error in problematic_files:
        try:
            # Read as binary
            with open(filepath, 'rb') as f:
                content = f.read()
            
            # Try to decode with latin-1 (accepts all bytes)
            decoded = content.decode('latin-1')
            
            # Remove problematic characters
            cleaned = ''.join(char for char in decoded if ord(char) >= 32 or char in '\n\r\t')
            
            # Write back as UTF-8
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(cleaned)
            
            print(f"✅ Fixed: {filepath}")
            
        except Exception as e:
            print(f"❌ Failed to fix {filepath}: {e}")
    
    print("\n✅ Fix attempt complete. Please run the check again.")