"use strict";

require("dotenv").config();

var express = require("express"); //to create an Express application


var router = express.Router(); //to create a new router object, This router instance can be used to define routes, handle middleware, and manage routing for specific paths.

var connection = require("../database/dbcon.js"); //to create a connection with the database


var query = require("../database/queries.js"); //to write the queries


var contollers = require("../controllers/logic.js"); // For JWT


var bcrypt = require("bcrypt"); //to hash the password


var jwt = require("jsonwebtoken"); //to create a JSON Web Token
// const dotenv = require('dotenv');
// dotenv.config();


router.post("/register", contollers.register);
router.post("/login", contollers.login);
router.get("/showUsers", contollers.authenticateToken, contollers.showUsers);
router.post("/addAuthor", contollers.authenticateToken, contollers.addAuthors);
router.get("/showAuthors", contollers.authenticateToken, contollers.authorDetails);
router.get("/showAuthors/maxBooks", contollers.authenticateToken, contollers.authorDetailsWithMaxBooks);
router.get("/searchBook", contollers.searchBooks);
router.post("/insertBook", contollers.authenticateToken, contollers.insertBook);
router.post("/insertBookAuthor", contollers.authenticateToken, contollers.insertBookAuthor);
router["delete"]("/delBook", contollers.authenticateToken, contollers.delBook);
router.put("/updateBook", contollers.authenticateToken, contollers.updateBook);
router.post("/borrowBook", contollers.authenticateToken, contollers.borrowBook);
router.post("/checkUserFine", contollers.authenticateToken, contollers.checkFine);
router.get("checkAllUsersFine", contollers.authenticateToken, contollers.checkAllUsersFine);
router.get("/getAllBooks", contollers.authenticateToken, contollers.getAllBooks);
router.get("/getAllAuthorDetails", contollers.authenticateToken, contollers.getBookAuthorDetails);
router.get("/getAuthorDetails", contollers.authenticateToken, contollers.getAuthorDetails);
router.get("/getAllUserDetails", contollers.authenticateToken, contollers.getAllUserDetails);
router.get("/getUserDetails", contollers.authenticateToken, contollers.getUserDetails);
router.post("/returnBook", contollers.authenticateToken, contollers.returnBook);
module.exports = router;