import fs from 'fs';
import path from 'path';

export function createFolder(folderPath: string) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

export function createFile(filePath: string, content = '', replace = false): boolean {
  const dir = path.dirname(filePath);
  createFolder(dir);
  if (!fs.existsSync(filePath) || replace) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}
