"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGenerateGuard = registerGenerateGuard;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../utils/config");
const file_1 = require("../utils/file");
function registerGenerateGuard(generate, rl) {
    generate
        .command('guard <name>')
        .description('Create an authentication guard for protected routes')
        .option('--replace', 'Replace file if it exists')
        .action(async (name, options) => {
        const config = await (0, config_1.setupConfiguration)(rl);
        const ext = config.typescript ? 'tsx' : 'jsx';
        const folderPath = path_1.default.join(config.baseDir, 'guards');
        (0, file_1.createFolder)(folderPath);
        const filePath = path_1.default.join(folderPath, `${name}Guard.${ext}`);
        const content = config.typescript
            ? `import { Navigate, useLocation } from 'react-router-dom';\nimport { useAuth } from '../contexts/AuthContext';\n\nexport default function ${name}Guard({ children }: { children: JSX.Element }) {\n  const { currentUser } = useAuth();\n  const location = useLocation();\n\n  if (!currentUser) {\n    return <Navigate to=\"/login\" state={{ from: location }} replace />;\n  }\n\n  return children;\n}\n`
            : `import { Navigate, useLocation } from 'react-router-dom';\nimport { useAuth } from '../contexts/AuthContext';\n\nexport default function ${name}Guard({ children }) {\n  const { currentUser } = useAuth();\n  const location = useLocation();\n\n  if (!currentUser) {\n    return <Navigate to=\"/login\" state={{ from: location }} replace />;\n  }\n\n  return children;\n}\n`;
        if ((0, file_1.createFile)(filePath, content, options.replace)) {
            console.log(chalk_1.default.green(`✅ Created auth guard: ${filePath}`));
        }
        else {
            console.log(chalk_1.default.yellow(`⚠️ Guard exists: ${filePath} (use --replace to overwrite)`));
        }
        rl.close();
    });
}
