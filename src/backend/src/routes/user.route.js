const router = require("express").Router();
const UserService = require("../services/user.service");
const { auth } = require("../middleware/auth");

// get current user profile
router.get("/me", auth(["USER", "ADMIN"]), async (req, res) => {
  try {
    const user = await UserService.findByUsername(req.user.username);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// update current user profile
router.patch("/me", auth(["USER", "ADMIN"]), async (req, res) => {
  try {
    console.log(
      "Updating profile for user:",
      req.user.id,
      "with data:",
      req.body,
    );
    const updatedUser = await UserService.updateProfile(req.user.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get all users
router.get("/", auth(["ADMIN"]), async (req, res) => {
  try {
    const users = await UserService.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// update user by id
router.patch("/:id", auth(["ADMIN"]), async (req, res) => {
  try {
    const updatedUser = await UserService.update(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete user
router.delete("/:id", auth(["ADMIN"]), async (req, res) => {
  try {
    const deletedUser = await UserService.delete(req.params.id);
    res.json(deletedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
