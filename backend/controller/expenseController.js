// const jwt = require("jsonwebtoken");
// const JWT_SECRET = "my_super_secret_key_123456789";
const {Expense} = require('../Models/userModel');



const postExpenseController = async (req,res)=>{
    try{
        const {amount,description,category} = req.body;
        if(!amount || !description || !category){
            return res.status(400).json({
            message: "All fields are required"
            })
        }
        await Expense.create({
            amount,
            description,
            category,
            userId:req.user.id
        })
        res.status(201).json({
            message: "Expense created successfully"
        });
    }catch(error){
        console.log(error);
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

const deleteexpense = (req,res) => {
    const expenseid = req.params.expenseid;
    if(expenseid == undefined || expenseid.length === 0){
        return res.status(400).json({success: false})
    }
    Expense.destroy({where: {id:expenseid, userId:req.user.id}}).then((noofrows) => {
        if(noofrows === 0){
            return res.status(404).json({success:false, message: "User doesnot belong to the user"})
        }
        return res.status(200).json({message: "Expense deleted successfully"});
    }).catch(err => {
        console.log(err);
        return res.status(500).json({error: err, success: false})
    })
}



module.exports = {postExpenseController,getExpenseController,deleteexpense};