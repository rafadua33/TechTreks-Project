import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * ProductDetails Component
 *
 * Route: /products/:id
 *
 * - Loads product from backend (falls back to mock)
 * - Shows product details, seller info
 * - Contact Seller: requires login, prevents contacting yourself, navigates to /chat/:me/:other
 * - View Messages: visible to seller only; opens a simple modal listing messages sent to them with Reply buttons
 */
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Product state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // ---- Seller messages / auth state (top-level hooks) ----
  const [me, setMe] = useState(null);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesList, setMessagesList] = useState([]);
  const [messagesError, setMessagesError] = useState(null);

  // ---- Delete product state ----
  // deleting: boolean flag to show loading state during deletion
  // deleteError: error message if deletion fails
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Fetch current user on mount (keep UI responsive)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("http://localhost:5001/auth/me", { credentials: "include" });
        if (!res.ok) return;
        const raw = await res.json();
        if (cancelled) return;
        setMe(raw?.user ?? raw);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  // --------------------------------------------------------

  // Mock product data (fallback)
  const mockProducts = [
    {
      id: 1,
      name: "Vintage Camera",
      price: 120.0,
      imageUrl: "https://via.placeholder.com/600?text=Camera",
      description:
        "Classic film camera in excellent condition. Perfect for photography enthusiasts and collectors. Comes with original leather case.",
      seller: "John Doe",
      location: "San Francisco, CA",
    },
    {
      id: 2,
      name: "Mountain Bike",
      price: 450.0,
      imageUrl: "https://via.placeholder.com/600?text=Bike",
      description:
        "High-quality mountain bike with 21-speed gear system. Lightly used, well maintained. Great for trails and off-road adventures.",
      seller: "Jane Smith",
      location: "Denver, CO",
    },
    {
      id: 3,
      name: "Gaming Laptop",
      price: 999.99,
      imageUrl: "https://via.placeholder.com/600?text=Laptop",
      description:
        "Powerful gaming laptop with dedicated graphics card, 16GB RAM, and 512GB SSD. Runs all modern games smoothly.",
      seller: "Mike Johnson",
      location: "Austin, TX",
    },
    {
      id: 4,
      name: "Smart Watch",
      price: 199.5,
      imageUrl: "https://via.placeholder.com/600?text=Watch",
      description:
        "Feature-rich smartwatch with heart rate monitor, GPS, and waterproof design. Compatible with iOS and Android.",
      seller: "Sarah Williams",
      location: "Seattle, WA",
    },
    {
      id: 5,
      name: "Desk Lamp",
      price: 35.25,
      imageUrl: "https://via.placeholder.com/600?text=Lamp",
      description:
        "Modern LED desk lamp with adjustable brightness and color temperature. Energy efficient and perfect for home office.",
      seller: "Tom Brown",
      location: "Portland, OR",
    },
    {
      id: 6,
      name: "Noise-Cancelling Headphones",
      price: 250.0,
      imageUrl: "https://via.placeholder.com/600?text=Headphones",
      description:
        "Premium wireless headphones with active noise cancellation. Superior sound quality and comfortable for long wear.",
      seller: "Emily Davis",
      location: "New York, NY",
    },
  ];

  // Fetch product when id changes
  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setNotFound(false);

      try {
        const res = await fetch(`http://localhost:5001/products/${encodeURIComponent(id)}`, {
          credentials: "include",
        });
        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          // Backend returns product directly (not wrapped in { product: ... })
          // Map backend field names to frontend expectations
          const serverProduct = {
            id: data.id,
            name: data.title, // Backend uses 'title', frontend expects 'name'
            price: data.price,
            imageUrl: data.images?.length > 0 ? data.images[0].url : data.thumbnail_url,
            description: data.description,
            seller: data.seller?.username || data.seller, // Handle seller object or string
            location: data.location || "Location not specified",
            condition: data.condition,
            quantity: data.quantity,
            status: data.status,
            created_at: data.created_at,
            ...data // Spread all backend fields in case frontend needs them
          };
          setProduct(serverProduct);
          setNotFound(false);
          setLoading(false);
          return;
        } else if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.debug("Product API fetch failed, falling back to mock:", err);
      }

      // Fallback to mock
      const foundProduct = mockProducts.find((p) => p.id === parseInt(id));
      if (foundProduct) {
        setProduct(foundProduct);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Contact seller handler
  const handleContactSeller = async () => {
    if (!product) return;

    try {
      const res = await fetch("http://localhost:5001/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        const goLogin = window.confirm("You must be logged in to contact sellers. Go to login page?");
        if (goLogin) navigate("/login");
        return;
      }

      const raw = await res.json();
      const meLocal = raw?.user ?? raw;

      if (!meLocal || (!meLocal.username && !meLocal.id)) {
        const goLogin = window.confirm("Your session looks invalid. Please log in to contact sellers. Go to login page?");
        if (goLogin) navigate("/login");
        return;
      }

      const sellerUsername = product?.seller?.username ?? product?.seller;
      const sellerId = product?.seller?.id ?? product?.seller?.user_id ?? null;

      if (!sellerUsername && !sellerId) {
        alert("Seller information is unavailable for this product.");
        return;
      }

      const isSameByUsername = meLocal.username && sellerUsername && meLocal.username === sellerUsername;
      const isSameById = meLocal.id && sellerId && Number(meLocal.id) === Number(sellerId);

      if (isSameByUsername || isSameById) {
        alert("You can't contact yourself.");
        return;
      }

      const meParam = encodeURIComponent(meLocal.username ?? meLocal.id);
      const otherParam = encodeURIComponent(sellerUsername ?? sellerId);

      navigate(`/chat/${meParam}/${otherParam}`);
    } catch (err) {
      console.error("Contact seller failed:", err);
      alert("Unable to contact the seller right now. Please try again later.");
    }
  };

  // View messages (seller-only) - opens modal with messages addressed to seller
  const handleViewMessages = async () => {
    if (!product) return;

    try {
      // Ensure we have current user
      if (!me) {
        const r = await fetch("http://localhost:5001/auth/me", { credentials: "include" });
        if (!r.ok) {
          alert("You must be logged in to view your messages.");
          return;
        }
        const raw = await r.json();
        setMe(raw?.user ?? raw);
      }

      const sellerUsername = product?.seller?.username ?? product?.seller;
      const sellerId = product?.seller?.id ?? product?.seller?.user_id ?? null;

      const isSameByUsername = me?.username && sellerUsername && me.username === sellerUsername;
      const isSameById = me?.id && sellerId && Number(me.id) === Number(sellerId);
      if (!isSameByUsername && !isSameById) {
        alert("Only the seller can view messages sent to them.");
        return;
      }

      setMessagesLoading(true);
      setMessagesError(null);
      setMessagesList([]);

      const target = encodeURIComponent(sellerId ?? sellerUsername ?? "");
      const attemptUrls = [
        `http://localhost:5001/api/messages/inbox?recipient=${target}`,
      ];

      let got = null;
      for (const url of attemptUrls) {
        try {
          const r = await fetch(url, { credentials: "include" });
          if (!r.ok) continue;
          const d = await r.json();
          if (Array.isArray(d)) {
            got = d;
          } else if (Array.isArray(d.messages)) {
            got = d.messages;
          } else if (Array.isArray(d.data)) {
            got = d.data;
          } else {
            const nested = d.messages?.data;
            if (Array.isArray(nested)) got = nested;
          }
          if (got) break;
        } catch (e) {
          // try next url
        }
      }

      if (!got) {
        setMessagesError("No messages found or the messages endpoint is not available.");
        setMessagesLoading(false);
        setMessagesOpen(true);
        return;
      }

      const normalized = got.map((m) => ({
        id: m.id ?? m.message_id ?? m._id ?? null,
        text: m.text ?? m.body ?? m.message ?? "",
        sender_username: m.sender_username ?? m.from_username ?? m.sender ?? null,
        sender_id: m.sender_id ?? m.from_id ?? m.from ?? null,
        timestamp: m.created_at ?? m.timestamp ?? m.ts ?? m.created ?? null,
        raw: m,
      }));

      setMessagesList(normalized);
      setMessagesLoading(false);
      setMessagesOpen(true);
    } catch (err) {
      console.error("View messages failed:", err);
      setMessagesError("Unable to fetch messages right now.");
      setMessagesLoading(false);
      setMessagesOpen(true);
    }
  };

  // Delete product handler - only available to the seller (product owner)
  // Sends DELETE request to backend API endpoint, then redirects to /products on success
  const handleDeleteProduct = async () => {
    // Confirm deletion with user to prevent accidental removal
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      // Send DELETE request to backend endpoint
      // Must include credentials for session-based authentication
      const res = await fetch(`http://localhost:5001/products/${encodeURIComponent(product.id)}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // Handle different error cases:
        // 401 = not authenticated, 403 = not the owner, 404 = product doesn't exist
        throw new Error(errorData.error || `Failed to delete product (${res.status})`);
      }

      // Success: navigate back to products list
      alert("Product deleted successfully!");
      navigate("/products");
    } catch (err) {
      console.error("Delete product failed:", err);
      // Show error message to user
      setDeleteError(err.message || "Failed to delete product. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Backend base for uploaded images
  const BACKEND = "http://localhost:5001";

  // Resolve image src; handle server-relative uploaded paths
  const imageSrc =
    product?.imageUrl ??
    (product?.thumbnail_url
      ? product.thumbnail_url.startsWith("http")
        ? product.thumbnail_url
        : `${BACKEND}${product.thumbnail_url}`
      : product?.images && product.images[0]?.url
      ? product.images[0].url.startsWith("http")
        ? product.images[0].url
        : `${BACKEND}${product.images[0].url}`
      : "https://via.placeholder.com/600?text=No+Image");

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

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-400 mb-6">The product you're looking for doesn't exist.</p>
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

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/products")}
          className="mb-6 text-[#E0B0FF] hover:underline flex items-center gap-2"
        >
          ← Back to Products
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <img src={imageSrc} alt={product?.name} className="w-full h-auto object-cover" />
          </div>

          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold">{product?.name}</h1>

            <div className="text-4xl font-bold text-[#E0B0FF]">${Number(product?.price ?? 0).toFixed(2)}</div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-300 leading-relaxed">{product?.description}</p>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h2 className="text-xl font-semibold mb-2">Seller Information</h2>
              <p className="text-gray-300">
                <span className="font-medium">Name:</span>{" "}
                {product?.seller?.username ?? product?.seller ?? "Unknown"}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Location:</span>{" "}
                {product?.seller?.location ?? product?.location ?? "Unknown"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {/* Contact Seller - always visible for non-sellers */}
              {!me || me?.id !== product?.seller?.id ? (
                <button
                  className="flex-1 py-3 bg-[#E0B0FF] text-gray-900 rounded-lg font-semibold hover:opacity-90 transition"
                  onClick={handleContactSeller}
                >
                  Contact Seller
                </button>
              ) : null}

              {/* View Messages - seller only */}
              {me && (me?.id === product?.seller?.id || me?.username === product?.seller?.username) && (
                <button
                  className="flex-1 py-3 bg-[#4B5563] text-white rounded-lg font-semibold hover:bg-gray-600 transition"
                  onClick={handleViewMessages}
                >
                  View Messages
                </button>
              )}

              {/* Delete Product - seller only; allows seller to remove their listing */}
              {me && (me?.id === product?.seller?.id || me?.username === product?.seller?.username) && (
                <button
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    deleting
                      ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                  onClick={handleDeleteProduct}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Product"}
                </button>
              )}

              {/* Save to Favorites */}
              <button
                className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
                onClick={() => alert("Add to favorites feature coming soon!")}
              >
                Save
              </button>
            </div>

            {/* Show delete error if one occurred */}
            {deleteError && (
              <div className="p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-200">
                <p className="font-semibold">Error</p>
                <p>{deleteError}</p>
              </div>
            )}

            {messagesOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Messages to you</h3>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                        onClick={() => {
                          setMessagesOpen(false);
                          setMessagesList([]);
                          setMessagesError(null);
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {messagesLoading && <p className="text-gray-400">Loading messages...</p>}
                  {messagesError && <p className="text-red-400">{messagesError}</p>}
                  {!messagesLoading && !messagesError && messagesList.length === 0 && (
                    <p className="text-gray-400">No messages yet.</p>
                  )}

                  <ul className="space-y-3 max-h-72 overflow-auto">
                    {messagesList.map((m) => (
                      <li key={m.id ?? Math.random()} className="p-3 bg-gray-900 rounded">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm text-gray-300">
                              From:{" "}
                              <span className="font-medium text-white">
                                {m.sender_username ?? m.sender_id ?? "Unknown"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-400 mt-1">{m.text}</div>
                            {m.timestamp && (
                              <div className="text-xs text-gray-500 mt-2">
                                {isNaN(new Date(m.timestamp).getTime())
                                  ? String(m.timestamp)
                                  : new Date(m.timestamp).toLocaleString()}
                              </div>
                            )}
                          </div>

                          <div className="ml-4 flex flex-col gap-2">
                            <button
                              className="px-3 py-1 bg-[#E0B0FF] text-gray-900 rounded hover:opacity-90"
                              onClick={() => {
                                const meParam = encodeURIComponent(me?.username ?? me?.id ?? "");
                                const otherParam = encodeURIComponent(m.sender_username ?? m.sender_id ?? "");
                                if (!meParam) {
                                  alert("Please log in to reply.");
                                  return;
                                }
                                navigate(`/chat/${meParam}/${otherParam}`);
                              }}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
