import React from "react";
import { useNavigate } from "react-router-dom";

/* ProductCard component
 * Props: product { id, name, price, imageUrl }
 * Renders image, name, formatted price.
 * Clicking the card or "View Details" button navigates to the product detail page.
 */
const ProductCard = ({ product }) => {
  // useNavigate hook allows programmatic navigation to different routes
  const navigate = useNavigate();

  if (!product) return null;
  
  // Destructure product properties for cleaner code
  const { id, name, price, imageUrl } = product;

  // Handler function to navigate to the product details page
  // Uses the product ID to create dynamic route: /products/:id
  const handleViewDetails = () => {
    navigate(`/products/${id}`);
  };

  return (
    // Entire card is clickable - improves UX
    // cursor-pointer shows it's interactive
    <div 
      className="rounded-lg overflow-hidden shadow-md bg-gray-800 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleViewDetails}
    >
      {/* Product image section */}
      <div className="h-40 bg-gray-700 flex items-center justify-center overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="object-cover w-full h-full"
          loading="lazy" // Lazy loading improves performance for many products
        />
      </div>
      
      {/* Product info section */}
      <div className="p-4 flex flex-col gap-1">
        {/* Product name - truncate prevents overflow, title shows full name on hover */}
        <h2 className="font-semibold text-lg truncate" title={name}>{name}</h2>
        
        {/* Price in brand color */}
        <p className="text-[#E0B0FF] font-bold">${price.toFixed(2)}</p>
        
        {/* View Details button - now functional */}
        <button
          type="button"
          className="mt-2 w-full py-2 text-sm font-medium rounded bg-[#E0B0FF] text-gray-900 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#E0B0FF]/50 transition"
          onClick={(e) => {
            // Stop event propagation to prevent double-navigation
            // (button click would also trigger parent div onClick)
            e.stopPropagation();
            handleViewDetails();
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
