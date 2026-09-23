const { v4: uuidv4 }  = require('uuid');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();
const bcrypt = require('bcrypt');

const {Users} = require('../Models/userModel');
const Forgotpassword = require('../Models/forgetPassword');

const forgotpassword = async (req, res) => {
    try {
        const { email } =  req.body;
        const user = await Users.findOne({where : { email }});
        if(user){
            const id = uuidv4();
            await user.createForgotpassword({ id , active: true })
                .catch(err => {
                    throw new Error(err)
                })

            sgMail.setApiKey(process.env.SENGRID_API_KEY)
            console.log(
                "SendGrid key exists:",
                !!process.env.SENDGRID_API_KEY
            );

            const msg = {
                to: email, 
                from: 'aadityasingh2dec@gmail.com', 
                replyTo: 'aadityasingh2dec@gmail.com',
                subject: 'Reset Your Password',
                text: 'Click the link to reset your password.',
                html: `
                    <h2>Password Reset</h2>
                    <p>Click the button below to reset your password.</p>

                    <a href="http://localhost:3000/resetpassword/${id}">
                        Reset Password
                    </a>
                `
            }

            const response = await sgMail.send(msg); 
            console.log( 'SendGrid status:', response[0].statusCode ); 
            console.log( 'Message ID:', response[0].headers['x-message-id'] ); 
            return res.status(202).json({ message: 'Password reset link sent to your email', success: true });
            //send mail
        }else {
            throw new Error('User doesnt exist')
        }
    } catch(err){
        console.error(err)
        return res.json({ message: err, sucess: false });
    }

}



const resetpassword = (req, res) => {
    const id =  req.params.id;
    Forgotpassword.findOne({ where : { id }}).then(forgotpasswordrequest => {
        if(forgotpasswordrequest){
            forgotpasswordrequest.update();
            res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>

                                    <form action="/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`
                                )
            res.end()

        }
    })
}


const updatepassword = async (req, res) => {

    try {

        const { newpassword } = req.query;
        console.log("Update Password:",req.params.resetpasswordid);

        const resetpasswordrequest = await Forgotpassword.findOne({
            where: {
                id: req.params.resetpasswordid,
                active: true
            }
        });
        console.log("12345");

        if (!resetpasswordrequest) {
            return res.status(404).json({
                error: "Password reset request not found",
                success: false
            });
        }
        console.log(resetpasswordrequest.UserId);
        const user = await Users.findOne({
            where: {
                id: resetpasswordrequest.UserId
            }
        });

        if (!user) {
            return res.status(404).json({
                error: "No user Exists",
                success: false
            });
        }
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(newpassword, salt);
        await user.update({
            password: hash
        });

        await resetpasswordrequest.update({
            active: false
        });

        return res.status(201).json({
            message: "Successfully updated the new password"
        });

    } catch (error) {

        console.log(error);

        return res.status(403).json({
            error: error.message,
            success: false
        });
    }
};


module.exports = {
    forgotpassword,
    resetpassword,
    updatepassword
}