// Test script for dynamic route conversion
const { convertToValidComponentName } = require('./dist/utils/routeUtils');

// Test cases
const testCases = [
  '_[id]',
  '_[productId]',
  '_[userId]',
  'NormalPage',
  '_[categoryId]'
];

console.log('Testing dynamic route conversion:');
testCases.forEach(pageName => {
  try {
    const componentName = convertToValidComponentName(pageName);
    console.log(`${pageName} -> ${componentName}`);
  } catch (error) {
    console.log(`${pageName} -> Error: Function not exported`);
  }
});
