import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const itemStyle = {
    color: "white",
    textDecoration: "none",
    fontSize: "1.1rem",
    padding: "10px 15px",
    borderRadius: "6px",
    transition: "0.3s",
    display: "flex",
    alignItems: "center",
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.5rem 2rem",
        background: "#1a1a1a",
        color: "#fff",
        width: "100vw",
        minHeight: "70px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          ...itemStyle,
          fontWeight: "800",
          fontSize: "1.5rem",
          color: "#00d4ff",
        }}
      >
        E-CHIP STORE
      </Link>

      {/* Right Menu */}
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <Link to="/" style={itemStyle}>
          Home
        </Link>

        {token ? (
          <>
            {role === "ADMIN" && (
              <Link
                to="/admin"
                style={{ ...itemStyle, color: "gold", fontWeight: "bold" }}
              >
                Admin Dashboard
              </Link>
            )}

            <Link to="/orders" style={itemStyle}>
              My Orders
            </Link>
            <Link to="/profile" style={itemStyle}>
              Profile
            </Link>

            <button
              onClick={logout}
              style={{
                ...itemStyle,
                background: "#ff4d4d",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                marginLeft: "10px",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={itemStyle}>
              Login
            </Link>
            <Link
              to="/register"
              style={{ ...itemStyle, background: "#007bff" }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
