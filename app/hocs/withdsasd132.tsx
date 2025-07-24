import React from 'react';

export function withdsasd132<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const ComponentWithdsasd132 = (props: P) => {
    // Add your HOC logic here
    return <WrappedComponent {...props} />;
  };

  return ComponentWithdsasd132;
}
