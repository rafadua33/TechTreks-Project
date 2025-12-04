import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "good",
    quantity: "1",
    is_public: true
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    "electronics", "clothing", "books", "furniture", 
    "sports", "toys", "tools", "other"
  ];

  const conditions = [
    { value: "new", label: "New" },
    { value: "like-new", label: "Like New" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.title.trim()) {
      setError("Title is required");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (image) {
        data.append('image', image);
      }

      const res = await fetch("http://localhost:5001/products", {
        method: "POST",
        credentials: "include",
        body: data
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create product");
      }

      navigate("/products");
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#000328] min-h-screen text-white px-6 py-10">
      <div className="max-w-2xl mx-auto bg-[#0a0e35] p-8 rounded-xl shadow-2xl border border-[#E0B0FF]/30">
        <h1 className="text-3xl font-bold mb-8 text-[#E0B0FF]">List a New Product</h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-[#E0B0FF]">Product Image</label>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 bg-[#1a1d4d] border-2 border-dashed border-[#E0B0FF]/50 rounded-lg flex items-center justify-center overflow-hidden relative group">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#E0B0FF]/70 text-sm">No image</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E0B0FF] file:text-[#000328] hover:file:bg-[#E0B0FF]/80 cursor-pointer"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[#E0B0FF]">Title <span className="text-[#E0B0FF]">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#1a1d4d] border border-[#E0B0FF]/30 rounded focus:outline-none focus:border-[#E0B0FF] text-white placeholder-[#E0B0FF]/30"
              placeholder="Enter product title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[#E0B0FF]">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-[#1a1d4d] border border-[#E0B0FF]/30 rounded focus:outline-none focus:border-[#E0B0FF] text-white placeholder-[#E0B0FF]/30"
              placeholder="Describe your product..."
            />
          </div>

          {/* Price and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#E0B0FF]">Price ($) <span className="text-[#E0B0FF]">*</span></label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2 bg-[#1a1d4d] border border-[#E0B0FF]/30 rounded focus:outline-none focus:border-[#E0B0FF] text-white placeholder-[#E0B0FF]/30"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#E0B0FF]">Quantity <span className="text-[#E0B0FF]">*</span></label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 bg-[#1a1d4d] border border-[#E0B0FF]/30 rounded focus:outline-none focus:border-[#E0B0FF] text-white"
                required
              />
            </div>
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#E0B0FF]">Category <span className="text-[#E0B0FF]">*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#1a1d4d] border border-[#E0B0FF]/30 rounded focus:outline-none focus:border-[#E0B0FF] text-white"
                required
              >
                <option value="">Select...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#E0B0FF]">Condition <span className="text-[#E0B0FF]">*</span></label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#1a1d4d] border border-[#E0B0FF]/30 rounded focus:outline-none focus:border-[#E0B0FF] text-white"
                required
              >
                {conditions.map(cond => (
                  <option key={cond.value} value={cond.value}>{cond.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center p-4 bg-[#1a1d4d] rounded-lg border border-[#E0B0FF]/30">
            <input
              type="checkbox"
              name="is_public"
              checked={formData.is_public}
              onChange={handleChange}
              className="w-5 h-5 text-[#E0B0FF] bg-gray-800 border-gray-600 rounded focus:ring-[#E0B0FF]"
            />
            <label className="ml-3 text-sm text-[#E0B0FF]">Make this product publicly visible</label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#E0B0FF] text-[#000328] px-6 py-3 rounded-lg font-semibold hover:bg-[#E0B0FF]/80 transition-all shadow-lg shadow-[#E0B0FF]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
            
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="px-6 py-3 bg-[#1a1d4d] text-[#E0B0FF] border border-[#E0B0FF]/30 rounded-lg hover:bg-[#252965] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
