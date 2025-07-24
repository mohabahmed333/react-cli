import path from "path";
import fs from "fs";

export async function updateStoreForRtkQueryTS(resource: string) {
    const storePath = path.join(process.cwd(), 'src/app/store.ts');
    if (!fs.existsSync(storePath)) return;
  
    let content = await fs.promises.readFile(storePath, 'utf8');
    const importStatement = `import { ${resource}Api } from '../services/${resource}Api';`;

    // Insert import after last import
    if (!content.includes(importStatement)) {
      content = content.replace(
        /(^import .+;\s*)+/m,
        (match) => match + importStatement + '\n'
      );
    }

    // Add reducer if not exists
    if (!content.includes(`${resource}Api.reducerPath`)) {
      content = content.replace(
        /reducer:\s*{([^}]*)}/m,
        (match, reducers) => {
          const cleaned = reducers.trim().replace(/,?$/, '');
          return `reducer: {\n    ${cleaned},\n    [${resource}Api.reducerPath]: ${resource}Api.reducer\n  }`;
        }
      );
    }

    // Add middleware if not exists
    if (!content.includes(`${resource}Api.middleware`)) {
      content = content.replace(
        /middleware:\s*\(getDefaultMiddleware\)\s*=>\s*([^\n{]*)\{([^}]*)\}/m,
        (match, before, body) => {
          if (body.includes('getDefaultMiddleware().concat')) {
            if (!body.includes(`${resource}Api.middleware`)) {
              return match.replace(
                /getDefaultMiddleware\(\)\.concat\(([^)]*)\)/,
                (m, middlewares) => `getDefaultMiddleware().concat(${middlewares}, ${resource}Api.middleware)`
              );
            }
            return match;
          }
          return `middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(${resource}Api.middleware)`;
        }
      );
    }

    await fs.promises.writeFile(storePath, content);
}