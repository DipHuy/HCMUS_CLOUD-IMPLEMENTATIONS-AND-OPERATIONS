import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Item style
  const itemStyle = {
    color: "white",
    textDecoration: "none",
    fontSize: "1.1rem",
    padding: "8px 15px",
    borderRadius: "6px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    position: "relative",
  };

  return (
    <>
      {/* Embedded CSS  */}
      <style>{`
        .nav-link:hover {
          color: #00d4ff !important;
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 50%;
          background-color: #00d4ff;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        .nav-link:hover::after {
          width: 60%;
        }
        .btn-logout:hover {
          background: #cc0000 !important;
          box-shadow: 0 4px 12px rgba(255, 77, 77, 0.4);
        }
        
      `}</style>

      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.5rem 2rem",
          background: "#1a1a1a",
          color: "#fff",
          width: "100%",
          boxSizing: "border-box",
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
          E-COM
        </Link>

        {/* Right Menu */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link to="/" className="nav-link" style={itemStyle}>
            Home
          </Link>

          {token ? (
            <>
              {role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="nav-link"
                  style={{ ...itemStyle, color: "gold", fontWeight: "bold" }}
                >
                  Admin
                </Link>
              )}

              <Link to="/orders" className="nav-link" style={itemStyle}>
                Orders
              </Link>
              <Link to="/profile" className="nav-link" style={itemStyle}>
                Profile
              </Link>

              <button
                onClick={logout}
                className="btn-logout"
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
              <Link to="/login" className="nav-link" style={itemStyle}>
                Login
              </Link>
              <Link to="/register" className="nav-link" style={itemStyle}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
