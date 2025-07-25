/**
 * Higher-order component that adds a test prop to the wrapped component.
 * @param WrappedComponent The component to be wrapped.
 * @returns A new component with the test prop added.
 */
const withTesthhh = <P>(WrappedComponent: React.ComponentType<P>) => {
  const WithTesthhhComponent: React.FC<P & { test: string }> = (props) => {
    return <WrappedComponent {...props} />;
  };

  return WithTesthhhComponent;
};

export default withTesthhh;