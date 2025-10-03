# Configuration System

This directory contains the centralized configuration management system for the Battle Semantic backend.

## Overview

The configuration system provides:
- ✅ **Type-safe** configuration access
- ✅ **Centralized environment loading** - Single source of truth for all environment variables
- ✅ **Environment validation** on startup
- ✅ **Modular** configuration organization
- ✅ **Error handling** for missing environment variables
- ✅ **Industry best practices** - Follows centralized env loading pattern

## Structure

```
src/config/
├── env.ts            # Centralized environment variables and validation
├── config.ts         # All configuration objects and types
├── supabase.ts       # Supabase client setup (uses centralized config)
└── README.md         # This documentation
```

## Usage

### Basic Usage

```typescript
import { config } from './config/config.js';

// Access configuration sections
const { database, auth, server, external } = config;

// Use configuration values
const port = config.server.port;
const supabaseUrl = config.database.supabase.url;
```

### Direct Environment Access

```typescript
import { env } from './config/env.js';

// Access environment variables directly (type-safe)
const supabaseUrl = env.SUPABASE_URL;
const port = parseInt(env.PORT, 10);
const nodeEnv = env.NODE_ENV;
```

### Individual Configuration Access

```typescript
import { config } from './config/config.js';

// Access specific configuration sections
const dbConfig = config.database;
const authConfig = config.auth;
```

### Environment Validation

```typescript
import { envValidation, validateEnvironment } from './config/env.js';

// Check validation result (validated on module load)
if (!envValidation.isValid) {
  console.error('Environment errors:', envValidation.errors);
  process.exit(1);
}

// Re-validate if needed
const validation = validateEnvironment();
```

### Configuration Validation

```typescript
import { envValidation } from './config/env.js';

if (!envValidation.isValid) {
  console.error('Configuration errors:', envValidation.errors);
  process.exit(1);
}

if (envValidation.warnings.length > 0) {
  console.warn('Configuration warnings:', envValidation.warnings);
}
```

## Environment Variables

### Required Variables

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Privy Configuration
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# Fal.ai Configuration
FAL_KEY=your_fal_ai_api_key
```

### Optional Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=https://your-domain.com,https://another-domain.com
```

## Configuration Types

### DatabaseConfig
```typescript
interface DatabaseConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
}
```

### AuthConfig
```typescript
interface AuthConfig {
  privy: {
    appId: string;
    appSecret: string;
  };
}
```

### ServerConfig
```typescript
interface ServerConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
}
```

### ExternalConfig
```typescript
interface ExternalConfig {
  fal: {
    apiKey: string;
  };
}
```

## Validation

The configuration system validates:

1. **Required Environment Variables**: All required variables must be present
2. **URL Format**: Supabase URL must be a valid URL
3. **Port Range**: Port must be between 1 and 65535
4. **Environment-Specific**: Production-specific validations

### Validation Results

```typescript
interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

## Testing

Test the centralized environment system:

```bash
# Run environment test
npx tsx src/config/test-env.ts
```

This will:
- Validate all environment variables
- Display environment variable status
- Show configuration details (without sensitive data)
- Show any errors or warnings

## Migration from Direct Environment Access

### Before (❌ Not Recommended)
```typescript
// Direct environment access scattered across files
const port = parseInt(process.env.PORT || '3001', 10);
const supabaseUrl = process.env.SUPABASE_URL || '';
const privyAppId = process.env.PRIVY_APP_ID || '';
```

### After (✅ Recommended)
```typescript
// Option 1: Centralized environment access
import { env } from './config/index.js';

const port = parseInt(env.PORT, 10);
const supabaseUrl = env.SUPABASE_URL;
const privyAppId = env.PRIVY_APP_ID;

// Option 2: Typed configuration objects
import { getConfig } from './config/index.js';

const config = getConfig();
const port = config.server.port;
const supabaseUrl = config.database.supabase.url;
const privyAppId = config.auth.privy.appId;
```

## Benefits

1. **Type Safety**: All configuration values are typed
2. **Centralized Environment**: Single source of truth for all environment variables
3. **Validation**: Environment variables are validated on startup
4. **Error Handling**: Clear error messages for missing variables
5. **Modular**: Easy to add new configuration sections
6. **Testing**: Easy to mock and test configuration
7. **Documentation**: Self-documenting configuration structure
8. **Industry Standard**: Follows centralized environment loading best practices
9. **Discoverable**: All environment variables visible in one place
10. **Maintainable**: Easy to add new environment variables

## Adding New Configuration

1. **Add to types.ts**: Define the interface
2. **Create module**: Create a new config module (e.g., `newService.ts`)
3. **Add to index.ts**: Import and include in main config
4. **Update validation**: Add any specific validation rules
5. **Update documentation**: Document the new configuration

## Best Practices

1. **Always use centralized config** instead of direct `process.env` access
2. **Validate required variables** in configuration modules
3. **Provide sensible defaults** where appropriate
4. **Use TypeScript interfaces** for type safety
5. **Test configuration** before deployment
6. **Document new configuration** options
