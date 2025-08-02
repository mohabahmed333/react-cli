import { ComponentOptions } from "../generateComponent";

 
/**
 * Generate component content
 */
export function generateComponentContent(name: string, options: ComponentOptions, useTS: boolean): string {
  const imports = ['import React from \'react\';'];
  
  if (options.css) {
    imports.push(`import styles from './${name}.module.css';`);
  }
  
  if (options.styled) {
    imports.push(`import { ${name}Container } from './${name}.styles';`);
  }

  const propsInterface = useTS ? `interface ${name}Props {\n  className?: string;\n}\n\n` : '';
  
  let componentDeclaration = '';
  
  if (options.forwardRef && useTS) {
    componentDeclaration = `const ${name} = React.forwardRef<HTMLDivElement, ${name}Props>(({ className, ...props }, ref) => {`;
  } else if (options.forwardRef) {
    componentDeclaration = `const ${name} = React.forwardRef(({ className, ...props }, ref) => {`;
  } else if (useTS) {
    componentDeclaration = `const ${name}: React.FC<${name}Props> = ({ className }) => {`;
  } else {
    componentDeclaration = `const ${name} = ({ className }) => {`;
  }

  const content = options.styled
    ? `  return (
    <${name}Container className={className}>
      <h2>${name} Component</h2>
      <p>This is a styled component.</p>
    </${name}Container>
  );`
    : options.css
    ? `  return (
    <div className={\`\${styles.container} \${className || ''}\`.trim()}${options.forwardRef ? ' ref={ref}' : ''}>
      <h2 className={styles.title}>${name} Component</h2>
      <p className={styles.description}>This component uses CSS modules.</p>
    </div>
  );`
    : `  return (
    <div className={className}${options.forwardRef ? ' ref={ref}' : ''}>
      <h2>${name} Component</h2>
      <p>This is a basic component.</p>
    </div>
  );`;

  const closing = options.forwardRef 
    ? `});\n\n${name}.displayName = '${name}';`
    : '';

  const exportStatement = options.exportType === 'named'
    ? `export { ${name} };`
    : `export default ${options.memo ? `React.memo(${name})` : name};`;

  return `${imports.join('\n')}\n\n${propsInterface}${componentDeclaration}\n${content}\n}${closing ? '\n\n' + closing : ''}\n\n${exportStatement}\n`;
}

/**
 * Generate CSS module content
 */
export function generateCSSContent(name: string): string {
  return `.container {
  padding: 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  margin: 8px 0;
  background-color: #ffffff;
}

.title {
  margin: 0 0 8px 0;
  color: #1a202c;
  font-size: 1.25rem;
  font-weight: 600;
}

.description {
  margin: 0;
  color: #4a5568;
  font-size: 0.875rem;
  line-height: 1.4;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 12px;
    margin: 4px 0;
  }
  
  .title {
    font-size: 1.125rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .container {
    background-color: #2d3748;
    border-color: #4a5568;
  }
  
  .title {
    color: #f7fafc;
  }
  
  .description {
    color: #e2e8f0;
  }
}
`;
}

/**
 * Generate styled-components content
 */
export function generateStyledComponentsContent(name: string): string {
  return `import styled from 'styled-components';

export const ${name}Container = styled.div\`
  padding: 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  margin: 8px 0;
  background-color: #ffffff;
  
  h2 {
    margin: 0 0 8px 0;
    color: #1a202c;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    color: #4a5568;
    font-size: 0.875rem;
    line-height: 1.4;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    padding: 12px;
    margin: 4px 0;
    
    h2 {
      font-size: 1.125rem;
    }
  }
  
  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    background-color: #2d3748;
    border-color: #4a5568;
    
    h2 {
      color: #f7fafc;
    }
    
    p {
      color: #e2e8f0;
    }
  }
\`;
`;
}

/**
 * Generate test content
 */
export function generateTestContent(name: string, useTS: boolean, exportType?: string): string {
  const importStatement = exportType === 'named' 
    ? `import { ${name} } from './${name}';`
    : `import ${name} from './${name}';`;
    
  return useTS
    ? `import { render, screen } from '@testing-library/react';
${importStatement}

describe('${name}', () => {
  it('renders successfully', () => {
    render(<${name} />);
    expect(screen.getByText('${name} Component')).toBeInTheDocument();
  });
  
  it('applies custom className', () => {
    const customClass = 'custom-class';
    render(<${name} className={customClass} />);
    const component = screen.getByText('${name} Component').closest('div');
    expect(component).toHaveClass(customClass);
  });
});
`
    : `import { render, screen } from '@testing-library/react';
${importStatement}

test('renders ${name} component', () => {
  render(<${name} />);
  expect(screen.getByText('${name} Component')).toBeInTheDocument();
});

test('applies custom className', () => {
  const customClass = 'custom-class';
  render(<${name} className={customClass} />);
  const component = screen.getByText('${name} Component').closest('div');
  expect(component).toHaveClass(customClass);
});
`;
}
