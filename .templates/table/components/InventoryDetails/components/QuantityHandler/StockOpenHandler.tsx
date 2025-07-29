import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react'

interface StockOpenHandlerProps {
    currentStock: number;
    isUpdateEnabled: boolean;
    isUpdating: boolean;
    setError: Dispatch<SetStateAction<string | null>>;
    setNewStock: Dispatch<SetStateAction<string>>;
    handleStockUpdate: () => void;
    newStock: string;
    error: string | null;
    animationDuration?: number; // Animation duration in ms
    isVisible?: boolean; // Control visibility with animation
}

export default function StockOpenHandler({
    currentStock,
    isUpdateEnabled,
    isUpdating,
    setError,
    setNewStock,    
    handleStockUpdate,
    newStock,
    error,
    animationDuration = 300, // Default animation duration of 300ms
    isVisible = true // Default to visible
}: StockOpenHandlerProps) {
    
  return (
    <div 
      className={cn(
        "bg-gray-50 p-4 rounded-md w-full transition-all ease-in-out overflow-hidden",
        isVisible ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 p-0"
      )}
      style={{ transitionDuration: `${animationDuration}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-accent-foreground">Adjust Stock</h3>
        <div className="flex items-center gap-2">
          <Button
            className={cn(
              "h-9 bg-primary hover:bg-primary/90 transition-all ease-in-out",
              !isUpdateEnabled && !isUpdating && "opacity-50"
            )}
            style={{ transitionDuration: `${animationDuration}ms` }}
            disabled={!isUpdateEnabled || isUpdating}
            onClick={handleStockUpdate}
          >
            {isUpdating ? "Updating..." : "Update"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-md transition-all ease-in-out"
            style={{ transitionDuration: `${animationDuration}ms` }}
            onClick={() => {
              setNewStock("");
            }}
            aria-label="Cancel stock adjustment"
          >
            <X className="w-5 h-5 cursor-pointer transition-all ease-in-out" style={{ transitionDuration: `${animationDuration}ms` }} />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-4 w-full">
        <div className="flex-1 flex flex-col items-start gap-2">
          <label className="text-sm font-medium text-foreground">
            Current Quantity
          </label>

          <Input
            className="h-10 bg-background"
            value={currentStock}
            disabled
          />
        </div>

        <div className="flex-1 flex flex-col items-start gap-2">
          <label className="text-sm font-medium text-foreground">
            New Quantity
          </label>

          <Input
            className="h-10 bg-background focus:border-primary focus:ring-primary"
            placeholder="Ex. 00"
            value={newStock}
            onChange={(e) => {
              setNewStock(e.target.value);
              setError(null);
            }}
            type="number"
            min="0"
          />
          {error && (
            <span className="text-xs text-destructive mt-1">{error}</span>
          )}
        </div>
      </div>
    </div>
  )
}
