import { Command } from 'commander';
import readline from 'readline';
import { runPerformanceAudit } from '../features/performance/audit/performanceAudit';
import { setupConfiguration } from '../utils/config/config';

export function registerAuditCommand(program: Command, rl: readline.Interface): void {
  program
    .command('audit <path>')
    .description('Run performance audit on a page component')
    .option('--url <url>', 'URL of the running application')
    .option('--save-baseline', 'Save results as performance baseline')
    .option('--compare-only', 'Only compare with existing baseline')
    .option('--threshold <number>', 'Performance threshold (default: 90)', '90')
    .action(async (pagePath, options) => {
      try {
        const config = await setupConfiguration(rl);
        await runPerformanceAudit(pagePath, options, config);
      } catch (error) {
        console.error('Failed to run performance audit:', error);
      } finally {
        rl.close();
      }
    });
}
