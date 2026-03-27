# Agentic AI Platform - Phase 0 Automation Script (Final Fix)
# Run this script from the project root (where backend/ and frontend/ folders exist)

$ErrorActionPreference = "Stop"

# ------------------- Configuration -------------------
$BackendDir = "backend"
$FrontendDir = "frontend"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = "backups_$Timestamp"

# ------------------- Check current directory -------------------
if (-not (Test-Path $BackendDir) -or -not (Test-Path $FrontendDir)) {
    Write-Host "Error: This script must be run from the project root (where backend/ and frontend/ are located)." -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)"
    exit 1
}

# ------------------- Helper Functions -------------------
function Backup-File {
    param($FilePath)
    if (Test-Path $FilePath) {
        $backupPath = Join-Path $BackupDir $FilePath.Replace(":", "_").Replace("\", "_")
        $backupDir = Split-Path $backupPath -Parent
        if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }
        Copy-Item $FilePath $backupPath -Force
        Write-Host "Backed up: $FilePath -> $backupPath"
    } else {
        Write-Host "File not found, skipping backup: $FilePath"
    }
}

function Write-File {
    param($FilePath, $Content)
    $dir = Split-Path $FilePath -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    Set-Content -Path $FilePath -Value $Content -Encoding UTF8
    Write-Host "Written: $FilePath"
}

# ------------------- Create Backup Folder -------------------
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
Write-Host "Backup folder created: $BackupDir"

# ------------------- 1. Backend: Restore JWT Authentication -------------------
Write-Host "`n[1] Restoring real JWT authentication in backend..."

# Backup original auth.ts
$authFile = Join-Path $BackupDir "backend\src\middleware\auth.ts"
Backup-File (Join-Path $BackendDir "src\middleware\auth.ts")

# New auth.ts content
$authContent = @"
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
"@
Write-File (Join-Path $BackendDir "src\middleware\auth.ts") $authContent

# Update server.ts to apply auth middleware to protected routes.
$serverFile = Join-Path $BackendDir "src\server.ts"
Backup-File $serverFile

# Read current server.ts
$serverContent = Get-Content $serverFile -Raw

# Insert import if not present
if ($serverContent -notmatch "import \{ authenticate \} from") {
    $importLine = "import { authenticate } from './middleware/auth';"
    # Find last import line
    $lastImport = [regex]::Match($serverContent, "(?m)^import .+;").Value
    if ($lastImport) {
        $serverContent = $serverContent -replace "(?m)^import .+;", "$&`n$importLine"
    } else {
        $serverContent = $importLine + "`n" + $serverContent
    }
}

# Apply middleware to route groups
$patterns = @(
    '/api/agents',
    '/api/messages',
    '/api/documents',
    '/api/recordings',
    '/api/aiq',
    '/api/templates',
    '/api/staking',
    '/api/governance',
    '/api/nodes',
    '/api/teams',
    '/api/agent-versions',
    '/api/invite',
    '/api/webhooks',
    '/api/reviews',
    '/api/audit-logs',
    '/api/settings',
    '/api/dashboard'
)

foreach ($route in $patterns) {
    $pattern = "app\.use\('$route',\s*([^,)]+)\)"
    $replacement = "app.use('$route', authenticate, `$1)"
    if ($serverContent -match $pattern) {
        $serverContent = $serverContent -replace $pattern, $replacement
        Write-Host "Applied auth to route: $route"
    } else {
        Write-Host "Route $route not found or already protected"
    }
}

Write-File $serverFile $serverContent

# ------------------- 2. Frontend: Axios Interceptor & Login -------------------
Write-Host "`n[2] Setting up Axios interceptor and login page..."

# Backup api.ts
$apiFile = Join-Path $FrontendDir "lib\api.ts"
Backup-File $apiFile

$apiContent = @"
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `\${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
"@
Write-File $apiFile $apiContent

# Create login page (overwrites if exists)
$loginFile = Join-Path $FrontendDir "app\auth\login\page.tsx"
Backup-File $loginFile

$loginContent = @"
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h1 className="text-2xl mb-4">Login</h1>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          Login
        </button>
      </form>
    </div>
  );
}
"@
Write-File $loginFile $loginContent

# ------------------- 3. Frontend: Agents Pages -------------------
Write-Host "`n[3] Creating agent pages..."

# Agents list page
$agentsListFile = Join-Path $FrontendDir "app\agents\page.tsx"
Backup-File $agentsListFile

