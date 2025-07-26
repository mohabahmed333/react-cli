export function generateHocContent(name: string, useTS: boolean): string {
  return useTS
    ? `import React from 'react';\n\nexport function with${name}<P extends object>(\n  WrappedComponent: React.ComponentType<P>\n) {\n  const ComponentWith${name} = (props: P) => {\n    // Add your HOC logic here\n    return <WrappedComponent {...props} />;\n  };\n\n  return ComponentWith${name};\n}\n`
    : `import React from 'react';\n\nexport function with${name}(WrappedComponent) {\n  return function ComponentWith${name}(props) {\n    // Add your HOC logic here\n    return <WrappedComponent {...props} />;\n  };\n}\n`;
}
