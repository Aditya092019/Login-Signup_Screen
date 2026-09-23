const {Expense,Users} = require('../Models/userModel');
const sequelize = require('../utils/db-connection');

const getpremiumExpenseAmount = async (req, res) => {
    try {
        const report = await Users.findAll({
            attributes: ['name', 'totalExpenses'],
            order: [      
              ['totalExpenses','DESC' ]
            ],
          });
        console.log(report);
        return res.status(200).json(report);
    } catch (error) {
        console.error(
            'Error fetching grouped expenses:',
            error
        );
        return res.status(500).json({
            message: 'Unable to fetch expense report'
        });
    }
};

module.exports = {getpremiumExpenseAmount};