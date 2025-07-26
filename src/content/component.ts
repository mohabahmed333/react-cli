import { ComponentOptions } from "../commands/generate/component/generateComponent";

 
export function generateComponentContent(name: string, options: ComponentOptions, useTS: boolean): string {
  const imports = ['React'];
  const propsInterface = useTS ? `interface ${name}Props {\n  // define props here\n}` : '';
  let componentBody = '';

  // Add necessary imports
  if (options.css) imports.push(`styles from './${name}.module.css'`);
  if (options.styled) imports.push('styled from "styled-components"');
  if (options.memo) imports.push('memo');
  if (options.forwardRef) imports.push('forwardRef');

  // Create container element
  const container = options.styled 
    ? '<Container>' 
    : `<div${options.css ? ' className={styles.container}' : ''}>`;
  const closing = options.styled ? '</Container>' : '</div>';

  // Component body with forwardRef or regular
  componentBody = options.forwardRef
    ? useTS
      ? `const ${name}Component = forwardRef<HTMLDivElement, ${name}Props>((props, ref) => {\n  return (\n    ${container} ref={ref}>\n      {/* ${name} content */}\n    ${closing}\n  );\n});`
      : `const ${name}Component = forwardRef((props, ref) => {\n  return (\n    ${container} ref={ref}>\n      {/* ${name} content */}\n    ${closing}\n  );\n});`
    : `const ${name}Component = (props) => {\n  return (\n    ${container}\n      {/* ${name} content */}\n    ${closing}\n  );\n}`;

  // Apply memo if needed
  componentBody += options.memo 
    ? `\nconst ${name} = memo(${name}Component);` 
    : `\nconst ${name} = ${name}Component;`;

  // Handle lazy loading
  if (options.lazy) {
    imports.push('lazy from "react"');
    return `${imports.join(', ')};\n\n${propsInterface}\n\n${
      options.exportType === 'named'
        ? `const ${name} = lazy(() => import('./${name}'));\n\nexport { ${name} };`
        : `export default lazy(() => import('./${name}'));`
    }`;
  }

  // Regular export
  const exportStatement = options.exportType === 'named' 
    ? `export { ${name} }` 
    : `export default ${name}`;

  return `${imports.join(', ')};\n\n${propsInterface}\n\n${componentBody}\n\n${exportStatement};`;
}