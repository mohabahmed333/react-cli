
import DetailRow from "./DetailRow";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
  
interface ProductStatusProps {
  isActive: boolean;
  onToggle: (checked: boolean) => void;
}

const ProductStatus = ({ isActive, onToggle }: ProductStatusProps) => (
  <DetailRow
    label="Status"
    value={
      <div className="inline-flex justify-start items-center gap-2 ">
         <Switch className="cursor-pointer" onCheckedChange={onToggle} checked={isActive} id="Active"/>
         <Label htmlFor="Active" className="cursor-pointer">
          Active
         </Label>
      </div>
    }
  />
);

export default ProductStatus;
