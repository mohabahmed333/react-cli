import { generateRouteForPage } from './src/utils/createRoutes/routeUtils';
import { setupConfiguration } from './src/utils/config/config';
import * as readline from 'readline';

async function addTestDashboardRoute() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    const config = await setupConfiguration(rl);
    const pageName = 'TestDashboard';
    const targetDir = 'app/pages/TestDashboard';
    
    console.log('Generating route for TestDashboard...');
    await generateRouteForPage(pageName, targetDir, config);
    console.log('Route generation complete!');
  } catch (error) {
    console.error('Error generating route:', error);
  } finally {
    rl.close();
  }
}

addTestDashboardRoute();
