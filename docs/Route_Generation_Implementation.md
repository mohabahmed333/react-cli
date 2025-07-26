# Route Generation Integration

## Overview
This implementation adds automatic route generation when creating pages in React projects, with support for nested routes, dynamic parameters, and feature-based organization.

## Features Implemented

### 1. **Automatic Route Generation** 🛣️
- Routes are automatically generated when creating pages in React projects
- Default enabled for React projects, disabled for Next.js (uses file-based routing)
- Can be disabled with `--no-route` flag

### 2. **Smart Path Parsing** 🧠
- Converts page paths to React Router compatible routes
- Handles nested folder structures as nested routes
- Supports dynamic route parameters with `_[param]` syntax

### 3. **Route Types Supported** 📁

#### Simple Routes
```bash
create-page generate page Home
# Creates: src/pages/Home/Home.tsx
# Route: /home
```

#### Nested Routes (Feature-based)
```bash
create-page generate page Profile pages/User
# Creates: src/pages/User/Profile/Profile.tsx  
# Route: /user/profile
```

#### Dynamic Routes
```bash
create-page generate page _[id] pages/Product
# Creates: src/pages/Product/_[id]/_[id].tsx
# Route: /product/:id
```

#### Multi-level Dynamic Routes
```bash
create-page generate page _[productId] pages/Shop/_[category]
# Creates: src/pages/Shop/_[category]/_[productId]/_[productId].tsx
# Route: /shop/:category/:productId
```

### 4. **Smart Routes File Management** 📄
- Automatically creates `routes/routes.tsx` if it doesn't exist
- Parses existing routes file and adds new routes intelligently
- Preserves existing routes and imports
- Handles both TypeScript and JavaScript projects

### 5. **Interactive Mode Enhancement** 💬
- Added route generation option to interactive questions
- Only shown for React projects (not Next.js)
- Default: enabled for React projects

## File Structure

### New Files Created:
1. **`src/types/route-types.ts`** - TypeScript definitions for route handling
2. **`src/utils/routeUtils.ts`** - Core route generation utilities
3. **`docs/Route_Generation_Examples.md`** - Usage examples and patterns

### Modified Files:
1. **`src/commands/generate/page/generatePage.ts`** - Integrated route generation into page creation

## Command Options

### New Options Added:
- `--route` - Generate route automatically (default: true for React)
- `--no-route` - Skip route generation

### Interactive Questions:
- "Generate route automatically? (y/n)" - Only shown for React projects

## Route Generation Logic

### Path Conversion Rules:
- `pages/Home` → `/home`
- `pages/User/Profile` → `/user/profile`
- `pages/Product/_[id]` → `/product/:id`
- `pages/Shop/_[category]/_[productId]` → `/shop/:category/:productId`

### Dynamic Parameter Handling:
- `_[param]` syntax converts to `:param` in routes
- Supports multiple parameters in nested paths
- Provides helpful console output about parameter usage

### Nested Route Features:
- Detects parent-child relationships
- Provides guidance about `<Outlet />` usage for nested routing
- Maintains proper route hierarchy

## Error Handling

### Graceful Degradation:
- If route generation fails, page creation still succeeds
- Provides helpful error messages and manual instructions
- Non-blocking - doesn't prevent page generation

### Validation:
- Only generates routes for React projects
- Checks for existing routes to prevent duplicates
- Validates routes file structure before modification

## Usage Examples

### Basic Usage:
```bash
# Create page with automatic route
create-page generate page Dashboard

# Create nested page in feature folder  
create-page generate page UserSettings pages/User

# Create dynamic route
create-page generate page _[userId] pages/User

# Skip route generation
create-page generate page About --no-route
```

### Interactive Mode:
```bash
create-page generate page ProfileEdit --interactive
# Will prompt for route generation option (React projects only)
```

## Benefits

### ✅ **Developer Experience**
- Eliminates manual route configuration
- Consistent route patterns across the project
- Automatic import path generation

### ✅ **Feature Organization**
- Supports feature-based folder structures
- Nested routes mirror folder hierarchy
- Easy to maintain and understand

### ✅ **Flexibility**
- Can be disabled when not needed
- Works with existing routes files
- Supports both TS and JS projects

### ✅ **Error Prevention**
- Prevents duplicate routes
- Validates file structure
- Provides clear feedback and guidance

## Implementation Notes

### Current Limitations:
1. Basic AST parsing (could be enhanced with full TypeScript parser)
2. Simplified nested route insertion (works for common cases)
3. Manual parent route creation for complex nested structures

### Future Enhancements:
1. Full AST parsing for complex route structures
2. Route guard integration
3. Lazy loading setup
4. Route testing utilities

## Conclusion

This implementation provides a robust foundation for automatic route generation that integrates seamlessly with the existing page generation system. It handles the most common routing scenarios while maintaining flexibility and error resilience.
