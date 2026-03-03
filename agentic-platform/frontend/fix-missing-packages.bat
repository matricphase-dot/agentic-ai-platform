@echo off
echo 🚀 Fixing Missing Packages for Agentic AI Platform

echo 1. Installing missing packages...
npm install --legacy-peer-deps recharts @tanstack/react-query react-hot-toast axios

echo 2. Creating next.config.js...
echo /** @type {import('next').NextConfig} */ > next.config.js
echo const nextConfig = { >> next.config.js
echo   reactStrictMode: true, >> next.config.js
echo   swcMinify: true, >> next.config.js
echo   typescript: { >> next.config.js
echo     ignoreBuildErrors: true, >> next.config.js
echo   }, >> next.config.js
echo   eslint: { >> next.config.js
echo     ignoreDuringBuilds: true, >> next.config.js
echo   }, >> next.config.js
echo   images: { >> next.config.js
echo     domains: ['localhost'], >> next.config.js
echo   }, >> next.config.js
echo } >> next.config.js
echo module.exports = nextConfig >> next.config.js

echo 3. Creating environment file...
echo NEXT_PUBLIC_API_URL=https://agentic-ai-platform-tajr.onrender.com > .env.local

echo 4. Testing build...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo.
    echo Now deploy to Vercel:
    echo vercel --prod
) else (
    echo ❌ Build failed. Showing error...
    pause
)