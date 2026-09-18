const express = require('express');
const router = express.Router();
const userRoutes = require("../controller/userController");


router.post("/users/signup", userRoutes.bodyController);


module.exports = router;