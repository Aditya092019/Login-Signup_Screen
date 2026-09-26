const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        dialect:'mysql',
        logging: false
    });

(async ()=>{
    try{
       await sequelize.authenticate();
       console.log("Connection to the database has been created");
    }catch(error){
       console.log(error);
    }
})();


module.exports = sequelize;