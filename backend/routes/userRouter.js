const express = require('express');
const router = express.Router();
const userRoutes = require("../controller/userController");
const userauthenticate = require("../middleware/auth");
const expenseController = require("../controller/expenseController");
const premiumController = require("../controller/premiumuserController");
const resetpasswordController = require("../controller/forgotpasswordController");
const paymentservice = require("../services/buypremiumService");

router.post("/users/signup", userRoutes.bodyController);
router.post("/users/login", userRoutes.loginController);

router.post("/users/expense",userauthenticate.authenticate, expenseController.postExpenseController);
router.get("/users/expense",userauthenticate.authenticate, expenseController.getExpenseController);
router.delete("/users/expense/:expenseid",userauthenticate.authenticate, expenseController.deleteexpense);
router.get("/users/premium/showleaderboard",premiumController.getpremiumExpenseAmount);

router.get('/updatepassword/:resetpasswordid', resetpasswordController.updatepassword);
router.get('/resetpassword/:id', resetpasswordController.resetpassword);
router.post('/forgotpassword', resetpasswordController.forgotpassword);

router.post("/create-order", paymentservice.createOrder);
router.get("/success/:orderId", paymentservice.paymentSuccess)


module.exports = router;