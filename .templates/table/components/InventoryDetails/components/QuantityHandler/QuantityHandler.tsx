import { Dispatch, SetStateAction, useState, useEffect } from 'react'
import { cn } from '@/lib/utils';
import { DisplayMode } from './components/DisplayMode';
import { EditMode } from './components/EditMode';
import { StockInputForm } from './components/StockInputForm';
import { validateStockInput, handleStockUpdateLogic, handleCancelAction } from './utils/stockHelpers';

interface QuantityHandlerProps {
  currentStock: number;
  isUpdating: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  setCurrentStock?: (value: number) => void; // Optional callback to update stock in parent
  animationDuration?: number; // Animation duration in ms
  onUpdateStart?: () => void; // Callback when update starts
  onUpdateEnd?: () => void; // Callback when update completes
}

export default function QuantityHandler({
  currentStock,
  error,
  isUpdating,
  setError,
  setCurrentStock,
  animationDuration = 300, // Default to 300ms for animation
  onUpdateStart,
  onUpdateEnd
}: QuantityHandlerProps) {
    const [newStock, setNewStock] = useState<string>("");
    const [showAdjustStock, setShowAdjustStock] = useState<boolean>(false);
    
    // Reset new stock when current stock changes
    useEffect(() => {
      setNewStock("");
      setError(null);
    }, [currentStock, setError]);
    
    // Calculate if update button should be enabled
    const isUpdateEnabled = validateStockInput(newStock);

    // Handle stock update
    const handleStockUpdate = () => {
      handleStockUpdateLogic(
        newStock,
        setError,
        onUpdateStart,
        setCurrentStock,
        setNewStock,
        setShowAdjustStock,
        onUpdateEnd
      );
    };

    // Handle cancel action
    const handleCancel = () => {
      handleCancelAction(setShowAdjustStock, setNewStock, setError);
    };

    // Handle new stock change
    const handleNewStockChange = (value: string) => {
      setNewStock(value);
      setError(null);
    };

    return (
      <div className={cn("w-full", {
        "bg-gray-50": showAdjustStock,
      })}>
        <div className="flex items-center justify-between px-6 py-4 max-h-14">
          <div className="text-base text-muted-foreground">
            Stock
          </div>
          
          {/* In-place editing: Toggle between display and edit modes */}
          {!showAdjustStock ? (
            <DisplayMode
              currentStock={currentStock}
              animationDuration={animationDuration}
              onEditClick={() => setShowAdjustStock(true)}
            />
          ) : (
            <EditMode
              isUpdateEnabled={isUpdateEnabled}
              isUpdating={isUpdating}
              animationDuration={animationDuration}
              onUpdate={handleStockUpdate}
              onCancel={handleCancel}
            />
          )}
        </div>

        {/* Only show the input fields when in edit mode - with animation */}
        <StockInputForm
          showAdjustStock={showAdjustStock}
          animationDuration={animationDuration}
          currentStock={currentStock}
          newStock={newStock}
          error={error}
          onNewStockChange={handleNewStockChange}
        />
      </div>
    )
}
