"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFolder = createFolder;
exports.createFile = createFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function createFolder(folderPath) {
    if (!fs_1.default.existsSync(folderPath)) {
        fs_1.default.mkdirSync(folderPath, { recursive: true });
    }
}
function createFile(filePath, content = '', replace = false) {
    const dir = path_1.default.dirname(filePath);
    createFolder(dir);
    if (!fs_1.default.existsSync(filePath) || replace) {
        fs_1.default.writeFileSync(filePath, content);
        return true;
    }
    return false;
}
