const express = require('express');
const router = express.Router();
const userRoutes = require("../controller/userController");
const userauthenticate = require("../middleware/auth");
const expenseController = require("../controller/expenseController");

router.post("/users/signup", userRoutes.bodyController);
router.post("/users/login", userRoutes.loginController);
router.post("/users/expense",userauthenticate.authenticate, expenseController.postExpenseController);
router.get("/users/expense",userauthenticate.authenticate, expenseController.getExpenseController);
router.delete("/users/expense/:expenseid", expenseController.deleteexpense);

module.exports = router;