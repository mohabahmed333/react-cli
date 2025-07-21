import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';

export function handleHelp(program: Command, rl: readline.Interface) {
  program
    .command('help')
    .description('Show help')
    .action(() => {
      console.log(chalk.cyan.bold('\n📘 CLI Documentation'));
      console.log('\nCommands:');
      console.log('  hook <name>             Create a custom hook');
      console.log('  util <name>             Create a utility function');
      console.log('  type <name>             Create TypeScript types');
      console.log('  service <name>          Create a service for API calls');
      console.log('  global                  Create multiple global resources');
      console.log('  page <name>             Create a page with components');
      console.log('  context <name>          Create a React context');
      console.log('  redux <name>            Create a Redux slice');
      console.log('  deps                    Check dependency versions');
      console.log('  bundle-check            Analyze application bundle size and dependencies');
      console.log('  a11y-scan               Check accessibility compliance');
      console.log('  generate guard <name>           Create an authentication guard for protected routes');
      console.log('  generate layout <name>          Create a layout component with nested routing support');
      console.log('  generate hoc <name>             Create a higher-order component');
      console.log('  generate routes                 Generate a routes configuration file');
      console.log('  generate service-worker         Create a service worker for PWA support');
      console.log('  generate env                    Create environment configuration files');
      console.log('  generate test-utils             Create test utilities for React Testing Library');
      console.log('  generate error-boundary         Create a reusable error boundary component');
      console.log('  init                    Initialize project config');
      console.log('  config                  Show current config');
      console.log('\nOptions:');
      console.log('  --ts                      Override TypeScript setting');
      console.log('  --interactive             Use interactive mode');
      console.log('  --replace                 Replace file if it exists');
      console.log('  --context <name>          Create a React context');
      console.log('  --redux                   Include Redux slice');
      console.log('  --sidebar                 Include sidebar (for layout generator)');
      console.log('  --navbar                  Include navigation bar (for layout generator)');
      console.log('  --fix                      Attempt to fix common accessibility issues (a11y-scan)');
      console.log('  --report                   Generate detailed HTML report (a11y-scan)');
      console.log('  --component <path>         Scan specific component file (a11y-scan)');
      console.log('  --url <url>                Scan specific URL (a11y-scan)');
      console.log('  --level <level>            WCAG level: A, AA, AAA (a11y-scan)');
      console.log('\nExamples:');
      console.log('  create-page hook useAuth --ts');
      console.log('  create-page page Dashboard --css --test --interactive --context AuthContext --redux');
      console.log('  create-page global --interactive');
      console.log('  create-page service user --ts');
      console.log('  create-page generate guard AuthGuard');
      console.log('  create-page generate layout Main --sidebar --navbar');
      console.log('  create-page a11y-scan --url http://localhost:3000 --report');
      console.log('  create-page generate hoc Auth');
      console.log('  create-page generate routes');
      console.log('  create-page generate service-worker');
      console.log('  create-page generate env');
      console.log('  create-page generate test-utils');
      console.log('  create-page generate error-boundary');
      console.log('\nTo use context or redux features, install the required dependencies:');
      console.log('  npm install react-redux @reduxjs/toolkit');
      rl.close();
    });
}
