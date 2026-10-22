const API_URL = import.meta.env.VITE_API_URL;

export const request = async (path, method = "GET", body = null) => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  };

  const res = await fetch(`${API_URL}${path}`, config);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Request failed");
  }

  return res.json();
};
