"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGenerateErrorBoundary = registerGenerateErrorBoundary;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../utils/config");
const file_1 = require("../utils/file");
function registerGenerateErrorBoundary(generate, rl) {
    generate
        .command('error-boundary')
        .description('Create a reusable error boundary component')
        .option('--replace', 'Replace file if it exists')
        .action(async (options) => {
        const config = await (0, config_1.setupConfiguration)(rl);
        const ext = config.typescript ? 'tsx' : 'jsx';
        const folderPath = path_1.default.join(config.baseDir, 'components');
        (0, file_1.createFolder)(folderPath);
        const filePath = path_1.default.join(folderPath, `ErrorBoundary.${ext}`);
        const content = config.typescript
            ? `import React, { Component, ErrorInfo, ReactNode } from 'react';\n\ninterface Props {\n  children: ReactNode;\n}\n\ninterface State {\n  hasError: boolean;\n}\n\nexport class ErrorBoundary extends Component<Props, State> {\n  state: State = { hasError: false };\n\n  static getDerivedStateFromError(_: Error): State {\n    return { hasError: true };\n  }\n\n  componentDidCatch(error: Error, errorInfo: ErrorInfo) {\n    console.error('Uncaught error:', error, errorInfo);\n  }\n\n  render() {\n    if (this.state.hasError) {\n      return <h1>Something went wrong.</h1>;\n    }\n\n    return this.props.children;\n  }\n}\n`
            : `import React, { Component } from 'react';\n\nexport class ErrorBoundary extends Component {\n  state = { hasError: false };\n\n  static getDerivedStateFromError(error) {\n    return { hasError: true };\n  }\n\n  componentDidCatch(error, errorInfo) {\n    console.error('Uncaught error:', error, errorInfo);\n  }\n\n  render() {\n    if (this.state.hasError) {\n      return <h1>Something went wrong.</h1>;\n    }\n\n    return this.props.children;\n  }\n}\n`;
        if ((0, file_1.createFile)(filePath, content, options.replace)) {
            console.log(chalk_1.default.green(`✅ Created error boundary: ${filePath}`));
        }
        else {
            console.log(chalk_1.default.yellow(`⚠️ Error boundary exists: ${filePath} (use --replace to overwrite)`));
        }
        rl.close();
    });
}
