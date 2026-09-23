const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-connection");

const Payment = sequelize.define("Payment", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    orderId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "INR"
    },

    customerId: {
        type: DataTypes.STRING,
        allowNull: false
    },

    customerPhone: {
        type: DataTypes.STRING,
        allowNull: false
    },

    paymentSessionId: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    paymentId: {
        type: DataTypes.STRING,
        allowNull: true
    },

    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "PENDING"
    }

});

module.exports = Payment;

