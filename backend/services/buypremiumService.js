const { Cashfree, CFEnvironment } = require("cashfree-pg");
const Payment = require("../Models/paymentModel");
require('dotenv').config();

const cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID,
    process.env.CASHFREE_SECRET_KEY
);



const createOrder = async (req, res) => {
    console.log("APP ID:", process.env.CASHFREE_APP_ID);
    console.log(
        "SECRET EXISTS:",
        !!process.env.CASHFREE_SECRET_KEY
    );
    try {
        const orderId = "expense_tracker_" + Date.now();
        const request = {
            order_amount: 1.00,
            order_currency: "INR",
            order_id: orderId,

            customer_details: {
                customer_id: "devstudio_user",
                customer_phone: "9876543210"
            },

            order_meta: {
                return_url:
                    `http://localhost:3000/success/${orderId}`
            }
        };


        const response = await cashfree.PGCreateOrder(request);

        console.log(
            "Order created successfully:",
            response.data
        );

        await Payment.create({
            orderId: orderId,
            amount: request.order_amount,
            currency: request.order_currency,
            customerId: request.customer_details.customer_id,
            customerPhone: request.customer_details.customer_phone,
            paymentSessionId: response.data.payment_session_id,
            status: "PENDING"
        });

        res.status(200).json({
            success: true,
            orderId: request.order_id,
            paymentSessionId: response.data.payment_session_id
        });

    } catch (error) {

        console.error(
            "Error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            success: false,
            message: "Order creation failed"
        });
    }
};



const paymentSuccess = async (req, res) => {
    try {
        const { orderId } = req.params;

        console.log("========== PAYMENT SUCCESS ==========");
        console.log("Order ID:", orderId);

        const response =
            await cashfree.PGOrderFetchPayments(orderId);

        const payments = response.data;

        const payment = await Payment.findOne({
            where: {
                orderId: orderId
            }
        });

        if (!payment) { 
            return res.status(404).json({ success: false, message: "Payment record not found" }); 
        }

        if (payments.length > 0) { 
            await payment.update({ 
                paymentId: payments[0].cf_payment_id, 
                status: payments[0].payment_status }); 
        }

        console.log("Payments:", payments);

        res.json({
            success: true,
            orderId,
            payments
        });

    } catch (error) {
        console.error(
            "Payment verification error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to verify payment"
        });
    }
};


module.exports = {createOrder,paymentSuccess};