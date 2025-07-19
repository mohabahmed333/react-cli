"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGenerateHoc = registerGenerateHoc;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../utils/config");
const file_1 = require("../utils/file");
function registerGenerateHoc(generate, rl) {
    generate
        .command('hoc <name>')
        .description('Create a higher-order component')
        .option('--replace', 'Replace file if it exists')
        .action(async (name, options) => {
        const config = await (0, config_1.setupConfiguration)(rl);
        const ext = config.typescript ? 'tsx' : 'jsx';
        const folderPath = path_1.default.join(config.baseDir, 'hocs');
        (0, file_1.createFolder)(folderPath);
        const filePath = path_1.default.join(folderPath, `with${name}.${ext}`);
        const content = config.typescript
            ? `import React from 'react';\n\nexport function with${name}<P extends object>(\n  WrappedComponent: React.ComponentType<P>\n) {\n  const ComponentWith${name} = (props: P) => {\n    // Add your HOC logic here\n    return <WrappedComponent {...props} />;\n  };\n\n  return ComponentWith${name};\n}\n`
            : `import React from 'react';\n\nexport function with${name}(WrappedComponent) {\n  return function ComponentWith${name}(props) {\n    // Add your HOC logic here\n    return <WrappedComponent {...props} />;\n  };\n}\n`;
        if ((0, file_1.createFile)(filePath, content, options.replace)) {
            console.log(chalk_1.default.green(`✅ Created HOC: ${filePath}`));
        }
        else {
            console.log(chalk_1.default.yellow(`⚠️ HOC exists: ${filePath} (use --replace to overwrite)`));
        }
        rl.close();
    });
}
