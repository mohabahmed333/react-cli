import path from "path";
import fs from "fs";

export async function detectApiLibrary() {
    try {
      const pkgPath = path.join(process.cwd(), 'package.json');
      if (!fs.existsSync(pkgPath)) return null;
      
      const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps['@reduxjs/toolkit']) return 'rtk-query';
      if (deps['@tanstack/react-query']) return 'react-query';
      if (deps['axios']) return 'axios';
      
      return null;
    } catch (err) {
      console.error('Error detecting API library:', err);
      return null;
    }
  }