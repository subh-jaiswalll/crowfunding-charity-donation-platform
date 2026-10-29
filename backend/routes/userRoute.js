const express = require("express");

const router = express.Router();

const UserController = require("../controllers/userController.js");

const auth = require("../middlewares/authMiddleware.js");

router.post("/login", UserController.loginUser);

router.post("/signup", UserController.registerUser);

router.get("/profile", auth, UserController.getUsers);

router.get("/profile/:id", auth, UserController.getUserById);

router.put("/profile/:id", auth, UserController.updateUser);

module.exports = router;
