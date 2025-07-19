"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGenerateRoutes = registerGenerateRoutes;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../utils/config");
const file_1 = require("../utils/file");
function registerGenerateRoutes(generate, rl) {
    generate
        .command('routes')
        .description('Generate a routes configuration file')
        .option('--replace', 'Replace file if it exists')
        .action(async (options) => {
        const config = await (0, config_1.setupConfiguration)(rl);
        const ext = config.typescript ? 'tsx' : 'jsx';
        const folderPath = path_1.default.join(config.baseDir, 'routes');
        (0, file_1.createFolder)(folderPath);
        const filePath = path_1.default.join(folderPath, `routes.${ext}`);
        const content = config.typescript
            ? `import { createBrowserRouter } from 'react-router-dom';\nimport App from '../App';\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    element: <App />,\n    children: [\n      // Add your routes here\n    ],\n  },\n]);\n\nexport default router;\n`
            : `import { createBrowserRouter } from 'react-router-dom';\nimport App from '../App';\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    element: <App />,\n    children: [\n      // Add your routes here\n    ],\n  },\n]);\n\nexport default router;\n`;
        if ((0, file_1.createFile)(filePath, content, options.replace)) {
            console.log(chalk_1.default.green(`✅ Created routes config: ${filePath}`));
        }
        else {
            console.log(chalk_1.default.yellow(`⚠️ Routes config exists: ${filePath} (use --replace to overwrite)`));
        }
        rl.close();
    });
}
