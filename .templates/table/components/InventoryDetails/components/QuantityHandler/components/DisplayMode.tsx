import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface DisplayModeProps {
  currentStock: number;
  animationDuration: number;
  onEditClick: () => void;
}

export const DisplayMode = ({ currentStock, animationDuration, onEditClick }: DisplayModeProps) => (
  <div className="flex items-center gap-2">
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-md p-0 group hover:bg-gray-100"
      onClick={onEditClick}
    >
      <Pencil 
        className="h-6 w-6 text-blue-600 cursor-pointer transition-all ease-in-out" 
        style={{ transitionDuration: `${animationDuration}ms` }} 
      />
    </Button>
    <span className="text-accent-foreground text-base font-medium leading-6">
      {currentStock} units
    </span>
  </div>
);
