const User = require('../Models/userModel');

const bodyController = async (req,res)=>{
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        const existingUser = await User.findOne({
            where: {
                email: email
            }
        });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }
        await User.create({
            name,
            email,
            password
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
        const existingUser = await User.findOne({
            where: {
                email: email
            }
        });
        if (!existingUser) {
            return res.status(401).json({
                message: "User  not authorized"
            });
        }
        if (existingUser.password !== password) {
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

module.exports = {bodyController,loginController};