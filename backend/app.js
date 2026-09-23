const express = require('express');
const app = express();
const cors = require('cors');
const db = require("./utils/db-connection");
const router = require("./routes/userRouter");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/", router);



db.authenticate()
    .then(() => {
        console.log("Database connected successfully");
        return db.sync();
    })
    .catch((error) => {
        console.log("Database connection failed:", error);
    });

app.listen(3000,()=>{
    console.log("Server started at port 3000");
})