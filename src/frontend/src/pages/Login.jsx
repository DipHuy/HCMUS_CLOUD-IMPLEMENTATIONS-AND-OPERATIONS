import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../api";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = await request("/auth/login", "POST", form);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);
      navigate("/");
      alert("Login successful!");
    } else {
      alert("Invalid Information!");
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
      }}
    >
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#28a745",
            color: "white",
          }}
        >
          Login
        </button>
      </form>
      <p style={{ marginTop: "15px", fontSize: "0.8rem" }}>
        Don't have an account?
        <button
          onClick={() => navigate("/register")}
          style={{
            color: "blue",
            border: "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          Register here
        </button>
      </p>
    </div>
  );
}
