// const jwt = require("jsonwebtoken");
// const JWT_SECRET = "my_super_secret_key_123456789";
const {Expense,Users} = require('../Models/userModel');
const sequelize = require('../utils/db-connection');
const {GoogleGenAI} = require("@google/genai");
const configDotenv = require("dotenv");
configDotenv.config();

const postExpenseController = async (req,res)=>{
    let t;
    try{
        t = await sequelize.transaction();
        const {amount,description} = req.body;
        if(!amount || !description){
            await t.rollback();
            return res.status(400).json({
            message: "All fields are required"
            })
        }
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
        const responsefromAI = await ai.interactions.create({
            model: "gemini-3.8-flash",
            input: `
                Classify this expense into exactly one category:
        
                food
                electricity
                movie
                fuel
        
                Return only the category.
        
                Expense:
                ${description}
            `
        });
        const category = responsefromAI.output_text.trim().toLowerCase();
        console.log("Gemini category:", category); 
        const allowedCategories = [ "food", "electricity", "movie", "fuel" ]; 
        if (!allowedCategories.includes(category)) { 
            await t.rollback(); 
           return res.status(400).json({ message: "Unable to determine expense category" }); 
        }
        await Expense.create({
            amount,
            description,
            category,
            userId:req.user.id
        },{transaction:t})
        await Users.increment( 'totalExpenses', { by: Number(amount), where: { id: req.user.id },transaction: t } );
        await t.commit()
        res.status(201).json({
            message: "Expense created successfully"
        });
    }catch(error){
        console.log(error);
        if (t) {
            await t.rollback();
        }
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

const getExpenseController = async (req,res) =>{
   try{
        console.log(req.user.id);
        const expenses = await Expense.findAll({where: {userId:req.user.id}});
        return res.status(200).json({ message: "Expenses fetched successfully", expenses: expenses });
   }catch(error){
        console.log(error); 
        return res.status(500).json({ message: "Internal server error" });
   }
}


const deleteexpense = async (req, res) => {

    const t = await sequelize.transaction();
    try {
        const expenseid = req.params.expenseid;
        if (expenseid == undefined || expenseid.length === 0) {
            await t.rollback();
            return res.status(400).json({
                success: false
            });
        }
        const expense = await Expense.findOne({
            where: {
                id: expenseid,
                userId: req.user.id
            },
            transaction: t
        });
        if (!expense) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "User doesnot belong to the user"
            });
        }
        const amount = expense.amount;
        const noofrows = await Expense.destroy({
            where: {
                id: expenseid,
                userId: req.user.id
            },
            transaction: t
        });
        if (noofrows === 0) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "User doesnot belong to the user"
            });
        }
        await Users.decrement('totalExpenses', {
            by: Number(amount),
            where: {
                id: req.user.id
            },
            transaction: t
        });
        await t.commit();
        return res.status(200).json({
            message: "Expense deleted successfully"
        });
    } catch (err) {
        console.log(err);
        await t.rollback();
        return res.status(500).json({
            error: err,
            success: false
        });
    }
};



module.exports = {postExpenseController,getExpenseController,deleteexpense};