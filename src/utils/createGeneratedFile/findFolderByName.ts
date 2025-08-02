import path from "path";
import fs from "fs";

export function findFoldersByName(baseDir: string, folderName: string): string[] {
    const results: string[] = [];
    function search(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (entry.name.toLowerCase() === folderName.toLowerCase()) {
            results.push(path.join(dir, entry.name));
          }
          search(path.join(dir, entry.name));
        }
      }
    }
    search(baseDir);
    return results;
  } 