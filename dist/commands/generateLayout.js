"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGenerateLayout = registerGenerateLayout;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../utils/config");
const file_1 = require("../utils/file");
function registerGenerateLayout(generate, rl) {
    generate
        .command('layout <name>')
        .description('Create a layout component with nested routing support')
        .option('--sidebar', 'Include sidebar')
        .option('--navbar', 'Include navigation bar')
        .option('--replace', 'Replace file if it exists')
        .action(async (name, options) => {
        const config = await (0, config_1.setupConfiguration)(rl);
        const ext = config.typescript ? 'tsx' : 'jsx';
        const folderPath = path_1.default.join(config.baseDir, 'layouts');
        (0, file_1.createFolder)(folderPath);
        const filePath = path_1.default.join(folderPath, `${name}Layout.${ext}`);
        const sidebar = options.sidebar ? `{/* Sidebar content here */}\n` : '';
        const navbar = options.navbar ? `{/* Navbar content here */}\n` : '';
        const content = config.typescript
            ? `import { Outlet } from 'react-router-dom';\n\nexport default function ${name}Layout() {\n  return (\n    <div className=\"${name.toLowerCase()}-layout\">\n      ${navbar}\n      <div className=\"layout-content\">\n        ${sidebar}\n        <main>\n          <Outlet />\n        </main>\n      </div>\n    </div>\n  );\n}\n`
            : `import { Outlet } from 'react-router-dom';\n\nexport default function ${name}Layout() {\n  return (\n    <div className=\"${name.toLowerCase()}-layout\">\n      ${navbar}\n      <div className=\"layout-content\">\n        ${sidebar}\n        <main>\n          <Outlet />\n        </main>\n      </div>\n    </div>\n  );\n}\n`;
        if ((0, file_1.createFile)(filePath, content, options.replace)) {
            console.log(chalk_1.default.green(`✅ Created layout: ${filePath}`));
        }
        else {
            console.log(chalk_1.default.yellow(`⚠️ Layout exists: ${filePath} (use --replace to overwrite)`));
        }
        rl.close();
    });
}
