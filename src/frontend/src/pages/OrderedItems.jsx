import { useEffect, useState } from "react";
import { request } from "../api";

export default function OrderedItems() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    request("/orders/me").then(setOrders);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Ordered Items (COD)</h2>
      {orders.map((order) => (
        <div
          key={order.id}
          style={{ borderBottom: "1px solid #ccc", padding: "10px" }}
        >
          <h4>
            Order #{order.id} - Total: ${order.totalPrice}
          </h4>
          <p>
            Status: <span style={{ color: "orange" }}>{order.status}</span>
          </p>
          <ul>
            {order.items.map((item) => (
              <li key={item.id}>
                {item.product.name} x {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
