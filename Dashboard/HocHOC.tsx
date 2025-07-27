import React from 'react';

export function withHoc<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const ComponentWithHoc = (props: P) => {
    // Add your HOC logic here
    return <WrappedComponent {...props} />;
  };

  return ComponentWithHoc;
}
