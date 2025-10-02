# Documentation

Welcome to the Battle Semantic project documentation. This directory contains comprehensive guides for setting up, configuring, and troubleshooting the application.

## 📚 Documentation Overview

### Setup Guides

- **[PROJECT_SETUP.md](./PROJECT_SETUP.md)** - Complete project setup from scratch
- **[PRIVY_SETUP.md](./PRIVY_SETUP.md)** - Privy authentication configuration
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Supabase database setup

### Reference Documentation

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

## 🚀 Quick Start

If you're new to the project, start here:

1. **Read [PROJECT_SETUP.md](./PROJECT_SETUP.md)** for a complete overview
2. **Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** to set up your database
3. **Follow [PRIVY_SETUP.md](./PRIVY_SETUP.md)** to configure authentication
4. **Refer to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** for API usage
5. **Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** if you encounter issues

## 📋 Prerequisites

Before starting, ensure you have:

- Node.js (v18 or higher)
- npm or yarn
- Git
- MetaMask browser extension
- Supabase account
- Privy account

## 🏗️ Project Architecture

```
Battle Semantic
├── Frontend (Next.js + React)
│   ├── Privy Authentication
│   ├── shadcn/ui Components
│   └── API Integration
├── Backend (Express.js + TypeScript)
│   ├── Privy Authentication Middleware
│   ├── Supabase Integration
│   └── REST API Endpoints
└── Database (Supabase PostgreSQL)
    ├── Messages Table
    ├── Row Level Security
    └── Real-time Capabilities
```

## 🔧 Key Features

- **Wallet Authentication**: MetaMask integration via Privy
- **Secure API**: Token-based authentication with wallet verification
- **Real-time Database**: Supabase PostgreSQL with RLS
- **Modern UI**: shadcn/ui components with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Development Ready**: Hot reload and comprehensive tooling

## 📖 Documentation Structure

### Setup Documentation
- **PROJECT_SETUP.md**: Complete setup guide with all dependencies
- **PRIVY_SETUP.md**: Authentication service configuration
- **SUPABASE_SETUP.md**: Database setup and configuration

### Reference Documentation
- **API_DOCUMENTATION.md**: Complete API reference with examples
- **TROUBLESHOOTING.md**: Common issues and debugging techniques

## 🛠️ Development Workflow

1. **Setup**: Follow the setup guides to configure all services
2. **Development**: Use the development scripts to run the application
3. **Testing**: Test authentication, API endpoints, and database operations
4. **Debugging**: Use the troubleshooting guide for common issues
5. **Deployment**: Follow production deployment guidelines

## 🔍 Getting Help

### Common Issues
- **Port conflicts**: See troubleshooting guide
- **Authentication errors**: Check Privy configuration
- **Database issues**: Verify Supabase setup
- **Environment variables**: Ensure proper configuration

### Debugging Steps
1. Check server logs for error messages
2. Verify environment variables are set correctly
3. Test individual services (Supabase, Privy) separately
4. Use browser DevTools to debug frontend issues
5. Check API endpoints with curl or Postman

### Support Resources
- [Privy Documentation](https://docs.privy.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)

## 📝 Contributing

When contributing to the documentation:

1. **Keep it updated**: Update docs when making code changes
2. **Be specific**: Include exact commands and configurations
3. **Add examples**: Provide working code examples
4. **Test instructions**: Verify all setup steps work
5. **Use clear language**: Write for developers of all levels

## 🔄 Maintenance

### Regular Updates
- Keep dependencies updated
- Update documentation for new features
- Review and update troubleshooting guides
- Test setup instructions regularly

### Version Control
- Document breaking changes
- Update version numbers in examples
- Maintain backward compatibility notes
- Tag documentation versions

---

**Need help?** Start with the [PROJECT_SETUP.md](./PROJECT_SETUP.md) guide or check the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues.
