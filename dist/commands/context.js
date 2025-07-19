"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleContext = handleContext;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../utils/config");
const file_1 = require("../utils/file");
function handleContext(program, rl) {
    program
        .command('context <name>')
        .description('Create a React context')
        .option('--ts', 'Override TypeScript setting')
        .option('--replace', 'Replace file if it exists')
        .action(async (name, options) => {
        const config = await (0, config_1.setupConfiguration)(rl);
        const useTS = options.ts ?? config.typescript;
        const ext = useTS ? 'tsx' : 'jsx';
        const folderPath = `${config.baseDir}/contexts`;
        (0, file_1.createFolder)(folderPath);
        const content = useTS
            ? `import React, { createContext, useContext, useState, ReactNode } from 'react';\n\ninterface ${name}ContextProps {\n  children: ReactNode;\n}\n\ninterface ${name}ContextType {\n  // Add your context value types here\n}\n\nconst ${name}Context = createContext<${name}ContextType | undefined>(undefined);\n\nexport const ${name}Provider = ({ children }: ${name}ContextProps) => {\n  // const [value, setValue] = useState();\n  return (\n    <${name}Context.Provider value={{ /* value */ }}>\n      {children}\n    </${name}Context.Provider>\n  );\n};\n\nexport const use${name} = () => {\n  const context = useContext(${name}Context);\n  if (!context) throw new Error('use${name} must be used within a ${name}Provider');\n  return context;\n};\n`
            : `import React, { createContext, useContext, useState } from 'react';\n\nconst ${name}Context = createContext();\n\nexport const ${name}Provider = ({ children }) => {\n  // const [value, setValue] = useState();\n  return (\n    <${name}Context.Provider value={{ /* value */ }}>\n      {children}\n    </${name}Context.Provider>\n  );\n};\n\nexport const use${name} = () => {\n  const context = useContext(${name}Context);\n  if (!context) throw new Error('use${name} must be used within a ${name}Provider');\n  return context;\n};\n`;
        const filePath = `${folderPath}/${name}Context.${ext}`;
        if ((0, file_1.createFile)(filePath, content, options.replace)) {
            console.log(chalk_1.default.green(`✅ Created context: ${filePath}`));
        }
        else {
            console.log(chalk_1.default.yellow(`⚠️ Context exists: ${filePath} (use --replace to overwrite)`));
        }
        rl.close();
    });
}
