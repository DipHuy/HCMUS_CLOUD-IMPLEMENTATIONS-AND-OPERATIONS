const router = require("express").Router();
const UserService = require("../services/user.service");
const { auth } = require("../middleware/auth");

router.get("/", auth(["ADMIN"]), async (req, res) => {
  try {
    const users = await UserService.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", auth(["ADMIN"]), async (req, res) => {
  try {
    const updatedUser = await UserService.update(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", auth(["ADMIN"]), async (req, res) => {
  try {
    const deletedUser = await UserService.delete(req.params.id);
    res.json(deletedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", auth(["USER", "ADMIN"]), async (req, res) => {
  try {
    const user = await UserService.findByUsername(req.user.username);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/me", auth(["USER", "ADMIN"]), async (req, res) => {
  try {
    const updatedUser = await UserService.updateProfile(req.user.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