$agentsListContent = @"
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  description: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await api.get('/agents');
        setAgents(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">My Agents</h1>
        <Link href="/agents/create" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Agent
        </Link>
      </div>
      {agents.length === 0 ? (
        <p>No agents yet. Create one!</p>
      ) : (
        <ul className="space-y-2">
          {agents.map((agent) => (
            <li key={agent.id} className="border p-4 rounded">
              <h2 className="font-bold">{agent.name}</h2>
              <p>{agent.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
"@
Write-File $agentsListFile $agentsListContent

# Agents create page
$agentsCreateFile = Join-Path $FrontendDir "app\agents\create\page.tsx"
Backup-File $agentsCreateFile

$agentsCreateContent = @"
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function CreateAgentPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/agents', { name, description });
      router.push('/agents');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl mb-4">Create New Agent</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border p-2 rounded"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Agent'}
        </button>
      </form>
    </div>
  );
}
"@
Write-File $agentsCreateFile $agentsCreateContent

# ------------------- 4. Frontend: Restore Sidebar and Header Layout -------------------
Write-Host "`n[4] Restoring full layout with Sidebar and Header..."

$layoutFile = Join-Path $FrontendDir "app\layout.tsx"
Backup-File $layoutFile

$layoutContent = @"
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="p-6 overflow-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
"@
Write-File $layoutFile $layoutContent

# Check if Sidebar and Header components exist, if not create stubs
$sidebarFile = Join-Path $FrontendDir "components\Sidebar.tsx"
if (-not (Test-Path $sidebarFile)) {
    Write-Host "Sidebar component not found, creating a simple one..."
    $sidebarContent = @"
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();
  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/agents', label: 'Agents' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/staking', label: 'Staking' },
    { href: '/governance', label: 'Governance' },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <nav>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block py-2 px-4 rounded \${
              pathname === link.href ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
"@
    Write-File $sidebarFile $sidebarContent
}

$headerFile = Join-Path $FrontendDir "components\Header.tsx"
if (-not (Test-Path $headerFile)) {
    Write-Host "Header component not found, creating a simple one..."
    $headerContent = @"
'use client';

import { useRouter } from 'next/navigation';

const Header = () => {
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Agentic AI Platform</h1>
      <button onClick={handleLogout} className="text-red-500">Logout</button>
    </header>
  );
};

export default Header;
"@
    Write-File $headerFile $headerContent
}

# ------------------- 5. Optional: Seed Database with Demo Templates -------------------
Write-Host "`n[5] Seeding database with demo templates? (y/n)"
$seed = Read-Host
if ($seed -eq 'y') {
    # Create seed file if it doesn't exist
    $seedFile = Join-Path $BackendDir "prisma\seed.ts"
    Backup-File $seedFile

    $seedContent = @"
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.template.createMany({
    data: [
      { name: 'Chatbot', description: 'A simple conversational agent', price: 10 },
      { name: 'Data Analyst', description: 'Analyzes data and generates reports', price: 20 },
      { name: 'Code Assistant', description: 'Helps with programming tasks', price: 15 },
    ],
    skipDuplicates: true,
  });
  console.log('Templates seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
"@
    Write-File $seedFile $seedContent

    # Update package.json to include seed script (if not already)
    $pkgFile = Join-Path $BackendDir "package.json"
    Backup-File $pkgFile
    $pkgJson = Get-Content $pkgFile -Raw | ConvertFrom-Json
    if (-not $pkgJson.prisma) { $pkgJson | Add-Member -MemberType NoteProperty -Name "prisma" -Value @{} }
    $pkgJson.prisma.seed = "ts-node prisma/seed.ts"
    $pkgJson | ConvertTo-Json -Depth 10 | Set-Content $pkgFile -Encoding UTF8

    Write-Host "Running prisma db seed..."
    Push-Location $BackendDir
    npx prisma db seed
    Pop-Location
    Write-Host "Seeding completed."
} else {
    Write-Host "Skipping database seeding."
}

# ------------------- Final Message -------------------
Write-Host "`n[✓] Phase 0 tasks completed!"
Write-Host "Backups are stored in: $BackupDir"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Start backend: cd backend; npm run dev"
Write-Host "2. Start frontend: cd frontend; npm run dev"
Write-Host "3. Login with admin@example.com / admin123 (ensure user exists in DB)"
Write-Host "4. Visit /agents to create your first agent"
Write-Host "5. Check /marketplace to see seeded templates (if seeded)"
Write-Host ""
Write-Host "If you encounter issues, restore files from the backup folder."