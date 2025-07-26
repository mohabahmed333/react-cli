export function generateLayoutContent(useTS: boolean): string {
  return useTS
    ? `import { ReactNode } from 'react';\n\nexport default function Layout({ children }: { children: ReactNode }) {\n  return (\n    <div>\n      <main>{children}</main>\n    </div>\n  );\n}\n`
    : `export default function Layout({ children }) {\n  return (\n    <div>\n      <main>{children}</main>\n    </div>\n  );\n}\n`;
}
