import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { createFolder, createFile, parseComments, parseTypeScriptProps, getControlType } from '../../utils/docs/docUtils';
import type { CLIConfig } from '../../utils/config/config';

interface PropMetadata {
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

interface ComponentMetadata {
  description?: string;
  props?: Record<string, PropMetadata>;
  exportType?: 'function' | 'class' | 'interface' | 'type';
  exportName?: string;
}

interface FileInfo {
  name: string;
  type: 'component' | 'hook' | 'type' | 'unknown';
  path: string;
  content: string;
  isTypeScript: boolean;
  metadata: ComponentMetadata;
}

interface DocsConfig {
  outputDir: string;
  formats: Array<'storybook' | 'markdown'>;
  includeTypes: Array<'components' | 'hooks' | 'types'>;
}

interface DocOptions {
  output?: string;
  all?: boolean;
  storybook?: boolean;
  md?: boolean;
}

function getFileType(filePath: string, baseDir: string): FileInfo['type'] {
  const relativePath = path.relative(baseDir, filePath);
  if (relativePath.startsWith('components')) return 'component';
  if (relativePath.startsWith('hooks')) return 'hook';
  if (relativePath.startsWith('types')) return 'type';
  return 'unknown';
}

function extractMetadata(content: string, isTypeScript: boolean): ComponentMetadata {
  const metadata: ComponentMetadata = {};
  // Extract JSDoc/TSDoc comments
  const commentMatch = content.match(/\/\*\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\//);
  if (commentMatch) {
    metadata.description = parseComments(commentMatch[0]);
  }
  // Extract props/parameters (multiline interface)
  if (isTypeScript) {
    const interfaceMatch = content.match(/interface \w+Props\s*{([\s\S]*?)}/);
    if (interfaceMatch) {
      metadata.props = parseTypeScriptProps(interfaceMatch[1]);
    } else {
      // Fallback: Try to extract inline type annotation from function parameter
      // Match: export const Name = ({ ... }: { ... })
      const inlineTypeMatch = content.match(/\(\{[^}]*\}:\s*\{([^}]*)\}\)/);
      if (inlineTypeMatch) {
        metadata.props = parseInlineTypeProps(inlineTypeMatch[1]);
      }
    }
  }
  // Extract exports
  const exportMatch = content.match(/export (function|class|interface|type) (\w+)/);
  if (exportMatch) {
    metadata.exportType = exportMatch[1] as ComponentMetadata['exportType'];
    metadata.exportName = exportMatch[2];
  }
  return metadata;
}

// Add a simple parser for inline object type annotations
function parseInlineTypeProps(typeString: string): Record<string, PropMetadata> {
  const props: Record<string, PropMetadata> = {};
  // Split by comma, handle nested objects naively (does not support all TS syntax)
  let depth = 0;
  let current = '';
  for (let i = 0; i < typeString.length; i++) {
    const char = typeString[i];
    if (char === '{') depth++;
    if (char === '}') depth--;
    if (char === ',' && depth === 0) {
      if (current.trim()) {
        addInlineProp(current, props);
      }
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    addInlineProp(current, props);
  }
  return props;
}

function addInlineProp(line: string, props: Record<string, PropMetadata>): void {
  // Match: name: string or dd: { name: string }
  const match = line.match(/(\w+)\??:\s*([\w\[\]{}<>: ,]+)/);
  if (match) {
    const [, name, type] = match;
    props[name] = {
      type: type.trim(),
      required: !line.includes('?'),
    };
  }
}

function parseFile(filePath: string, config: CLIConfig): FileInfo {
  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath);
  const name = path.basename(filePath, ext);
  const type = getFileType(filePath, config.baseDir);
  return {
    name,
    type,
    path: filePath,
    content,
    isTypeScript: config.typescript,
    metadata: extractMetadata(content, config.typescript)
  };
}

function generateStorybookDoc(fileInfo: FileInfo, docsConfig: DocsConfig): void {
  if (fileInfo.type !== 'component') return;

  const storyDir = path.join(docsConfig.outputDir, 'storybook', path.dirname(fileInfo.path));
  createFolder(storyDir);

  const storyPath = path.join(storyDir, `${fileInfo.name}.stories.${fileInfo.isTypeScript ? 'tsx' : 'jsx'}`);

  // Convert Windows paths to forward slashes for imports
  const relativePath = path.relative(path.dirname(storyPath), fileInfo.path)
    .replace(/\\/g, '/')
    .replace(/\.(tsx|jsx)$/, '');

  let storyContent = `import ${fileInfo.name.toLowerCase()} from '${relativePath}';\n\n`;
  storyContent += `export default {\n`;
  storyContent += `  title: 'Components/${fileInfo.name.toLowerCase()}',\n`;
  storyContent += `  component: ${fileInfo.name.toLowerCase()},\n`;
  storyContent += `};\n\n`;

  storyContent += `const Template = (args) => <${fileInfo.name.toLowerCase()} {...args} />;\n\n`;

  storyContent += `export const Default = Template.bind({});\n`;
  storyContent += `Default.args = {\n`;

  // Enhanced prop detection with better TypeScript parsing
  if (fileInfo.metadata?.props) {
    Object.entries(fileInfo.metadata.props).forEach(([prop, propData]) => {
      const defaultValue = getDefaultValueForProp(prop, propData);
      if (defaultValue !== undefined) {
        storyContent += `  ${prop}: ${defaultValue},\n`;
      }
    });
  } else {
    // Fallback to extracting props directly from function signature
    const props = extractPropsFromSignature(fileInfo.content);
    if (props.length > 0) {
      props.forEach(prop => {
        storyContent += `  ${prop}: 'Value',\n`;
      });
    }
  }

  storyContent += `};\n\n`;

  storyContent += `export const Empty = Template.bind({});\n`;
  storyContent += `Empty.args = {};\n`;

  createFile(storyPath, storyContent);
  console.log(chalk.green(`  ↳ Created Storybook story: ${storyPath}`));
}

