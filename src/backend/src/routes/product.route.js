const router = require("express").Router();
const ProductService = require("../services/product.service");
const { auth } = require("../middleware/auth");

// get all products
router.get("/", async (req, res) => {
  try {
    res.json(await ProductService.getAll());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get product by id
router.get("/:id", async (req, res) => {
  try {
    const product = await ProductService.getById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// create, update, delete products (admin only)
router.post("/", auth(["ADMIN"]), async (req, res) => {
  try {
    const newProduct = {
      ...req.body,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
    };
    res.json(await ProductService.create(newProduct));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", auth(["ADMIN"]), async (req, res) => {
  try {
    const updatedProduct = {
      ...req.body,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
    };
    res.json(await ProductService.update(req.params.id, updatedProduct));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", auth(["ADMIN"]), async (req, res) => {
  try {
    res.json(await ProductService.delete(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
