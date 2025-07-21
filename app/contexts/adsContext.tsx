import React, { createContext, useContext, useState, ReactNode } from 'react';

interface adsContextProps {
  children: ReactNode;
}

interface adsContextType {
  // Add your context value types here
}

const adsContext = createContext<adsContextType | undefined>(undefined);

export const adsProvider = ({ children }: adsContextProps) => {
  // const [value, setValue] = useState();
  return (
    <adsContext.Provider value={{ /* value */ }}>
      {children}
    </adsContext.Provider>
  );
};

export const useads = () => {
  const context = useContext(adsContext);
  if (!context) throw new Error('useads must be used within a adsProvider');
  return context;
};
