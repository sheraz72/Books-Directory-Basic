"use strict";

require('dotenv').config();

var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'bookdirectory'
});
connection.connect(function (error) {
  if (error) {
    console.log("There is some error while creating database connection", error);
    process.exit(1);
  }

  console.log("Database connected successfully");
});
module.exports = connection;