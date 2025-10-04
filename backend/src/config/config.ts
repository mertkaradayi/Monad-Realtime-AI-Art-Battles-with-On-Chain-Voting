import { env } from './env.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Configuration Types
 */
export interface DatabaseConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
}

export interface AuthConfig {
  privy: {
    appId: string;
    appSecret: string;
  };
}

export interface ServerConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
}

export interface ExternalConfig {
  fal: {
    apiKey: string;
  };
}

export interface AppConfig {
  database: DatabaseConfig;
  auth: AuthConfig;
  server: ServerConfig;
  external: ExternalConfig;
}

/**
 * Database Configuration
 */
export function getDatabaseConfig(): DatabaseConfig {
  return {
    supabase: {
      url: env.SUPABASE_URL,
      anonKey: env.SUPABASE_ANON_KEY,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    },
  };
}

/**
 * Authentication Configuration
 */
export function getAuthConfig(): AuthConfig {
  return {
    privy: {
      appId: env.PRIVY_APP_ID,
      appSecret: env.PRIVY_APP_SECRET,
    },
  };
}

/**
 * Server Configuration
 */
export function getServerConfig(): ServerConfig {
  const port = parseInt(env.PORT, 10);
  const nodeEnv = env.NODE_ENV as 'development' | 'production' | 'test';
  
  // CORS configuration
  let corsOrigins: string | string[];
  
  if (env.CORS_ORIGIN) {
    corsOrigins = env.CORS_ORIGIN.includes(',') 
      ? env.CORS_ORIGIN.split(',').map(o => o.trim()) 
      : env.CORS_ORIGIN;
  } else {
    // Default CORS origins based on environment
    corsOrigins = nodeEnv === 'production' 
      ? ['https://your-production-domain.com'] // Update this for production
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'];
  }

  return {
    port,
    nodeEnv,
    cors: {
      origin: corsOrigins,
      credentials: true,
    },
  };
}

/**
 * External Services Configuration
 */
export function getExternalConfig(): ExternalConfig {
  return {
    fal: {
      apiKey: env.FAL_KEY,
    },
  };
}

/**
 * Main Configuration Object
 */
export const config: AppConfig = {
  database: getDatabaseConfig(),
  auth: getAuthConfig(),
  server: getServerConfig(),
  external: getExternalConfig(),
};

// Types are already exported above with the interfaces

// Create Supabase clients
export const supabase: SupabaseClient = createClient(
  config.database.supabase.url, 
  config.database.supabase.anonKey
);

export const supabaseAdmin: SupabaseClient = createClient(
  config.database.supabase.url, 
  config.database.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Default export
export default config;
