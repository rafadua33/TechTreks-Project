import React from "react";

/* ProductCard component
 * Props: product { id, name, price, imageUrl }
 * Renders image, name, formatted price.
 */
const ProductCard = ({ product }) => {
  if (!product) return null;
  const { name, price, imageUrl } = product;
  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-gray-800 hover:shadow-lg transition-shadow duration-300">
      <div className="h-40 bg-gray-700 flex items-center justify-center overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="object-cover w-full h-full"
          loading="lazy"
        />
      </div>
      <div className="p-4 flex flex-col gap-1">
        <h2 className="font-semibold text-lg truncate" title={name}>{name}</h2>
        <p className="text-[#E0B0FF] font-bold">${price.toFixed(2)}</p>
        {/* Placeholder for future actions (view, add to cart, etc.) */}
        <button
          type="button"
          className="mt-2 w-full py-2 text-sm font-medium rounded bg-[#E0B0FF] text-gray-900 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#E0B0FF]/50"
          disabled
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
