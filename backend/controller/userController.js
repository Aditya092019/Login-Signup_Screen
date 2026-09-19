const {Users,Expense} = require('../Models/userModel');
const bcrypt = require("bcrypt");

const bodyController = async (req,res)=>{
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        const existingUser = await Users.findOne({
            where: {
                email: email
            }
        });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await Users.create({
            name,
            email,
            password:hashedPassword
        });
        res.status(201).json({
            message: "User registered successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}


const loginController = async (req,res)=>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({
            message: "All fields are required"
            })
        }
        const existingUser = await Users.findOne({
            where: {
                email: email
            }
        });
        if (!existingUser) {
            return res.status(401).json({
                message: "User  not authorized"
            });
        }
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }
        return res.status(200).json({
            message: "Login successful",
            user: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email
            }
        });
    }catch(error){
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

const expenseController = async (req,res)=>{
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
            category
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
        const expenses = await Expense.findAll();
        return res.status(200).json({ message: "Expenses fetched successfully", expenses: expenses });
   }catch(error){
        console.log(error); 
        return res.status(500).json({ message: "Internal server error" });
   }
}

module.exports = {bodyController,loginController,expenseController,getExpenseController};