import fs from 'fs';
import path from 'path';

export function createFolder(folderPath: string) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

export function createFile(filePath: string, content = '') {
  const dir = path.dirname(filePath);
  createFolder(dir);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

export function parseComments(commentBlock: string) {
  return commentBlock
    .replace(/\/\*\*|\*\//g, '')
    .replace(/^\s*\*\s?/gm, '')
    .trim();
}

export function parseTypeScriptProps(interfaceContent: string) {
  const props: any = {};
  // Remove comments and handle multiline
  const lines = interfaceContent
    .replace(/\/\/.*$/gm, '') // remove line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove block comments
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('//'));

  for (const line of lines) {
    // Match: propName?: type; or propName: type;
    const propMatch = line.match(/^(\w+)(\??):\s*([^;=]+)(?:=\s*([^;]+))?;/);
    if (propMatch) {
      const [, name, optional, type, defaultValue] = propMatch;
      props[name] = {
        type: type.trim(),
        required: !optional,
        defaultValue: defaultValue ? defaultValue.trim() : undefined
      };
    } else {
      // fallback: propName?: type
      const fallbackMatch = line.match(/^(\w+)(\??):\s*([^;]+)/);
      if (fallbackMatch) {
        const [, name, optional, type] = fallbackMatch;
        props[name] = {
          type: type.trim(),
          required: !optional,
        };
      }
    }
  }
  return props;
}

export function getControlType(prop: { type: string }) {
  if (prop.type.includes('boolean')) return 'boolean';
  if (prop.type.includes('string')) return 'text';
  if (prop.type.includes('number')) return 'number';
  return 'object';
} 