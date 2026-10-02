const {Expense,Users} = require('../Models/userModel');
const sequelize = require('../utils/db-connection');
const {GoogleGenAI} = require("@google/genai");
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");

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
        let responsefromAI; 
        try {
            responsefromAI = await ai.interactions.create({
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
        } catch (error) {
            await t.rollback();
            if (error.statusCode === 429) {
                return res.status(429).json({
                    message: "AI service rate limit exceeded. Please try again later."
                });
            }
            return res.status(503).json({
                message: "AI service is currently unavailable."
            });
        }
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
        next(error);
    }
}

const getExpenseController = async (req,res) =>{
   try{
    const page = parseInt(req.query.page) || 1;
    const requestedLimit = parseInt(req.query.limit) || 5;
    const allowedLimits = [2, 5, 8];
    const limit = allowedLimits.includes(requestedLimit)
        ? requestedLimit
        : 5;
    const offset = (page - 1) * limit;

    const { count, rows: expenses } = await Expense.findAndCountAll({
        where: {
            userId: req.user.id
        },
        limit: limit,
        offset: offset,
        order: [['id', 'DESC']]
    });

    return res.status(200).json({
        message: "Expenses fetched successfully",
        expenses: expenses,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalExpenses: count
    });
   }catch(error){
        console.log(error); 
        next(error);
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
        next(error);
    }
};



const downloadExpenses = async (req, res, next) => {
    try {
        if (!req.user.isPremium) {
            return res.status(401).json({
                success: false,
                message: "User is not a premium User"
            });
        }
        const expenses = await Expense.findAll({
            where: {
                userId: req.user.id
            },
            order: [["id", "DESC"]]
        });
        const s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        const fileName = `users/${req.user.id}/expenses-${uuidv4()}.json`;;
        const fileData = JSON.stringify(expenses, null, 2);
        console.log(fileData);
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: fileData,
            ContentType: "application/json"
        });
        await s3.send(command);
        const getObjectCommand = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName
        });
        const fileUrl = await getSignedUrl(
            s3,
            getObjectCommand,
            { expiresIn: 300 }
        );        return res.status(200).json({
            success: true,
            message: "Expenses file generated successfully",
            fileUrl: fileUrl
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};


const listDownloadedFiles = async (req, res, next) => {
    try {
        const s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        const prefix = `users/${req.user.id}/`;
        const command = new ListObjectsV2Command({
            Bucket: process.env.AWS_BUCKET_NAME,
            Prefix: prefix
        });
        const result = await s3.send(command);
        const files = await Promise.all(
            (result.Contents || []).map(async (file) => {
                const getObjectCommand = new GetObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: file.Key
                });
                const fileUrl = await getSignedUrl(
                    s3,
                    getObjectCommand,
                    { expiresIn: 300 }
                );
                return {
                    fileName: file.Key,
                    size: file.Size,
                    createdAt: file.LastModified,
                    fileUrl: fileUrl
                };
            })
        );
        res.status(200).json({
            success: true,
            files
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

module.exports = {postExpenseController,getExpenseController,deleteexpense,downloadExpenses,listDownloadedFiles};