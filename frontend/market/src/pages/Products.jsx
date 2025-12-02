import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `http://localhost:5001/products?page=${page}&page_size=20`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status}`);
        }

        const data = await res.json();
        setProducts(data.items || []);
        setHasMore(data.has_next || false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  return (
    <div className="bg-[#000328] min-h-screen text-white px-6 py-10">
      {/* Header Section - ALWAYS VISIBLE */}
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white">Products</h1>
        <button
          onClick={() => navigate("/products/create")}
          className="bg-purple-600 text-white px-6 py-2 rounded font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-900/50"
        >
          + Create Product
        </button>
      </div>

      {/* Content Section - Conditionally Rendered */}
      <div className="max-w-7xl mx-auto">
        
        {/* 1. Loading State */}
        {loading && products.length === 0 && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-lg">Loading products...</p>
          </div>
        )}

        {/* 2. Error State */}
        {error && products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* 3. Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20 bg-[#0a0e35] rounded-lg">
            <p className="text-xl mb-4">No products available yet.</p>
            <p className="text-purple-300 mb-6">Be the first to list a product!</p>
            {/* Optional: Another button here for convenience */}
            <button
              onClick={() => navigate("/products/create")}
              className="text-purple-400 hover:underline"
            >
              Create one now &rarr;
            </button>
          </div>
        )}

        {/* 4. Products Grid */}
        {products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.title,
                    price: p.price,
                    imageUrl: p.thumbnail_url
                      ? `http://localhost:5001${p.thumbnail_url}`
                      : "https://via.placeholder.com/300?text=No+Image",
                    category: p.category,
                    condition: p.condition,
                  }}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {(page > 1 || hasMore) && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-purple-600 text-white px-6 py-2 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore}
                  className="bg-purple-600 text-white px-6 py-2 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
