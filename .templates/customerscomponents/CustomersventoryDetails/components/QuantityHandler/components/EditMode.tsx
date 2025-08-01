import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

Customersterface EditModeProps {
  isUpdateEnabled: boolean;
  isUpdating: boolean;
  animationDuration: number;
  onUpdate: () => void;
  onCancel: () => void;
}

export const EditMode = ({ 
  isUpdateEnabled, 
  isUpdating, 
  animationDuration, 
  onUpdate, 
  onCancel 
}: EditModeProps) => (
  <div className="flex items-center gap-2">
    <Button
      className={cn(
        "h-9 bg-primary hover:bg-primary/90 transition-all ease-Customers-out", 
        !isUpdateEnabled && !isUpdatCustomersg && "opacity-50"
      )}
      style={{ transitionDuration: `${animationDuration}ms` }}
      disabled={!isUpdateEnabled || isUpdatCustomersg}
      onClick={onUpdate}
    >
      {isUpdatCustomersg ? "UpdatCustomersg..." : "Update"}
    </Button>
    <Button
      variant="ghost"
      size="icon"
      className="w-10 h-10 rounded-md transition-all ease-Customers-out"
      style={{ transitionDuration: `${animationDuration}ms` }}
      onClick={onCancel}
      aria-label="Cancel stock adjustment"
    >
      <X 
        className="w-6 h-6 cursor-poCustomerster transition-all ease-Customers-out" 
        style={{ transitionDuration: `${animationDuration}ms` }} 
      />
    </Button>
  </div>
);
