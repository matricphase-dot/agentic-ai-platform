import os 
import sys 
from pathlib import Path 
 
def discover_project(): 
    print("?? SEARCHING FOR ALL PROJECT FILES") 
    print("=" * 70) 
    project_root = Path(r'D:\AGENTIC_AI') 
 
    # Find ALL Python files 
    print("\\n?? PYTHON FILES FOUND:") 
    print("-" * 50) 
    python_files = [] 
    for root, dirs, files in os.walk(project_root): 
        for file in files: 
            if file.endswith('.py'): 
                file_path = Path(root) / file 
                relative_path = file_path.relative_to(project_root) 
                python_files.append(str(relative_path)) 
                print(f"  {relative_path}") 
 
    # Find HTML templates 
    print("\\n?? TEMPLATE FILES FOUND:") 
    print("-" * 50) 
    for root, dirs, files in os.walk(project_root): 
        for file in files: 
            if file.endswith('.html'): 
                file_path = Path(root) / file 
                relative_path = file_path.relative_to(project_root) 
                print(f"  {relative_path}") 
 
    # Find configuration files 
    print("\\n?? CONFIGURATION FILES:") 
    print("-" * 50) 
    config_files = ['requirements.txt', 'Dockerfile', 'docker-compose.yml', 'render.yaml', 'setup.py'] 
    for file in config_files: 
        file_path = project_root / file 
        if file_path.exists(): 
            print(f"  ? {file}") 
        else: 
            print(f"  ? {file} (MISSING)") 
 
    # Save results to file 
    with open('project_structure.txt', 'w', encoding='utf-8') as f: 
        f.write("PROJECT STRUCTURE DISCOVERY\\n") 
        f.write("="*60 + "\\n\\n") 
        f.write("Python Files:\\n") 
        for py_file in python_files: 
            f.write(f"  {py_file}\\n") 
 
    print("\\n? Discovery complete. Results saved to project_structure.txt") 
 
if __name__ == "__main__": 
    discover_project() 
