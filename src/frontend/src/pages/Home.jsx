import { useEffect, useState } from "react";
import { request } from "../api";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        const allProducts = await request("/products", "GET");
        if (cancelled) return;

        setProducts(allProducts);

        const initialQuantities = {};
        allProducts.forEach((product) => {
          initialQuantities[product.id] = 1;
        });
        setQuantities(initialQuantities);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleQuantityChange = (productId, value) => {
    setQuantities({
      ...quantities,
      [productId]: parseInt(value) < 1 ? 1 : parseInt(value),
    });
  };

  const handleBuy = async (product) => {
    if (!token) return alert("Please login to buy!");

    const res = await request("/orders", "POST", {
      cartItems: [
        {
          productId: product.id,
          quantity: quantities[product.id],
          price: product.price,
        },
      ],
    });
    alert(`Added ${quantities[product.id]} ${product.name} to cart!`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        ECom - Electronic Components
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "25px",
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #eee",
              padding: "15px",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
              backgroundColor: "#fff",
            }}
          >
            {/* Product Image */}
            <img
              src={p.image || "https://via.placeholder.com/150"}
              alt={p.name}
              style={{
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />

            {/* Product Info */}
            <h3 style={{ fontSize: "1.1rem", margin: "15px 0 5px 0" }}>
              {p.name}
            </h3>
            <p style={{ color: "#666", fontSize: "0.9rem", flexGrow: 1 }}>
              {p.description?.substring(0, 50)}
            </p>
            <p
              style={{
                color: "#e44d26",
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}
            >
              ${p.price}
            </p>

            {/* Action Buttons */}
            <div style={{ marginTop: "auto", paddingTop: "15px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <label style={{ fontSize: "0.8rem" }}>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  value={quantities[p.id] || 1}
                  onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                  style={{
                    width: "60px",
                    padding: "5px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>

              <button
                onClick={() => handleBuy(p)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
