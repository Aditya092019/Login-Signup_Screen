const express = require('express');
const router = express.Router();
const userRoutes = require("../controller/userController");


router.post("/users/signup", userRoutes.bodyController);
router.post("/users/login", userRoutes.loginController);

module.exports = router;