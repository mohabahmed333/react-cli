/**
 * Higher-order component that adds a test feature to a React component.
 * @param WrappedComponent The component to enhance.
 * @returns A new component with added test functionality.
 */
const withTTTTTTTTTTTTT = <P>(WrappedComponent: React.ComponentType<P>) => {
  const EnhancedComponent: React.FC<P & { testProp?: string }> = (props) => {
    const { testProp, ...rest } = props;

    // Add your test logic here, using the testProp if needed.
    console.log('Test prop:', testProp);


    return <WrappedComponent {...rest} />;
  };

  return EnhancedComponent;
};

export default withTTTTTTTTTTTTT;