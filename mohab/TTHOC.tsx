import React from 'react';

export function withTT<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const ComponentWithTT = (props: P) => {
    // Add your HOC logic here
    return <WrappedComponent {...props} />;
  };

  return ComponentWithTT;
}
