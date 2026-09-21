const {Expense,Users} = require('../Models/userModel');
const sequelize = require('../utils/db-connection');

const getpremiumExpenseAmount = async (req, res) => {
    try {
        const report = await Expense.findAll({
            attributes: [
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.col('amount')
                    ),
                    'Amount'
                ]
            ],
            include: [
                {
                    model: Users,
                    attributes: ['name']
                }
            ],
            group: ['userId', 'User.id', 'User.name'],
            order: [
                [
                    sequelize.literal('Amount'),
                    'DESC'
                ]
            ],
            raw: true
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