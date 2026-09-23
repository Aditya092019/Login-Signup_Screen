const Sequelize = require('sequelize');
const sequelize = require('../utils/db-connection');
const {Users} = require('./userModel');

const Forgotpassword = sequelize.define('forgotpassword', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
    },
    active: Sequelize.BOOLEAN,
    expiresby: Sequelize.DATE
})

Users.hasMany(Forgotpassword);
Forgotpassword.belongsTo(Users);


module.exports = Forgotpassword;