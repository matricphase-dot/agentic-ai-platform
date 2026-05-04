const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'FRONTEND_URL',
];

const RECOMMENDED_ENV_VARS = [
  'GROQ_API_KEY',
  'HF_API_KEY',
  'RESEND_API_KEY',
];

export function validateEnvironment(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) missing.push(key);
  }

  for (const key of RECOMMENDED_ENV_VARS) {
    if (!process.env[key]) warnings.push(key);
  }

  if (missing.length > 0) {
    console.error('FATAL: Missing required environment variables:', missing);
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('WARNING: Missing recommended environment variables:', warnings);
    console.warn('Some features may not work correctly.');
  }

  // Validate JWT secret length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error('FATAL: JWT_SECRET must be at least 32 characters');
    process.exit(1);
  }

  // Validate encryption key length (should be 32 bytes / 64 hex chars)
  if (process.env.ENCRYPTION_KEY && 
      Buffer.from(process.env.ENCRYPTION_KEY, 'hex').length !== 32) {
    console.error('FATAL: ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)');
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
}
