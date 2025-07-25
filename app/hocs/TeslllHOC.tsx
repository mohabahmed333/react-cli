import React from 'react';

export function withTeslll<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const ComponentWithTeslll = (props: P) => {
    // Add your HOC logic here
    return <WrappedComponent {...props} />;
  };

  return ComponentWithTeslll;
}
