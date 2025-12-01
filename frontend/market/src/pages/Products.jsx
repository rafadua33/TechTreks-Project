import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";

const Products = () => {
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

        // Backend returns { items: [...], page, page_size, total, has_next, has_prev }
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

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && products.length === 0) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">No products available yet.</p>
          <p className="text-gray-400">Be the first to list a product!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Products</h1>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              name: p.title, // Backend uses 'title', frontend expects 'name'
              price: p.price,
              imageUrl:
                p.thumbnail_url ||
                "https://via.placeholder.com/300?text=No+Image",
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
            className="bg-yellow-500 text-black px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-600"
          >
            Previous
          </button>

          <span className="flex items-center px-4 py-2 bg-gray-800 rounded">
            Page {page}
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            className="bg-yellow-500 text-black px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-600"
          >
            Next
          </button>
        </div>
      )}

      {/* Error banner (if error but products still showing) */}
      {error && products.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg">
          Error loading more products
        </div>
      )}
    </div>
  );
};

export default Products;
