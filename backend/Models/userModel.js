const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-connection");

const Users = sequelize.define("User", {

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    totalExpenses:{
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isPremium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
});

const Expense = sequelize.define("Expense", {
    id:{
       type:DataTypes.INTEGER,
       primaryKey:true,
       autoIncrement:true,
       allowNull:false
    },
    amount: {
        type: DataTypes.DECIMAL(10,2),
        allowNull:false
    },
    description:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    category:{
        type:DataTypes.STRING,
        allowNull:false
    },
    userId: {
        type: DataTypes.INTEGER,
    }
})

Users.hasMany(Expense,{
    foreignKey: "userId"
});
Expense.belongsTo(Users,{
    foreignKey: "userId"
});

module.exports = {Users,Expense};