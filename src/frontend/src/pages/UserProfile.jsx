import { useEffect, useState } from "react";
import { request } from "../api";

export default function UserProfile() {
  const [user, setUser] = useState({
    username: "",
    role: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await request("/users/me", "GET", null);
        if (res) {
          setUser(res);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await request("/users/me", "PATCH", {
        username: user.username,
        address: user.address,
      });

      if (res && (res.ok || res.id)) {
        const data = await res.json();
        setMessage("Update successful!");

        localStorage.setItem("username", data.user.username);
      } else {
        setMessage("Update failed. Please try again.");
      }
    } catch (error) {
      setMessage("Error connecting to server.");
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <h2>My Profile</h2>

      <form onSubmit={handleUpdate}>
        <div style={{ marginBottom: "15px" }}>
          <label>Username:</label>
          <input
            type="text"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Role:</label>
          <span
            style={{
              display: "inline-block",
              marginTop: "5px",
              padding: "5px 12px",
              background: "#f0f0f0",
              borderRadius: "15px",
              fontSize: "0.9rem",
              color: "#555",
              fontWeight: "bold",
            }}
          >
            {user.role}
          </span>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Address:</label>
          <textarea
            value={user.address}
            onChange={(e) => setUser({ ...user, address: e.target.value })}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              height: "80px",
            }}
            placeholder="Enter your address"
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Update Information
        </button>
      </form>
    </div>
  );
}
