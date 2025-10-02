# Battle Semantic - Complete Project Setup Guide

This guide will walk you through setting up the entire Battle Semantic project from scratch, including all dependencies, services, and configurations.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **MetaMask** browser extension
- **Code editor** (VS Code recommended)

## 🏗️ Project Structure

```
battle-semantic/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Authentication middleware
│   │   └── index.ts        # Main server file
│   ├── package.json
│   └── .env                # Backend environment variables
├── frontend/               # Next.js React application
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   └── lib/           # Utility functions
│   ├── package.json
│   └── .env.local         # Frontend environment variables
├── docs/                  # Documentation
│   ├── PRIVY_SETUP.md
│   ├── SUPABASE_SETUP.md
│   └── PROJECT_SETUP.md
└── README.md
```

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd battle-semantic

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up Services

#### A. Supabase Setup
1. Follow the detailed guide in [`docs/SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
2. Create your Supabase project
3. Set up the database tables
4. Get your API credentials

#### B. Privy Setup
1. Follow the detailed guide in [`docs/PRIVY_SETUP.md`](./PRIVY_SETUP.md)
2. Create your Privy app
3. Configure wallet connections
4. Get your App ID and Secret

### 3. Configure Environment Variables

#### Backend Environment (`.env` in `backend/` directory)
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Privy Configuration
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret

# Server Configuration
PORT=3001
NODE_ENV=development
```

#### Frontend Environment (`.env.local` in `frontend/` directory)
```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id-here

# Supabase Configuration (if needed)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Start the Development Servers

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend Server
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api

## 🔧 Development Workflow

### Available Scripts

#### Root Level
```bash
npm run dev:backend    # Start backend in development mode
npm run dev:frontend   # Start frontend in development mode
npm run build          # Build both frontend and backend
npm run start          # Start both servers in production mode
```

#### Backend Scripts
```bash
npm run dev            # Start with hot reload
npm run build          # Build TypeScript
npm run start          # Start production server
npm run lint           # Run ESLint
```

#### Frontend Scripts
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
```

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **TypeScript**: The project uses TypeScript for type safety
3. **ESLint**: Code linting is configured for both frontend and backend
4. **Environment Variables**: Use `.env` files for configuration (never commit them)

## 🧪 Testing the Setup

### 1. Test Backend Connection
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test Supabase connection
curl http://localhost:3001/test-supabase

# Test API info
curl http://localhost:3001/api
```

### 2. Test Frontend
1. Open http://localhost:3000
2. You should see the login page
3. Connect your MetaMask wallet
4. Try creating and viewing messages

### 3. Test Authentication
```bash
# This should return 401 (unauthorized)
curl http://localhost:3001/api/messages

# With proper authentication token, it should work
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/messages
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3001
lsof -ti:3001

# Kill the process
kill $(lsof -ti:3001)

# Or use a different port
PORT=3002 npm run dev
```

#### Environment Variables Not Loading
- Ensure `.env` files are in the correct directories
- Check that variable names match exactly
- Restart the development servers after changing `.env` files

#### Authentication Issues
- Verify Privy App ID is correct
- Check that wallet connections are enabled in Privy dashboard
- Ensure MetaMask is installed and unlocked

#### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check that the messages table exists
- Ensure RLS policies are configured properly

### Getting Help

1. **Check the logs**: Look at console output for error messages
2. **Verify configuration**: Double-check all environment variables
3. **Test individual components**: Test Supabase and Privy separately
4. **Check documentation**: Refer to the detailed setup guides

## 📚 Additional Documentation

- [`PRIVY_SETUP.md`](./PRIVY_SETUP.md) - Detailed Privy authentication setup
- [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) - Complete Supabase configuration
- [`../README.md`](../README.md) - Project overview and features

## 🚀 Deployment

### Backend Deployment
1. Set up a hosting service (Railway, Heroku, Vercel, etc.)
2. Configure environment variables in your hosting platform
3. Deploy the backend code
4. Update CORS settings for your frontend domain

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Configure environment variables
4. Update API endpoints to point to your deployed backend

### Production Checklist
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] CORS properly configured
- [ ] SSL certificates installed
- [ ] Monitoring and logging set up
- [ ] Error handling implemented
- [ ] Rate limiting configured

## 🔄 Updates and Maintenance

### Regular Tasks
1. **Update dependencies**: Run `npm update` regularly
2. **Monitor logs**: Check for errors and performance issues
3. **Backup database**: Ensure regular backups are running
4. **Security updates**: Keep all dependencies updated

### Version Control
- Use meaningful commit messages
- Create feature branches for new development
- Test thoroughly before merging to main
- Tag releases for easy deployment

---

**Need help?** Check the troubleshooting section above or refer to the individual setup guides for each service.
