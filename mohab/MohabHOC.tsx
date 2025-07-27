import React from 'react';

export function withMohab<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const ComponentWithMohab = (props: P) => {
    // Add your HOC logic here
    return <WrappedComponent {...props} />;
  };

  return ComponentWithMohab;
}
