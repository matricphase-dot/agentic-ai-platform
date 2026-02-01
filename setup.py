# D:\AGENTIC_AI\setup.py
from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="agentic-ai",
    version="3.0.0",
    author="Agentic AI",
    author_email="hello@agentic.ai",
    description="Unified Platform for AI Agent Management",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/agentic-ai/platform",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Intended Audience :: Information Technology",
        "License :: Other/Proprietary License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    python_requires=">=3.8",
    install_requires=[
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0",
        "websockets==12.0",
        "sqlalchemy==2.0.25",
        "pyautogui==0.9.54",
        "psutil==5.9.8",
        "pillow==10.1.0",
        "passlib[bcrypt]==1.7.4",
        "python-jose[cryptography]==3.3.0",
        "requests==2.31.0",
        "colorama==0.4.6",
        "websocket-client==1.6.4",
        "python-multipart==0.0.6",
        "aiofiles==23.2.1",
        "jinja2==3.1.2",
        "pydantic==2.5.0",
    ],
    entry_points={
        "console_scripts": [
            "agentic-ai=agentic_ai.__main__:main",
        ],
    },
    include_package_data=True,
    package_data={
        "agentic_ai": ["templates/*", "static/*", "static/**/*"],
    },
)