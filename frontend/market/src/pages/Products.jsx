import React from "react";
import ProductCard from "../components/ProductCard";

// Mock product data (will later be replaced by API fetch)
const mockProducts = [
  {
    id: 1,
    name: "Vintage Camera",
    price: 120.0,
    imageUrl: "https://via.placeholder.com/300?text=Camera",
  },
  {
    id: 2,
    name: "Mountain Bike",
    price: 450.0,
    imageUrl: "https://via.placeholder.com/300?text=Bike",
  },
  {
    id: 3,
    name: "Gaming Laptop",
    price: 999.99,
    imageUrl: "https://via.placeholder.com/300?text=Laptop",
  },
  {
    id: 4,
    name: "Smart Watch",
    price: 199.5,
    imageUrl: "https://via.placeholder.com/300?text=Watch",
  },
  {
    id: 5,
    name: "Desk Lamp",
    price: 35.25,
    imageUrl: "https://via.placeholder.com/300?text=Lamp",
  },
  {
    id: 6,
    name: "Noise-Cancelling Headphones",
    price: 250.0,
    imageUrl: "https://via.placeholder.com/300?text=Headphones",
  },
];

const Products = () => {
  return (
    <div className="bg-gray-900 min-h-screen text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {mockProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default Products;
