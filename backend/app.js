require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const db = require("./utils/db-connection");
const logger = require("./utils/logger");
const router = require("./routes/userRouter");
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/", router);

app.use((err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl
    });

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
});


db.authenticate()
    .then(() => {
        console.log("Database connected successfully");
        return db.sync();
    })
    .catch((error) => {
        console.log("Database connection failed:", error);
    });

app.listen(PORT,()=>{
    console.log(`Server started at port ${PORT}`);
})