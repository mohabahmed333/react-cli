import { DrawerModal } from "@/shared/components/modal/DrawerModal";
import { useEffect, useState } from "react";
import {  InventoryStatus, Tinventory_updated } from "../../types/Tinventory";
import QuantityHandler from "./components/QuantityHandler/QuantityHandler";
import ProductImage from "@/assets/svgs/product.webp";
import ProductInfo from "./components/ProductDetails";
import ProductStatus from "./components/ProductStatus";
import LastUpdateDisplay from "./components/LastUpdateDisplay";

interface ProductDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Tinventory_updated;
}

// Default mock data for testing when no product is provided
const defaultProductData = {
  id: "mock-id",
  itemName: "Metformin 500mg",
  category: "Capsules",
  price: 1400,
  sku: "SKU-00789",
  status: InventoryStatus.Active,
  stock: 75
};

// We directly convert the enum in the component where needed

export default function ProductDetails({ isOpen, onClose, product }: ProductDetailsProps) {
  // Use provided product or fallback to default mock data
  const productData = product || defaultProductData;
  
  // State for the stock adjustment and product status
  const [currentStock, setCurrentStock] = useState<number>(productData.stock);
  const [isActive, setIsActive] = useState<boolean>(productData.status === InventoryStatus.Active);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setCurrentStock(product.stock);
      setIsActive(product.status === InventoryStatus.Active);
      setError(null);
      setIsUpdating(false);
    }
  }, [product]);

  
  // Handle status toggle
  const handleStatusToggle = (checked: boolean) => {
    setIsActive(checked);
    // Here you would also update the product status in the backend
  };

  return (
    <DrawerModal 
      isOpen={isOpen}
      onClose={onClose}
      title="Product details"
      size="sm"
      className="rounded-xl overflow-hidden bg-white"
    >
      <div className="flex flex-col items-start w-full h-full overflow-y-auto">
        {/* Product Image Section */}
       <img src={ProductImage} alt={productData.itemName} />

        {/* Product Details Section */} 
        <ProductInfo product={productData} />

        {/* Adjust Stock Section */}
        <QuantityHandler
          currentStock={currentStock}
          isUpdating={isUpdating}
          error={error}
          setError={setError}
          setCurrentStock={(value) => setCurrentStock(value)}
          onUpdateStart={() => setIsUpdating(true)}
          onUpdateEnd={() => setIsUpdating(false)}
          animationDuration={300}
        />

        {/* Status Toggle Section */}
        <ProductStatus isActive={isActive} onToggle={handleStatusToggle} />

        {/* Last Update Display */}
        <LastUpdateDisplay />
      </div>
    </DrawerModal>
  );
}