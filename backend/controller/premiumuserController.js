const {Expense,Users} = require('../Models/userModel');

const getpremiumExpenseAmount = async (req, res) => {
    try {
        if (!req.user.isPremium) {
            return res.status(403).json({
                success: false,
                message: 'Premium membership required'
            });
        }
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
        next(error);
    }
};

module.exports = {getpremiumExpenseAmount};