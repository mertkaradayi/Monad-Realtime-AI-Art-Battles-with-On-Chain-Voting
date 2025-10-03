# Backend Tests

This folder contains all test files for the backend services.

## Test Files

- **`fal-ai.test.ts`** - Tests fal.ai integration and model availability
- **`message-enhancement.test.ts`** - Tests message enhancement service functionality
- **`message-demo.test.ts`** - Demo script showing enhancement examples (no API calls)
- **`run-tests.ts`** - Test runner that executes all tests

## Running Tests

### Run All Tests
```bash
npm run test
```

### Run Individual Tests
```bash
# Test fal.ai integration
npm run test:fal

# Test message enhancement service
npm run test:message

# Run demo (no API calls required)
npm run test:demo
```

## Prerequisites

Before running tests that require API calls, make sure you have:

1. **FAL_KEY environment variable set**
   ```bash
   export FAL_KEY=your_fal_ai_api_key
   ```

2. **Backend built** (for message enhancement tests)
   ```bash
   npm run build
   ```

## Test Structure

All tests are written in TypeScript and follow these patterns:

- ✅ **Type Safety** - Full TypeScript support with proper interfaces
- 🧪 **Minimal & Clean** - Simple, focused test cases
- 📊 **Clear Output** - Detailed logging and result summaries
- 🔧 **Easy to Run** - Individual or batch execution
- 🎯 **Focused Testing** - Each test has a specific purpose

## Test Output

Tests provide:
- ✅ Success/failure status for each test
- 📝 Detailed output for debugging
- 📊 Summary statistics
- 💡 Helpful error messages and troubleshooting tips

## Adding New Tests

1. Create a new `.test.ts` file in this folder
2. Follow the existing patterns for structure and output
3. Add a corresponding npm script in `package.json`
4. Update `run-tests.ts` to include the new test
5. Update this README with documentation
