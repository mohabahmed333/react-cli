import { cn } from "@/lib/utils";
import {   Tinventory_updated } from "../../../types/Tinventory";
import DetailRow from "./DetailRow";

interface ProductInfoProps {
  product: Tinventory_updated;
}

const ProductInfo = ({ product }: ProductInfoProps) =>{


 
  return (
    <>
      <DetailRow
        label="Item Name"
        value={product.itemName}
        className={
          cn("truncate h-fit gap-2  min-h-14 ",
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
