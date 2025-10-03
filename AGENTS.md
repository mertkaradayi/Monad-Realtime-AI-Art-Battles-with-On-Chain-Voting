# Project Instructions

## 🎨 **PROJECT TRANSFORMATION**
- **CURRENT PROJECT**: Battle Semantic (message enhancement)
- **TARGET PROJECT**: Realtime AI Art Battles
- **TRANSFORMATION**: Feature-by-feature following IMPLEMENTATION_TODO.md
- **TESTING**: Manual testing after each feature implementation
- **REFERENCE**: See IMPLEMENTATION_TODO.md for detailed feature list

## 🎯 **IMPLEMENTATION STRATEGY**
- **SEQUENTIAL**: Implement features 1-11 in order
- **TESTING**: Test each feature before moving to next
- **DATABASE**: Transform messages → battles, prompts, images, votes, nfts
- **AI**: Text enhancement → Image generation
- **FEATURES**: Real-time voting, NFT minting, QR code sharing
- **BLOCKCHAIN**: Monad integration for voting and NFT minting

## 📋 **Rule Files Reference**
This project uses structured rule files located in `.cursor/rules/` folder:

- **@frontend-shadcn.mdc** - Frontend development rules (shadcn/ui components only + MCP integration)
- **@project-standards.mdc** - Project-wide development standards and architecture
- **@supabase-mcp.mdc** - Database schema management rules (Supabase MCP tools only)

**IMPORTANT**: Always reference these rule files for detailed guidelines and requirements.

## 🎯 **Frontend Development**
- **MANDATORY**: Use only shadcn/ui components for all UI elements
- **FORBIDDEN**: Direct HTML elements like `<button>`, `<input>`, `<div>` for UI
- **REQUIRED**: Import from `@/components/ui/*` exclusively
- **STYLING**: Use shadcn design tokens (`text-foreground`, `bg-background`, etc.)
- **MCP INTEGRATION**: Use shadcn MCP for component discovery and management

## 🗄️ **Database Management**
- **MANDATORY**: Use Supabase MCP tools exclusively for all database operations
- **FORBIDDEN**: Manual SQL file editing or direct database modifications
- **REQUIRED**: All schema changes via `mcp_supabase_apply_migration`
- **INTEGRATION**: MCP is the single source of truth for database schema
- **WORKFLOW**: AI-friendly commands for schema changes (e.g., "Add column X to table Y")
- **TYPES**: Auto-generate TypeScript types from current schema
- **DOCUMENTATION**: Update schema.md automatically after changes

## 🔐 **Authentication**
- **AUTHENTICATION PROVIDER**: Use Privy for user authentication
- **REQUIRED**: Wrap app with PrivyProvider in Providers component
- **COMPONENTS**: Use AuthButton component for login/logout functionality
- **INTEGRATION**: Privy handles wallet connection and social login
- **SETUP**: Reference PRIVY_SETUP.md for configuration details

## 🏗️ **Architecture**
- Follow the repository pattern
- Keep business logic in service layers
- Use proper error handling and validation
- Follow RESTful API conventions

## 📝 **Code Style**
- Use TypeScript for all new files
- Prefer functional components in React
- Use camelCase for variables and functions
- Use PascalCase for components
- Use kebab-case for file names
- Use snake_case for database columns

## 🎨 **Design System**
- Use shadcn/ui "new-york" style
- Neutral base color scheme
- CSS variables enabled
- Lucide icons
- Tailwind CSS for styling

## 🔧 **Development Workflow**
1. Check if shadcn component exists for UI need
2. Add component if missing: `npx shadcn@latest add [name]`
3. Import and use shadcn component
4. Apply shadcn design tokens for styling
5. Test component functionality
6. Ensure accessibility compliance
7. **AUTHENTICATION**: Use Privy hooks (`usePrivy`, `useWallets`) for auth state
8. **PROTECTED ROUTES**: Implement auth guards using Privy authentication status
9. **DATABASE CHANGES**: Use Supabase MCP tools for all schema modifications
10. **SCHEMA UPDATES**: Update documentation and regenerate TypeScript types after changes

## 🚨 **Enforcement**
- **ALWAYS** suggest shadcn components for any UI element
- **NEVER** suggest direct HTML elements for UI
- **REQUIRE** refactoring if non-shadcn UI elements are used
- **PRIORITIZE** shadcn design system consistency
- **MANDATORY** use shadcn MCP for component discovery and management
- **AUTHENTICATION**: Always use Privy for user authentication and wallet connection
- **SECURITY**: Implement proper auth guards and protected routes
- **DATABASE**: Always use Supabase MCP tools for schema changes
- **SCHEMA**: Never suggest manual SQL file editing or direct database modifications
- **TYPES**: Auto-generate TypeScript types after any schema changes

## 🎯 **CURRENT STATUS**
- **NEXT FEATURE**: Feature 1 - Battle Creation & QR Code
- **IMPLEMENTATION**: Follow IMPLEMENTATION_TODO.md sequentially
- **TESTING**: Manual testing required after each feature
- **TRANSFORMATION**: From message enhancement to AI art battles
