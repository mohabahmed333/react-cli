"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGenerateTestUtils = registerGenerateTestUtils;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../utils/config");
const file_1 = require("../utils/file");
function registerGenerateTestUtils(generate, rl) {
    generate
        .command('test-utils')
        .description('Create test utilities for React Testing Library')
        .option('--replace', 'Replace file if it exists')
        .action(async (options) => {
        const config = await (0, config_1.setupConfiguration)(rl);
        const ext = config.typescript ? 'ts' : 'js';
        const folderPath = path_1.default.join(config.baseDir, 'test-utils');
        (0, file_1.createFolder)(folderPath);
        const filePath = path_1.default.join(folderPath, `test-utils.${ext}`);
        const content = `// Test utilities\nimport { render } from '@testing-library/react';\nimport { ThemeProvider } from '../contexts/ThemeContext';\n\nconst AllTheProviders = ({ children }) => {\n  return (\n    <ThemeProvider>\n      {children}\n    </ThemeProvider>\n  );\n};\n\nexport const customRender = (ui, options) =>\n  render(ui, { wrapper: AllTheProviders, ...options });\n\n// Re-export everything\n// export * from '@testing-library/react';\n`;
        if ((0, file_1.createFile)(filePath, content, options.replace)) {
            console.log(chalk_1.default.green(`✅ Created test utilities: ${filePath}`));
        }
        else {
            console.log(chalk_1.default.yellow(`⚠️ Test utilities exist: ${filePath} (use --replace to overwrite)`));
        }
        rl.close();
    });
}
