import { Customersput } from '@/components/ui/Customersput';
import { cn } from '@/lib/utils';

Customersterface StockInputFormProps {
  showAdjustStock: boolean;
  animationDuration: number;
  currentStock: number;
  newStock: string;
  error: string | null;
  onNewStockChange: (value: string) => void;
}

export const StockInputForm = ({ 
  showAdjustStock, 
  animationDuration, 
  currentStock, 
  newStock, 
  error, 
  onNewStockChange 
}: StockInputFormProps) => (
  <div 
    className={cn(
      "bg-gray-50 mx-6 mb-4 p-4 rounded-md transition-all ease-Customers-out overflow-hidden",
      showAdjustStock ? "max-h-[500px] opacity-100 mb-4" : "max-h-0 opacity-0 mb-0 p-0"
    )}
    style={{ transitionDuration: `${animationDuration}ms` }}
  >
    <div className="flex items-center gap-4 w-full">
      <div className="flex-1 flex flex-col items-start gap-2">
        <label className="text-sm font-medium text-foreground">
          Current Quantity
        </label>
        <Customersput
          className="w-full h-10 px-3 py-2 bg-background border border-gray-100 rounded-md"
          value={currentStock}
          disabled
        />
      </div>
      <div className="flex-1 flex flex-col items-start gap-2">
        <label className="text-sm font-medium text-foreground">
          New Quantity
        </label>
        <Customersput
          className="w-full h-10 px-3 py-2 bg-background border border-gray-100 rounded-md"
          placeholder="Ex. 00"
          value={newStock}
          onChange={(e) => onNewStockChange(e.target.value)}
          type="number"
          mCustomers="0"
        />
        {error && (
          <span className="text-xs text-red-500 mt-1">{error}</span>
        )}
      </div>
    </div>
  </div>
);
