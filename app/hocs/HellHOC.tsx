/**
 * Higher-order component to add dark/light mode functionality to a React component.
 * Uses localStorage to persist the user's preference.
 */
const withTheme = (WrappedComponent: React.ComponentType<any>) => {
  /**
   * Component that manages dark/light mode.
   */
  const ThemeComponent: React.FC = (props) => {
    const [isDarkMode, setIsDarkMode] = React.useState(
      localStorage.getItem('darkMode') === 'true'
    );

    React.useEffect(() => {
      localStorage.setItem('darkMode', isDarkMode.toString());
    }, [isDarkMode]);

    const toggleDarkMode = () => {
      setIsDarkMode(!isDarkMode);
    };

    return (
      <div className={isDarkMode ? 'dark-mode' : 'light-mode'}>
          <button onClick={toggleDarkMode}>
            {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        <WrappedComponent {...props} isDarkMode={isDarkMode} />
      </div>
    );
  };

  return ThemeComponent;
};


/**
 * Higher-order component to add a loading indicator to a React component.
 */
const withLoading = (WrappedComponent: React.ComponentType<any>) => {
  /**
   * Component that displays a loading indicator while fetching data.
   */
  const LoadingComponent: React.FC<{isLoading: boolean}> = ({ isLoading, ...rest }) => {
    return (
      <div>
        {isLoading ? <div>Loading...</div> : <WrappedComponent {...rest} />}
      </div>
    );
  };

  return (props: any) => (
    <LoadingComponent {...props} isLoading={props.isLoading} />
  );
};


/**
 * Higher-order component to add error handling to a React component.
 */
const withErrorHandling = (WrappedComponent: React.ComponentType<any>) => {
  /**
   * Component that handles errors during data fetching.
   */
  const ErrorHandlingComponent: React.FC<{ error: any; loading: boolean }> = ({
    error,
    loading,
    ...rest
  }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (error) {
      return <div>Error: {error.message}</div>;
    }
    return <WrappedComponent {...rest} />;
  };

  return (props: any) => (
    <ErrorHandlingComponent {...props} error={props.error} loading={props.loading} />
  );
};


// Example usage
const MyComponent:React.FC = (props) => <div>Hello {props.name}</div>;

const MyComponentWithTheme = withTheme(MyComponent);
const MyComponentWithLoading = withLoading(MyComponentWithTheme);
const EnhancedComponent = withErrorHandling(MyComponentWithLoading);

export default EnhancedComponent;