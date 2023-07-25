"use strict";

require("dotenv").config();

var express = require("express"); //to create an Express application


var router = express.Router(); //to create a new router object

var connection = require("../database/dbcon.js"); //to create a connection with the database


var query = require("../database/queries.js"); //to write the queries


var contollers = require("../controllers/logic.js"); // For JWT


var bcrypt = require("bcrypt"); //to hash the password


var jwt = require("jsonwebtoken"); //to create a JSON Web Token
// const dotenv = require('dotenv');
// dotenv.config();


router.get("/searchBook", contollers.searchBooks);
module.exports = router;