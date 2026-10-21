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

  return (
    <nav
      style={{
        display: "flex",
        gap: "20px",
        padding: "1rem",
        background: "#222",
        color: "#fff",
      }}
    >
      <Link to="/" style={{ color: "white", fontWeight: "bold" }}>
        E-CHIP STORE
      </Link>

      {/* Represent base on role */}
      {token ? (
        <>
          {role === "ADMIN" && (
            <Link to="/admin" style={{ color: "gold" }}>
              Admin Dashboard
            </Link>
          )}

          <Link to="/orders" style={{ color: "white" }}>
            My Orders
          </Link>

          <Link to="/profile" style={{ color: "white" }}>
            Profile
          </Link>
          <button
            onClick={logout}
            style={{
              background: "red",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ color: "white" }}>
            Login
          </Link>
          <Link to="/register" style={{ color: "white" }}>
            Register
          </Link>
        </>
      )}
    </nav>
  );
}
