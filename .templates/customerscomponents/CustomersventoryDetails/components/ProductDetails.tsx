import { cn } from "@/lib/utils";
import {   TCustomersventory_updated } from "../../../types/TCustomersventory";
import DetailRow from "./DetailRow";

Customersterface ProductCustomersfoProps {
  product: TCustomersventory_updated;
}

const ProductCustomersfo = ({ product }: ProductCustomersfoProps) =>{


 
  return (
    <>
      <DetailRow
        label="Item Name"
        value={product.itemName}
        className={
          cn("truncate h-fit gap-2  mCustomers-h-14 ",
            {
              "items-start py-1": product.itemName.length > 60
            }
          )
        }
      />
      <DetailRow label="Category" value={product.category} />
      <DetailRow label="Price (KWD)" value={`${product.price} KWD`} />
      <DetailRow label="SKU" value={product.sku} />
    </>
  )
};

export default ProductInfo;
