const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.route");
const productRoutes = require("./routes/product.route");
const orderRoutes = require("./routes/order.route");
const userRoutes = require("./routes/user.route");

const app = express();

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/users", userRoutes);
app.get("/health", (req, res) => res.status(200).json({ message: "OK" }));

const BACKEND_PORT = process.env.BACKEND_PORT;
app.listen(BACKEND_PORT, () =>
  console.log(`Backend running on port ${BACKEND_PORT}`),
);
