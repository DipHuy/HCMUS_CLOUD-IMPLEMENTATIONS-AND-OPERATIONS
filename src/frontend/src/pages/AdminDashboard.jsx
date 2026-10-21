import { useEffect, useState } from "react";
import { request } from "../api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [pForm, setPForm] = useState({
    id: null,
    name: "",
    price: 0,
    stock: 0,
    imageUrl: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    if (activeTab === "products") {
      const res = await request("/products", "GET");
      setProducts(res);
    } else {
      const res = await request("/users", "GET", null, headers);
      setUsers(res);
    }
  };

  // --- PRODUCT CRUD ---
  const saveProduct = async (e) => {
    e.preventDefault();
    const method = pForm.id ? "PUT" : "POST";
    const url = pForm.id ? `/products/${pForm.id}` : "/products";

    await request(url, method, pForm, {
      Authorization: `Bearer ${token}`,
    });
    setPForm({ id: null, name: "", price: 0, stock: 0, imageUrl: "" });
    fetchData();
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Xóa sản phẩm này?")) {
      await request(`/products/${id}`, "DELETE", null, {
        Authorization: `Bearer ${token}`,
      });
      fetchData();
    }
  };

  // --- USER CRUD ---
  const handleUpdateUser = async (id, data) => {
    try {
      await request(`/users/${id}`, "PATCH", data, {
        Authorization: `Bearer ${token}`,
      });
      fetchData();
    } catch (error) {
      alert("Update failed!");
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Xóa user này?")) {
      await request(`/users/${id}`, "DELETE", null, {
        Authorization: `Bearer ${token}`,
      });
      fetchData();
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      {/* TABS */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("products")}
          style={{
            padding: "10px 20px",
            background: activeTab === "products" ? "#007bff" : "#ccc",
            color: "white",
          }}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            padding: "10px 20px",
            background: activeTab === "users" ? "#007bff" : "#ccc",
            color: "white",
            marginLeft: "10px",
          }}
        >
          Users
        </button>
      </div>

      {activeTab === "products" ? (
        <section>
          <h3>{pForm.id ? "Edit Product" : "Add New Product"}</h3>
          <form
            onSubmit={saveProduct}
            style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
          >
            <input
              type="text"
              placeholder="Name"
              value={pForm.name}
              onChange={(e) => setPForm({ ...pForm, name: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={pForm.price}
              onChange={(e) =>
                setPForm({ ...pForm, price: parseFloat(e.target.value) || 0 })
              }
              required
            />
            <input
              type="number"
              placeholder="Stock"
              value={pForm.stock}
              onChange={(e) => setPForm({ ...pForm, stock: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Image URL"
              value={pForm.imageUrl}
              onChange={(e) => setPForm({ ...pForm, imageUrl: e.target.value })}
            />
            <button
              type="submit"
              style={{ background: "green", color: "white" }}
            >
              {pForm.id ? "Update" : "Create"}
            </button>
            {pForm.id && (
              <button
                onClick={() =>
                  setPForm({
                    id: null,
                    name: "",
                    price: 0,
                    stock: 0,
                    imageUrl: "",
                  })
                }
              >
                Cancel
              </button>
            )}
          </form>

          <table border="1" width="100%" cellPadding="10">
            <thead>
              <tr style={{ background: "#eee" }}>
                <th>ID</th>
                <th>ImageUrl</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    <img src={p.imageUrl} width="50" alt="" />
                  </td>
                  <td>{p.name}</td>
                  <td>${p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button
                      onClick={() => setPForm(p)}
                      style={{ marginRight: "5px" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      style={{ color: "red" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section>
          <h3>User Management</h3>
          <table border="1" width="100%" cellPadding="10">
            <thead>
              <tr style={{ background: "#eee" }}>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) =>
                        handleUpdateUser(u.id, { role: e.target.value })
                      }
                      style={{
                        padding: "5px",
                        borderRadius: "4px",
                        border:
                          u.role === "ADMIN"
                            ? "2px solid gold"
                            : "1px solid #ccc",
                        fontWeight: u.role === "ADMIN" ? "bold" : "normal",
                      }}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteUser(u.id)}
                      style={{ color: "red" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
