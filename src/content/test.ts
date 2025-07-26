
export function generateTestContent(name: string, useTS: boolean, exportType?: 'default' | 'named'): string {
  const importStatement = exportType === 'named'
    ? `import { ${name} } from './${name}';`
    : `import ${name} from './${name}';`;

  return `import React from 'react';\nimport { render } from '@testing-library/react';\n${importStatement}\n\ndescribe('${name}', () => {\n  it('renders without crashing', () => {\n    render(<${name} />);\n  });\n});`;
}