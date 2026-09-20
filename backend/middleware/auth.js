const jwt = require('jsonwebtoken');
const {Users} = require('../Models/userModel');


const authenticate = (req,res,next)=>{
    try{
        const authHeader = req.header('Authorization')
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Token not provided"
            });
        }
        const token = authHeader.split(" ")[1];;
        console.log(token);
        const user = jwt.verify(token,'secretkey');
        console.log('userID >>>>', user.userId)
        Users.findByPk(user.userId).then(userData=>{
            req.user = userData;
            next();
        }).catch(err => {throw new Error(err)})
    }catch(error){
        console.log(error);
        return res.status(401).json({success: false})
    }
}

module.exports = {authenticate};