import dotenv from 'dotenv';

// Load environment variables once at startup
dotenv.config();

/**
 * Centralized Environment Variables
 * Single source of truth for all environment variable access
 */
export const env = {
  // Database Configuration
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Authentication Configuration
  PRIVY_APP_ID: process.env.PRIVY_APP_ID || '',
  PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET || '',

  // External Services Configuration
  FAL_KEY: process.env.FAL_KEY || '',

  // Server Configuration
  PORT: process.env.PORT || '3001',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '',
} as const;

/**
 * Environment validation result
 */
export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate all required environment variables
 */
export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const requiredVars = [
    { key: 'SUPABASE_URL', value: env.SUPABASE_URL, name: 'Supabase URL' },
    { key: 'SUPABASE_ANON_KEY', value: env.SUPABASE_ANON_KEY, name: 'Supabase Anonymous Key' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', value: env.SUPABASE_SERVICE_ROLE_KEY, name: 'Supabase Service Role Key' },
    { key: 'PRIVY_APP_ID', value: env.PRIVY_APP_ID, name: 'Privy App ID' },
    { key: 'PRIVY_APP_SECRET', value: env.PRIVY_APP_SECRET, name: 'Privy App Secret' },
    { key: 'FAL_KEY', value: env.FAL_KEY, name: 'Fal.ai API Key' },
  ];

  // Check required variables
  requiredVars.forEach(({ key, value, name }) => {
    if (!value) {
      errors.push(`${name} (${key}) is required`);
    }
  });

  // Validate Supabase URL format
  if (env.SUPABASE_URL) {
    try {
      new URL(env.SUPABASE_URL);
    } catch {
      errors.push('SUPABASE_URL must be a valid URL');
    }
  }

  // Validate port number
  const port = parseInt(env.PORT, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push(`Invalid PORT value: ${env.PORT}. Must be a number between 1 and 65535`);
  }

  // Validate NODE_ENV
  const validEnvs = ['development', 'production', 'test'];
  if (!validEnvs.includes(env.NODE_ENV)) {
    errors.push(`Invalid NODE_ENV: ${env.NODE_ENV}. Must be one of: ${validEnvs.join(', ')}`);
  }

  // No optional warnings for service role key; it is required now

  // Environment-specific warnings
  if (env.NODE_ENV === 'production') {
    if (env.CORS_ORIGIN && env.CORS_ORIGIN.includes('localhost')) {
      warnings.push('Production environment should not use localhost in CORS origins');
    }
    
    if (process.env.NODE_ENV !== 'production') {
      warnings.push('NODE_ENV should be set to "production" in production environment');
    }

    if (port < 1024) {
      warnings.push('Using port below 1024 in production may require root privileges');
    }
  }

  const result: EnvValidationResult = {
    isValid: errors.length === 0,
    errors,
    warnings,
  };

  // Log validation results
  if (result.isValid) {
    console.log('✅ Environment variables validated successfully');
  } else {
    console.error('❌ Environment validation failed:');
    errors.forEach(error => console.error(`   - ${error}`));
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  return result;
}

/**
 * Get typed environment variables
 */
export function getEnv() {
  return {
    ...env,
    PORT: parseInt(env.PORT, 10),
    NODE_ENV: env.NODE_ENV as 'development' | 'production' | 'test',
  };
}

// Validate environment on module load
export const envValidation = validateEnvironment();

// Export default
export default env;
