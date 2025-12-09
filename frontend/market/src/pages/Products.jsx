import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Available categories (matching CreateProduct)
  const categories = [
    "electronics", "clothing", "books", "furniture", 
    "sports", "toys", "tools", "other"
  ];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [category, minPrice, maxPrice, sortBy, sortOrder]);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query params
        const params = new URLSearchParams({
          page: page.toString(),
          page_size: "20",
          sort: sortBy,
          order: sortOrder,
        });

        if (debouncedSearch) params.append("q", debouncedSearch);
        if (category) params.append("category", category);
        if (minPrice) params.append("min_price", minPrice);
        if (maxPrice) params.append("max_price", maxPrice);

        const res = await fetch(
          `http://localhost:5001/products?${params.toString()}`,
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
  }, [page, debouncedSearch, category, minPrice, maxPrice, sortBy, sortOrder]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("created_at");
    setSortOrder("desc");
    setPage(1);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || category || minPrice || maxPrice || sortBy !== "created_at" || sortOrder !== "desc";

  return (
    <div className="bg-[#000328] min-h-screen text-white px-6 py-10">
      {/* Header Section - ALWAYS VISIBLE */}
      <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-darker-grotesque font-bold text-white">Products</h1>
        <button
          onClick={() => navigate("/products/create")}
          className="bg-[#e0b0ff] text-[#000328] text-xl px-6 py-1 rounded font-darker-grotesque hover:bg-transparent border-2 border-transparent hover:border-[#E0B0FF] hover:text-[#e0b0ff] shadow-purple-900/50 transition duration-300 "
        >
          + Create Product
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto mb-8">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-[#1a1d4d] border border-[#E0B0FF]/30 rounded-lg focus:outline-none focus:border-[#E0B0FF] text-white placeholder-gray-400"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* Category Filter */}
          <div className="flex flex-col">
            <label className="text-sm text-[#E0B0FF] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 bg-[#1a1d4d] border border-[#E0B0FF]/30 rounded focus:outline-none focus:border-[#E0B0FF] text-white min-w-[150px]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex flex-col">
            <label className="text-sm text-[#E0B0FF] mb-1">Min Price</label>
            <input
              type="number"
              placeholder="$0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
              className="px-4 py-2 bg-[#1a1d4d] border border-[#E0B0FF]/30 rounded focus:outline-none focus:border-[#E0B0FF] text-white w-[120px]"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-[#E0B0FF] mb-1">Max Price</label>
            <input
              type="number"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
              className="px-4 py-2 bg-[#1a1d4d] border border-[#E0B0FF]/30 rounded focus:outline-none focus:border-[#E0B0FF] text-white w-[120px]"
            />
          </div>

          {/* Sort By */}
          <div className="flex flex-col">
            <label className="text-sm text-[#E0B0FF] mb-1">Sort By</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-4 py-2 bg-[#1a1d4d] border border-[#E0B0FF]/30 rounded focus:outline-none focus:border-[#E0B0FF] text-white min-w-[180px]"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchQuery && (
              <span className="px-3 py-1 bg-[#E0B0FF]/20 text-[#E0B0FF] rounded-full text-sm flex items-center gap-2">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="hover:text-white">✕</button>
              </span>
            )}
            {category && (
              <span className="px-3 py-1 bg-[#E0B0FF]/20 text-[#E0B0FF] rounded-full text-sm flex items-center gap-2">
                Category: {category.charAt(0).toUpperCase() + category.slice(1)}
                <button onClick={() => setCategory("")} className="hover:text-white">✕</button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="px-3 py-1 bg-[#E0B0FF]/20 text-[#E0B0FF] rounded-full text-sm flex items-center gap-2">
                Price: ${minPrice || "0"} - ${maxPrice || "∞"}
                <button onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="hover:text-white">✕</button>
              </span>
            )}
          </div>
        )}
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
          <div className="text-center py-20 font-darker-grotesquebg-[#0a0e35] rounded-lg">
            <p className="text-2xl mb-4">No products available yet.</p>
            <p className="text-purple-300 mb-6">Be the first to list a product!</p>
            {/* Optional: Another button here for convenience */}
            <button
              onClick={() => navigate("/products/create")}
              className="text-[#e0b0ff] hover:underline"
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