function extractPropsFromSignature(content: string): string[] {
  const props: string[] = [];
  // Match function signature with destructured props and TypeScript type
  const signatureMatch = content.match(/export const \w+\s*=\s*\(\{\s*([^}]+)\}\s*:\s*\{([^}]+)\}\)/);
  
  if (signatureMatch && signatureMatch[1]) {
    // Extract prop names from destructuring pattern
    signatureMatch[1].split(',')
      .map(part => part.trim())
      .filter(part => part)
      .forEach(part => {
        // Handle prop with optional default value
        const propName = part.split(':')[0].split('=')[0].trim();
        if (propName) props.push(propName);
      });
  }
  return props;
}

function getDefaultValueForProp(prop: string, propData: PropMetadata): string | undefined {
  if (propData.defaultValue) {
    return propData.defaultValue;
  }

  const propType = propData.type?.toLowerCase() || 'unknown';
  
  if (propType.includes('string')) {
    return `'${prop === 'name' ? 'Example' : 'Value'}'`;
  }
  if (propType.includes('boolean')) {
    return 'false';
  }
  if (propType.includes('number')) {
    return '0';
  }
  if (propType.includes('object') || propType.includes('array') || propType.includes('{')) {
    return '{}';
  }
  if (propType.includes('function')) {
    return '() => {}';
  }
  
  return `'Value'`; // Fallback for unknown types
}

function generateMarkdownDoc(fileInfo: FileInfo, docsConfig: DocsConfig): void {
  const mdDir = path.join(docsConfig.outputDir, 'markdown', path.dirname(fileInfo.path));
  createFolder(mdDir);
  const mdPath = path.join(mdDir, `${fileInfo.name}.md`);
  let mdContent = `# ${fileInfo.name}\n\n`;
  if (fileInfo.metadata.description) {
    mdContent += `${fileInfo.metadata.description}\n\n`;
  }
  if (fileInfo.type === 'component' && fileInfo.metadata.props) {
    mdContent += `## Props\n\n`;
    mdContent += `| Name | Type | Description |\n`;
    mdContent += `|------|------|-------------|\n`;
    Object.entries(fileInfo.metadata.props).forEach(([name, details]) => {
      mdContent += `| ${name} | ${details.type} | ${details.description || ''} |\n`;
    });
    mdContent += `\n`;
  }
  if (fileInfo.type === 'hook') {
    mdContent += `## Usage\n\n`;
    mdContent += `\`\`\`${fileInfo.isTypeScript ? 'typescript' : 'javascript'}\n`;
    mdContent += `import { ${fileInfo.name} } from '${path.relative(mdDir, fileInfo.path)}';\n\n`;
    mdContent += `// Example usage\n`;
    mdContent += `const { data, loading } = ${fileInfo.name}();\n`;
    mdContent += `\`\`\`\n`;
  }
  createFile(mdPath, mdContent);
  console.log(chalk.green(`  ↳ Created Markdown docs: ${mdPath}`));
}

export async function generateDocumentation(options: DocOptions, config: CLIConfig): Promise<void> {
  const docsConfig: DocsConfig = {
    outputDir: options.output || path.join(config.baseDir, 'docs'),
    formats: [],
    includeTypes: ['components', 'hooks', 'types']
  };
  if (options.all) {
    docsConfig.formats = ['storybook', 'markdown'];
  } else {
    if (options.storybook) docsConfig.formats.push('storybook');
    if (options.md) docsConfig.formats.push('markdown');
  }
  if (docsConfig.formats.length === 0) {
    console.log(chalk.yellow('ℹ️ No documentation formats specified. Use --storybook, --md or --all'));
    return;
  }
  createFolder(docsConfig.outputDir);
  for (const type of docsConfig.includeTypes) {
    const typePath = path.join(config.baseDir, type);
    if (!fs.existsSync(typePath)) continue;
    const files = fs.readdirSync(typePath);
    for (const file of files) {
      const filePath = path.join(typePath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) continue;
      const fileInfo = parseFile(filePath, config);
      if (docsConfig.formats.includes('storybook')) {
        generateStorybookDoc(fileInfo, docsConfig);
      }
      if (docsConfig.formats.includes('markdown')) {
        generateMarkdownDoc(fileInfo, docsConfig);
      }
    }
  }
}
