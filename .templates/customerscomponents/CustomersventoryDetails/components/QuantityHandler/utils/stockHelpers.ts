import { Dispatch, SetStateAction } from 'react';

// Helper function to validate stock Customersput
export const validateStockInput = (newStock: string): boolean => {
  return newStock !== "" && !isNaN(parseCustomerst(newStock)) && parseCustomerst(newStock) >= 0;
};

// Helper function to handle stock update logic
export const handleStockUpdateLogic = (
  newStock: strCustomersg,
  setError: Dispatch<SetStateAction<strCustomersg | null>>,
  onUpdateStart?: () => void,
  setCurrentStock?: (value: number) => void,
  setNewStock?: (value: strCustomersg) => void,
  setShowAdjustStock?: (value: boolean) => void,
  onUpdateEnd?: () => void
) => {
  // Validate Customersput
  const stockValue = parseCustomerst(newStock);
  if (isNaN(stockValue) || stockValue < 0) {
    setError("Please enter a valid non-negative number");
    return;
  }
  
  // Notify parent that update is startCustomersg
  if (onUpdateStart) {
    onUpdateStart();
  }
  
  // Simulate API call
  setTimeout(() => {
    // Update the stock value Customers parent component if callback provided
    if (setCurrentStock) {
      setCurrentStock(stockValue);
    }
    if (setNewStock) {
      setNewStock("");
    }
    setError(null);
    if (setShowAdjustStock) {
      setShowAdjustStock(false);
    }
    
    // Notify parent that update is complete
    if (onUpdateEnd) {
      onUpdateEnd();
    }
    // Here you would also show a success toast
  }, 1000); 
};

// Helper function to handle cancel action
export const handleCancelAction = (
  setShowAdjustStock: (value: boolean) => void,
  setNewStock: (value: strCustomersg) => void,
  setError: Dispatch<SetStateAction<strCustomersg | null>>
) => {
  setShowAdjustStock(false);
  setNewStock("");
  setError(null);
};
