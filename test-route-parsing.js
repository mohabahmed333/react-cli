import { parsePagePathToRoute } from '../src/utils/routeUtils';
import { CLIConfig } from '../src/utils/config';

// Test the route parsing logic
const testConfig: CLIConfig = {
  baseDir: 'app',
  projectType: 'react',
  buildTool: 'vite',
  typescript: true,
  localization: false,
  aiEnabled: false
};

console.log('=== Route Parsing Tests ===\n');

// Test 1: Dashboard in Mohab folder
const test1 = parsePagePathToRoute('Dashboard', 'app/pages/Mohab/Dashboard', testConfig);
console.log('Test 1 - Dashboard in Mohab folder:');
console.log('Input:', { pageName: 'Dashboard', targetDir: 'app/pages/Mohab/Dashboard' });
console.log('Output:', test1);
console.log('Expected parent route: /mohab');
console.log('Expected route path: /mohab/dashboard');
console.log('Is nested:', test1.isNested);
console.log('Parent route:', test1.parentRoute);
console.log('Route path:', test1.routePath);
console.log('---\n');

// Test 2: Profile in User folder  
const test2 = parsePagePathToRoute('Profile', 'app/pages/User/Profile', testConfig);
console.log('Test 2 - Profile in User folder:');
console.log('Input:', { pageName: 'Profile', targetDir: 'app/pages/User/Profile' });
console.log('Output:', test2);
console.log('---\n');

// Test 3: Simple page
const test3 = parsePagePathToRoute('Home', 'app/pages/Home', testConfig);
console.log('Test 3 - Simple Home page:');
console.log('Input:', { pageName: 'Home', targetDir: 'app/pages/Home' });
console.log('Output:', test3);
console.log('---\n');

// Test 4: Dynamic route
const test4 = parsePagePathToRoute('_[id]', 'app/pages/Product/_[id]', testConfig);
console.log('Test 4 - Dynamic route:');
console.log('Input:', { pageName: '_[id]', targetDir: 'app/pages/Product/_[id]' });
console.log('Output:', test4);
console.log('---\n');
