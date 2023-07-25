require('dotenv').config();
let mysql = require('mysql');

const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'password',
    database : 'bookdirectory'
});

connection.connect(error =>{
    if(error){
        console.log("There is some error while creating database connection", error);
        process.exit(1);
    }
    console.log("Database connected successfully")
})

module.exports = connection;
