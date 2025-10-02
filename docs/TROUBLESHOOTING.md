# Troubleshooting Guide

This guide covers common issues and their solutions for the Battle Semantic project.

## 🚨 Common Issues

### 1. Port Already in Use (EADDRINUSE)

**Error**: `Error: listen EADDRINUSE: address already in use :::3001`

**Cause**: Another process is already using port 3001.

**Solution**:
```bash
# Find the process using the port
lsof -ti:3001

# Kill the process (replace XXXX with the actual PID)
kill XXXX

# Or use a one-liner
kill $(lsof -ti:3001) 2>/dev/null; npm run dev

# Alternative: Use a different port
PORT=3002 npm run dev
```

### 2. Environment Variables Not Loading

**Error**: `undefined` values for environment variables

**Cause**: Environment variables not properly configured.

**Solutions**:
- Ensure `.env` files are in the correct directories:
  - Backend: `backend/.env`
  - Frontend: `frontend/.env.local`
- Check variable names match exactly (case-sensitive)
- Restart development servers after changing `.env` files
- Verify no spaces around the `=` sign: `KEY=value` not `KEY = value`

### 3. Authentication Failures

**Error**: `401 Unauthorized` or authentication not working

**Causes & Solutions**:

#### Privy Configuration Issues
```bash
# Check your Privy App ID
echo $NEXT_PUBLIC_PRIVY_APP_ID

# Verify in Privy Dashboard:
# 1. App ID matches your environment variable
# 2. Wallet connections are enabled
# 3. Redirect URLs are configured
```

#### MetaMask Issues
- Ensure MetaMask is installed and unlocked
- Check that you're on a supported network
- Try refreshing the page and reconnecting

#### Backend Authentication
```bash
# Test authentication endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/messages

# Check backend logs for authentication errors
```

### 4. Database Connection Issues

**Error**: `Failed to connect to Supabase` or database errors

**Solutions**:

#### Check Supabase Configuration
```bash
# Verify your Supabase URL format
# Should be: https://your-project-id.supabase.co
echo $SUPABASE_URL

# Test Supabase connection
curl http://localhost:3001/test-supabase
```

#### Database Table Issues
```sql
-- Check if messages table exists
SELECT * FROM information_schema.tables WHERE table_name = 'messages';

-- Verify table structure
\d messages;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'messages';
```

### 5. CORS Errors

**Error**: `CORS policy` errors in browser console

**Solution**: Update backend CORS configuration in `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true
}));
```

### 6. Build Errors

**Error**: TypeScript compilation errors

**Solutions**:
```bash
# Clean and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build

# Check TypeScript configuration
npx tsc --noEmit

# Fix linting issues
npm run lint -- --fix
```

### 7. Frontend Build Issues

**Error**: Next.js build failures

**Solutions**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for missing environment variables
npm run build
```

## 🔍 Debugging Techniques

### 1. Enable Debug Logging

#### Backend Debugging
```typescript
// Add to backend/src/index.ts
console.log('Environment variables:', {
  SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Missing',
  PRIVY_APP_ID: process.env.PRIVY_APP_ID ? 'Set' : 'Missing'
});
```

#### Frontend Debugging
```typescript
// Add to frontend components
console.log('Privy user:', user);
console.log('Authentication status:', authenticated);
```

### 2. Network Debugging

#### Check API Endpoints
```bash
# Test all endpoints
curl http://localhost:3001/health
curl http://localhost:3001/test-supabase
curl http://localhost:3001/api
curl http://localhost:3001/api/messages
```

#### Check Frontend API Calls
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to make API calls
4. Check for failed requests and error responses

### 3. Database Debugging

#### Check Database Connection
```sql
-- In Supabase SQL Editor
SELECT current_database(), current_user, version();
```

#### Check Table Data
```sql
-- View all messages
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;

-- Check table permissions
SELECT * FROM information_schema.table_privileges 
WHERE table_name = 'messages';
```

## 🛠️ Development Tools

### 1. Useful Commands

```bash
# Check running processes
ps aux | grep node

# Check port usage
lsof -i :3001
lsof -i :3000

# Monitor logs
tail -f backend/logs/app.log

# Check environment variables
env | grep -E "(SUPABASE|PRIVY|NODE_ENV)"
```

### 2. Browser DevTools

#### Console Tab
- Check for JavaScript errors
- Monitor authentication status
- Debug API calls

#### Network Tab
- Monitor API requests
- Check response status codes
- Verify request headers

#### Application Tab
- Check localStorage/sessionStorage
- Verify cookies
- Monitor service workers

### 3. Database Tools

#### Supabase Dashboard
- Table Editor: View and edit data
- SQL Editor: Run custom queries
- Logs: Monitor database activity
- API: Test API endpoints

## 📋 Health Checks

### 1. Backend Health Check
```bash
# Test all backend endpoints
curl http://localhost:3001/health
curl http://localhost:3001/test-supabase
curl http://localhost:3001/api
```

### 2. Frontend Health Check
1. Open http://localhost:3000
2. Check if login page loads
3. Try connecting wallet
4. Test message creation/retrieval

### 3. Integration Health Check
1. Connect wallet in frontend
2. Create a message
3. Verify it appears in the list
4. Check Supabase dashboard for the data

## 🆘 Getting Help

### 1. Check Logs
- **Backend**: Check terminal output where you ran `npm run dev`
- **Frontend**: Check browser console (F12)
- **Database**: Check Supabase dashboard logs

### 2. Verify Configuration
- Environment variables are set correctly
- Services are running on correct ports
- Database tables exist and have proper permissions
- Authentication is configured properly

### 3. Common Solutions
1. **Restart everything**: Stop all servers and restart
2. **Clear caches**: Clear browser cache and Next.js cache
3. **Reinstall dependencies**: Delete node_modules and reinstall
4. **Check versions**: Ensure Node.js and npm versions are compatible

### 4. When to Ask for Help
- Error persists after trying common solutions
- Unclear error messages
- Configuration seems correct but still not working
- Need help with deployment or production issues

## 📚 Additional Resources

- [Privy Documentation](https://docs.privy.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MetaMask Documentation](https://docs.metamask.io/)

---

**Remember**: Most issues are configuration-related. Double-check your environment variables and service configurations before diving deep into debugging.
