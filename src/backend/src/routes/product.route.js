const router = require("express").Router();
const ProductService = require("../services/product.service");
const { auth } = require("../middleware/auth");
const multer = require("multer");
const storageProvider = require("../services/storage/storage.service");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

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
router.post("/", upload.single("image"), auth(["ADMIN"]), async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    let imageUrl = "";

    if (req.file) {
      imageUrl = await storageProvider.uploadFile(req.file);
    }

    const newProduct = {
      name,
      description: description || "No description",
      price: parseFloat(price),
      stock: parseInt(stock),
      image: imageUrl,
    };
    res.json(await ProductService.create(newProduct));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put(
  "/:id",
  upload.single("image"),
  auth(["ADMIN"]),
  async (req, res) => {
    try {
      const { name, description, price, stock } = req.body;
      let imageUrl = req.body.imageUrl;

      if (req.file) {
        imageUrl = await storageProvider.uploadFile(req.file);
      }

      const updatedProduct = {
        name,
        description: description || "No description",
        price: parseFloat(price),
        stock: parseInt(stock),
        image: imageUrl,
      };
      res.json(await ProductService.update(req.params.id, updatedProduct));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.delete("/:id", auth(["ADMIN"]), async (req, res) => {
  try {
    res.json(await ProductService.delete(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
