// Example usage patterns for the route generation system

/**
 * 1. Simple page in pages folder:
 * Command: create-page generate page Home
 * Result: 
 *   - Creates: src/pages/Home/Home.tsx
 *   - Route: /home
 * 
 * 2. Page in feature folder:
 * Command: create-page generate page UserProfile pages/User
 * Result:
 *   - Creates: src/pages/User/UserProfile/UserProfile.tsx  
 *   - Route: /user/userprofile
 * 
 * 3. Dynamic route:
 * Command: create-page generate page _[id] pages/Product
 * Result:
 *   - Creates: src/pages/Product/_[id]/_[id].tsx
 *   - Route: /product/:id
 * 
 * 4. Nested dynamic route:
 * Command: create-page generate page _[productId] pages/Shop/_[category]
 * Result:
 *   - Creates: src/pages/Shop/_[category]/_[productId]/_[productId].tsx
 *   - Route: /shop/:category/:productId
 * 
 * 5. Index page:
 * Command: create-page generate page Index pages/Dashboard
 * Result:
 *   - Creates: src/pages/Dashboard/Index/Index.tsx
 *   - Route: /dashboard (index route)
 */

// Route structure examples:
export const routeExamples = {
  simple: {
    input: { pageName: 'Home', targetDir: 'src/pages/Home' },
    output: { routePath: '/home', isNested: false, isDynamic: false }
  },
  
  nested: {
    input: { pageName: 'Profile', targetDir: 'src/pages/User/Profile' },
    output: { routePath: '/user/profile', isNested: true, isDynamic: false, parentRoute: '/user' }
  },
  
  dynamic: {
    input: { pageName: '_[id]', targetDir: 'src/pages/Product/_[id]' },
    output: { routePath: '/product/:id', isNested: true, isDynamic: true, parentRoute: '/product' }
  },
  
  multiDynamic: {
    input: { pageName: '_[productId]', targetDir: 'src/pages/Shop/_[category]/_[productId]' },
    output: { routePath: '/shop/:category/:productId', isNested: true, isDynamic: true, parentRoute: '/shop/:category' }
  },
  
  index: {
    input: { pageName: 'Index', targetDir: 'src/pages/Dashboard/Index' },
    output: { routePath: '/dashboard', isNested: true, isDynamic: false, parentRoute: '/dashboard' }
  }
};
