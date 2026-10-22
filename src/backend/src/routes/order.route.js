const router = require("express").Router();
const OrderService = require("../services/order.service");
const { auth } = require("../middleware/auth");

router.post("/", auth(["USER", "ADMIN"]), async (req, res) => {
  try {
    const { cartItems } = req.body;
    const newOrder = await OrderService.createOrder(req.user.id, cartItems);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: "Order failed", error: error.message });
  }
});

router.get("/me", auth(["USER"]), async (req, res) => {
  try {
    const orders = await OrderService.getUserOrders(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/all", auth(["ADMIN"]), async (req, res) => {
  try {
    const orders = await OrderService.getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/status", auth(["ADMIN"]), async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await OrderService.updateStatus(req.params.id, status);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
