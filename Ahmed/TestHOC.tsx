import React from 'react';

export function withTest<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const ComponentWithTest = (props: P) => {
    // Add your HOC logic here
    return <WrappedComponent {...props} />;
  };

  return ComponentWithTest;
}
