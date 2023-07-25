require("dotenv").config();
let express = require("express"); //to create an Express application
let router = express.Router(); //to create a new router object
let connection = require("../database/dbcon.js"); //to create a connection with the database
let query = require("../database/queries.js"); //to write the queries
let contollers = require("../controllers/logic.js"); 

// For JWT
const bcrypt = require("bcrypt"); //to hash the password
const jwt = require("jsonwebtoken"); //to create a JSON Web Token
// const dotenv = require('dotenv');
// dotenv.config();

router.get("/searchBook", contollers.searchBooks);
router.post("/register", contollers.register);
router.post("/login", contollers.login);
router.post("/insertBook",contollers.authenticateToken, contollers.insertBook);
router.delete("/delBook",contollers.authenticateToken, contollers.delBook);
router.put("/updateBook",contollers.authenticateToken, contollers.updateBook);
module.exports = router;