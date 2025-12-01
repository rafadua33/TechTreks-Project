import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * ProductDetails Component
 * 
 * Displays detailed information about a single product.
 * Route: /products/:id
 * 
 * Features:
 * - Large product image
 * - Product name, price, description
 * - Seller information (placeholder for now)
 * - Back navigation to products list
 * - Contact seller button (placeholder for future messaging feature)
 */
const ProductDetails = () => {
  // Get the product ID from URL parameters (e.g., /products/3 -> id = "3")
  const { id } = useParams();
  
  // Hook for programmatic navigation
  const navigate = useNavigate();
  
  // State to hold the product data
  const [product, setProduct] = useState(null);
  
  // State to track loading status
  const [loading, setLoading] = useState(true);
  
  // State to track if product was not found
  const [notFound, setNotFound] = useState(false);

  // Mock product data (same as Products.jsx - will be replaced with API call later)
  const mockProducts = [
    {
      id: 1,
      name: "Vintage Camera",
      price: 120.0,
      imageUrl: "https://via.placeholder.com/600?text=Camera",
      description: "Classic film camera in excellent condition. Perfect for photography enthusiasts and collectors. Comes with original leather case.",
      seller: "John Doe",
      location: "San Francisco, CA",
    },
    {
      id: 2,
      name: "Mountain Bike",
      price: 450.0,
      imageUrl: "https://via.placeholder.com/600?text=Bike",
      description: "High-quality mountain bike with 21-speed gear system. Lightly used, well maintained. Great for trails and off-road adventures.",
      seller: "Jane Smith",
      location: "Denver, CO",
    },
    {
      id: 3,
      name: "Gaming Laptop",
      price: 999.99,
      imageUrl: "https://via.placeholder.com/600?text=Laptop",
      description: "Powerful gaming laptop with dedicated graphics card, 16GB RAM, and 512GB SSD. Runs all modern games smoothly.",
      seller: "Mike Johnson",
      location: "Austin, TX",
    },
    {
      id: 4,
      name: "Smart Watch",
      price: 199.5,
      imageUrl: "https://via.placeholder.com/600?text=Watch",
      description: "Feature-rich smartwatch with heart rate monitor, GPS, and waterproof design. Compatible with iOS and Android.",
      seller: "Sarah Williams",
      location: "Seattle, WA",
    },
    {
      id: 5,
      name: "Desk Lamp",
      price: 35.25,
      imageUrl: "https://via.placeholder.com/600?text=Lamp",
      description: "Modern LED desk lamp with adjustable brightness and color temperature. Energy efficient and perfect for home office.",
      seller: "Tom Brown",
      location: "Portland, OR",
    },
    {
      id: 6,
      name: "Noise-Cancelling Headphones",
      price: 250.0,
      imageUrl: "https://via.placeholder.com/600?text=Headphones",
      description: "Premium wireless headphones with active noise cancellation. Superior sound quality and comfortable for long wear.",
      seller: "Emily Davis",
      location: "New York, NY",
    },
  ];

  // useEffect runs when component mounts or when 'id' changes
  useEffect(() => {
    // Simulate API fetch delay (replace with real fetch later)
    const fetchProduct = () => {
      setLoading(true);
      
      // Simulate network delay
      setTimeout(() => {
        // Find product by ID (convert string id from URL to number)
        const foundProduct = mockProducts.find((p) => p.id === parseInt(id));
        
        if (foundProduct) {
          setProduct(foundProduct);
          setNotFound(false);
        } else {
          // Product with this ID doesn't exist
          setNotFound(true);
        }
        
        setLoading(false);
      }, 500); // 500ms delay to simulate network request
    };

    fetchProduct();
  }, [id]); // Re-run effect if product ID changes

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E0B0FF] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  // Show error message if product not found
  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-400 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-2 bg-[#E0B0FF] text-gray-900 rounded-lg hover:opacity-90 transition"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Main product details view
  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/products")}
          className="mb-6 text-[#E0B0FF] hover:underline flex items-center gap-2"
        >
          ← Back to Products
        </button>

        {/* Product details grid - 2 columns on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column: Image */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Right column: Product info */}
          <div className="flex flex-col gap-6">
            {/* Product name */}
            <h1 className="text-3xl font-bold">{product.name}</h1>

            {/* Price - large and prominent */}
            <div className="text-4xl font-bold text-[#E0B0FF]">
              ${product.price.toFixed(2)}
            </div>

            {/* Description section */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Seller information section */}
            <div className="border-t border-gray-700 pt-4">
              <h2 className="text-xl font-semibold mb-2">Seller Information</h2>
              <p className="text-gray-300">
                <span className="font-medium">Name:</span> {product.seller}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Location:</span> {product.location}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {/* Contact seller button (placeholder - will integrate messaging later) */}
              <button
                className="flex-1 py-3 bg-[#E0B0FF] text-gray-900 rounded-lg font-semibold hover:opacity-90 transition"
                onClick={() => alert("Contact seller feature coming soon!")}
              >
                Contact Seller
              </button>
              
              {/* Add to favorites button (placeholder for future feature) */}
              <button
                className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
                onClick={() => alert("Add to favorites feature coming soon!")}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
