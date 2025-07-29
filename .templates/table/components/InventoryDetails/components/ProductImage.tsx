

interface ProductImageProps {
  imageUrl: string;
  altText: string;
}

const ProductImage = ({ imageUrl, altText }: ProductImageProps) => (
  <div className="flex items-center justify-center px-6 py-3 w-full">
    <div className="flex h-[180px] items-center justify-center w-full bg-gray-50 rounded-lg">
      <img 
        className="w-36 h-36 object-contain" 
        alt={altText} 
        src={imageUrl} 
      />
    </div>
  </div>
);

export default ProductImage;
