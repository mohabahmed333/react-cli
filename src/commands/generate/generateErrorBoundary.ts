import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../../utils/config';
import { createGeneratedFile } from '../../utils/file/createGeneratedFile';
import { Interface as ReadlineInterface } from 'readline';

export function registerGenerateErrorBoundary(generate: Command, rl: ReadlineInterface) {
  generate
    .command('error-boundary')
    .description('Create a reusable error boundary component')
    .option('--replace', 'Replace file if it exists')
    .action(async (options) => {
      try {
        const config = await setupConfiguration(rl);
        const useTS = config.typescript;
        const targetDir = path.join(config.baseDir, 'components');
        
        const defaultContent = useTS
          ? `import React, { Component, ErrorInfo, ReactNode } from 'react';\n\ninterface Props {\n  children: ReactNode;\n}\n\ninterface State {\n  hasError: boolean;\n}\n\nexport class ErrorBoundary extends Component<Props, State> {\n  state: State = { hasError: false };\n\n  static getDerivedStateFromError(_: Error): State {\n    return { hasError: true };\n  }\n\n  componentDidCatch(error: Error, errorInfo: ErrorInfo) {\n    console.error('Uncaught error:', error, errorInfo);\n  }\n\n  render() {\n    if (this.state.hasError) {\n      return <h1>Something went wrong.</h1>;\n    }\n\n    return this.props.children;\n  }\n}\n`
          : `import React, { Component } from 'react';\n\nexport class ErrorBoundary extends Component {\n  state = { hasError: false };\n\n  static getDerivedStateFromError(error) {\n    return { hasError: true };\n  }\n\n  componentDidCatch(error, errorInfo) {\n    console.error('Uncaught error:', error, errorInfo);\n  }\n\n  render() {\n    if (this.state.hasError) {\n      return <h1>Something went wrong.</h1>;\n    }\n\n    return this.props.children;\n  }\n}\n`;

        await createGeneratedFile({
          rl,
          config,
          type: 'component',
          name: 'ErrorBoundary',
          targetDir,
          useTS,
          replace: options.replace ?? false,
          defaultContent
        });

        console.log(chalk.green(`✅ Successfully generated error boundary component`));
      } catch (error) {
        console.error(chalk.red('❌ Error generating error boundary:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}
