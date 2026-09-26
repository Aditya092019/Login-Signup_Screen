const {Users} = require('../Models/userModel');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
        next(error);
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
        const token = generateAccessToken(
            existingUser.id
        );
        return res.status(200).json({
            message: "Login successful",
            jwtToken:token,
            user: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email
            }
        });
    }catch(error){
        next(error);
    }
}

function generateAccessToken(id){
    return jwt.sign({userId:id},process.env.JWT_SECRET);
}



module.exports = {bodyController,loginController};