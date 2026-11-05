const router = require("express").Router();
const ProductService = require("../services/product.service");
const { auth } = require("../middleware/auth");
const multer = require("multer");
const storageProvider = require("../services/storage/storage.service");

const cacheService = require("../services/cache.service");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// get all products
router.get("/", async (req, res) => {
  try {
    const CACHE_KEY = "products:all";
    const cachedProducts = await cacheService.get(CACHE_KEY);
    if (cachedProducts) {
      console.log("Serving products from cache");
      return res.json(cachedProducts);
    }

    console.log("Serving products from database");
    const products = await ProductService.getAll();
    await cacheService.set(CACHE_KEY, products, 3600);
    res.json(products);
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
    const { name, price, stock, description } = req.body;
    let imageUrl = "";

    if (req.file) {
      imageUrl = await storageProvider.uploadFile(req.file);
    }

    const newProduct = {
      name: name,
      price: parseFloat(price),
      stock: parseInt(stock),
      description: description || "No description",
      image: imageUrl,
    };
    await cacheService.del("products:all");
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
      const { name, price, stock, description } = req.body;
      let imageUrl = req.body.image;

      if (req.file) {
        imageUrl = await storageProvider.uploadFile(req.file);
      }

      const updatedProduct = {
        name: name,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        description: description || "No description",
        image: imageUrl,
      };
      await cacheService.del("products:all");
      res.json(await ProductService.update(req.params.id, updatedProduct));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.delete("/:id", auth(["ADMIN"]), async (req, res) => {
  try {
    await cacheService.del("products:all");
    res.json(await ProductService.delete(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
