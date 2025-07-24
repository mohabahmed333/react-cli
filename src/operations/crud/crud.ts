import path from 'path';
import fs from 'fs-extra';
import { updateStoreForRtkQueryTS } from './generateRtkQuery/RtkStoreUpdater';
 import { generateAxiosCrudTS } from './generateAxios';
import { generateReactQueryCrudTS } from './generateReactQuery';
import { setupConfiguration } from '../../utils/config';
import { generateRtkQueryCrudTS } from './generateRtkQuery/generateRtkQuery';
// import your template generators here:
// import { generateAxiosCrudTS, generateReactQueryCrudTS, generateRtkQueryCrudTS } from './templates';

export interface CrudOptions {
  api: 'axios' | 'react-query' | 'rtk-query';
  typescript: boolean;
  errorHandler: 'basic' | 'detailed' | 'toast';
  outputDir?: string;
  rl?: any;
}

async function addQueryKeys(resource: string, queryKeysFile: string) {
  const Resource = resource.charAt(0).toUpperCase() + resource.slice(1);
  const keyName = `${Resource.toUpperCase()}_QUERY_KEY`;
  const validationKeyName = `${Resource.toUpperCase()}_VALIDATION_KEY`;
  const keyValue = `'${resource}'`;
  const validationValue = `'${resource}-validation'`;

  await fs.ensureDir(path.dirname(queryKeysFile));

  let content = '';
  if (fs.existsSync(queryKeysFile)) {
    content = await fs.readFile(queryKeysFile, 'utf8');
    if (!content.includes(`export const ${keyName}`)) {
      content += `\nexport const ${keyName} = ${keyValue};`;
    }
    if (!content.includes(`export const ${validationKeyName}`)) {
      content += `\nexport const ${validationKeyName} = ${validationValue};`;
    }
  } else {
    content = `// Query keys for React Query/RTK Query\nexport const ${keyName} = ${keyValue};\nexport const ${validationKeyName} = ${validationValue};\n`;
  }
  await fs.writeFile(queryKeysFile, content.trim() + '\n');
}

export async function generateCrudServices(resourceName: string, options: CrudOptions) {
  const { api, typescript, errorHandler, outputDir, rl } = options;
  const ResourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

  // Use outputDir if provided, otherwise default to src/services
  const projectRoot = process.cwd();
  const config = await setupConfiguration(rl);
  const baseDir = outputDir ? path.relative(projectRoot, path.dirname(outputDir)) : (config.baseDir || 'src');
  const useAlias = (config as any)?.useAlias || false;
  const servicesDir = outputDir || path.join(projectRoot, baseDir, 'services');
  await fs.ensureDir(servicesDir);

  // Determine queryKeys file and import path
  let queryKeysFile: string;
  let importPath: string;
  const localQueryKeys = path.join(servicesDir, 'queryKeys.ts');
  const globalQueryKeys = path.join(projectRoot, baseDir, 'constants', 'queryKeys.ts');
  if (fs.existsSync(localQueryKeys)) {
    queryKeysFile = localQueryKeys;
    importPath = useAlias
      ? `@/${path.relative(baseDir, localQueryKeys).replace(/\\/g, '/')}`
      : './queryKeys';
  } else {
    queryKeysFile = globalQueryKeys;
    importPath = useAlias
      ? '@/constants/queryKeys'
      : path.relative(servicesDir, globalQueryKeys).replace(/\\/g, '/').replace(/^\./, '').replace(/^\//, './');
  }

  const templateParams = {
    resource: resourceName,
    Resource: ResourceName,
    errorHandler,
    importPath
  };

  let content: string;
  switch (api) {
    case 'axios':
      content = generateAxiosCrudTS(templateParams);
      break;
    case 'react-query':
      content = generateReactQueryCrudTS(templateParams);
      await addQueryKeys(resourceName, queryKeysFile);
      break;
    case 'rtk-query':
      content = generateRtkQueryCrudTS(templateParams);
      await updateStoreForRtkQueryTS(resourceName);
      await addQueryKeys(resourceName, queryKeysFile);
      break;
    default:
      throw new Error(`Unsupported API type: ${api}`);
  }

  const ext = typescript ? 'ts' : 'js';
  const filePath = path.join(servicesDir, `${resourceName}Service.${ext}`);
  await fs.writeFile(filePath, content);

  console.log(`✅ ${ResourceName} CRUD services generated at: ${filePath} using ${api} with TypeScript`);
}