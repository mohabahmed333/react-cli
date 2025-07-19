"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRedux = handleRedux;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../utils/config");
const file_1 = require("../utils/file");
function handleRedux(program, rl) {
    program
        .command('redux <name>')
        .description('Create a Redux slice (requires @reduxjs/toolkit)')
        .option('--ts', 'Override TypeScript setting')
        .option('--replace', 'Replace file if it exists')
        .action(async (name, options) => {
        const config = await (0, config_1.setupConfiguration)(rl);
        const useTS = options.ts ?? config.typescript;
        const ext = useTS ? 'ts' : 'js';
        const folderPath = `${config.baseDir}/store`;
        (0, file_1.createFolder)(folderPath);
        const content = useTS
            ? `import { createSlice, PayloadAction } from '@reduxjs/toolkit';\n\ninterface ${name}State {\n  // Add your state properties here\n}\n\nconst initialState: ${name}State = {\n  // ...\n};\n\nconst ${name}Slice = createSlice({\n  name: '${name}',\n  initialState,\n  reducers: {\n    // add reducers here\n  },\n});\n\nexport const { actions, reducer } = ${name}Slice;\n`
            : `import { createSlice } from '@reduxjs/toolkit';\n\nconst initialState = {\n  // ...\n};\n\nconst ${name}Slice = createSlice({\n  name: '${name}',\n  initialState,\n  reducers: {\n    // add reducers here\n  },\n});\n\nexport const { actions, reducer } = ${name}Slice;\n`;
        const filePath = `${folderPath}/${name}Slice.${ext}`;
        if ((0, file_1.createFile)(filePath, content, options.replace)) {
            console.log(chalk_1.default.green(`✅ Created Redux slice: ${filePath}`));
        }
        else {
            console.log(chalk_1.default.yellow(`⚠️ Redux slice exists: ${filePath} (use --replace to overwrite)`));
        }
        rl.close();
    });
}
