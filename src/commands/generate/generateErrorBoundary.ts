import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../../utils/config';
import { createFile, createFolder } from '../../utils/file';
import { Interface as ReadlineInterface } from 'readline';

export function registerGenerateErrorBoundary(generate: Command, rl: ReadlineInterface) {
  generate
    .command('error-boundary')
    .description('Create a reusable error boundary component')
    .option('--replace', 'Replace file if it exists')
    .action(async (options) => {
      const config = await setupConfiguration(rl);
      const ext = config.typescript ? 'tsx' : 'jsx';
      const folderPath = path.join(config.baseDir, 'components');
      createFolder(folderPath);
      const filePath = path.join(folderPath, `ErrorBoundary.${ext}`);
      const content = config.typescript
        ? `import React, { Component, ErrorInfo, ReactNode } from 'react';\n\ninterface Props {\n  children: ReactNode;\n}\n\ninterface State {\n  hasError: boolean;\n}\n\nexport class ErrorBoundary extends Component<Props, State> {\n  state: State = { hasError: false };\n\n  static getDerivedStateFromError(_: Error): State {\n    return { hasError: true };\n  }\n\n  componentDidCatch(error: Error, errorInfo: ErrorInfo) {\n    console.error('Uncaught error:', error, errorInfo);\n  }\n\n  render() {\n    if (this.state.hasError) {\n      return <h1>Something went wrong.</h1>;\n    }\n\n    return this.props.children;\n  }\n}\n`
        : `import React, { Component } from 'react';\n\nexport class ErrorBoundary extends Component {\n  state = { hasError: false };\n\n  static getDerivedStateFromError(error) {\n    return { hasError: true };\n  }\n\n  componentDidCatch(error, errorInfo) {\n    console.error('Uncaught error:', error, errorInfo);\n  }\n\n  render() {\n    if (this.state.hasError) {\n      return <h1>Something went wrong.</h1>;\n    }\n\n    return this.props.children;\n  }\n}\n`;
      if (createFile(filePath, content, options.replace)) {
        console.log(chalk.green(`✅ Created error boundary: ${filePath}`));
      } else {
        console.log(chalk.yellow(`⚠️ Error boundary exists: ${filePath} (use --replace to overwrite)`));
      }
      rl.close();
    });
}
