# Project Instructions

## 🎯 **Frontend Development**
- **MANDATORY**: Use only shadcn/ui components for all UI elements
- **FORBIDDEN**: Direct HTML elements like `<button>`, `<input>`, `<div>` for UI
- **REQUIRED**: Import from `@/components/ui/*` exclusively
- **STYLING**: Use shadcn design tokens (`text-foreground`, `bg-background`, etc.)

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

## 🚨 **Enforcement**
- **ALWAYS** suggest shadcn components for any UI element
- **NEVER** suggest direct HTML elements for UI
- **REQUIRE** refactoring if non-shadcn UI elements are used
- **PRIORITIZE** shadcn design system consistency
