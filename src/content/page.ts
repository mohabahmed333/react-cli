import { PageOptions } from "../commands/generate/page/generatePage";

export function generatePageContent(name: string, options: PageOptions, useTS: boolean): string {
  return useTS
    ? `import React from 'react';\n${options.css ? `import styles from './${name}.module.css';\n` : ''}\ninterface ${name}Props {}\n\nconst ${name}: React.FC<${name}Props> = () => {\n  return (\n    <div${options.css ? ' className={styles.container}' : ''}>\n      <h1>${name} Page</h1>\n    </div>\n  );\n};\n\nexport default ${name};\n`
    : `import React from 'react';\n${options.css ? `import styles from './${name}.module.css';\n` : ''}\nconst ${name} = () => {\n  return (\n    <div${options.css ? ' className={styles.container}' : ''}>\n      <h1>${name} Page</h1>\n    </div>\n  );\n};\n\nexport default ${name};\n`;
}

export function generatePageTestContent(name: string, useTS: boolean): string {
  return useTS
    ? `import { render, screen } from '@testing-library/react';\nimport ${name} from './${name}';\n\ndescribe('${name}', () => {\n  it('renders', () => {\n    render(<${name} />);\n    expect(screen.getByText('${name} Page')).toBeInTheDocument();\n  });\n});\n`
    : `import { render, screen } from '@testing-library/react';\nimport ${name} from './${name}';\n\ntest('renders ${name}', () => {\n  render(<${name} />);\n  expect(screen.getByText('${name} Page')).toBeInTheDocument();\n});\n`;
}
