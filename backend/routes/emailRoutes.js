
const express = require("express");
const router = express.Router();

const emailController = require("../controllers/emailController.js");

router.post("/subscribe", emailController.subscribe);

router.post("/contact", emailController.contact);

module.exports = router;
