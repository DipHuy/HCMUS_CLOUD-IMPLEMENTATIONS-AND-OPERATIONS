import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../api";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = await request("/auth/register", "POST", form);

    if (data.message === "Registered successfully") {
      alert("Registration successful! Please login.");
      navigate("/login");
    } else {
      alert("Registration failed!");
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
      <h2>Register</h2>
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
          Register
        </button>
      </form>
      <p style={{ marginTop: "15px", fontSize: "0.8rem" }}>
        Already have an account?
        <button
          onClick={() => navigate("/login")}
          style={{
            color: "blue",
            border: "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          Login here
        </button>
      </p>
    </div>
  );
}
