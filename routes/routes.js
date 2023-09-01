require("dotenv").config();
let express = require("express"); //to create an Express application
let router = express.Router(); //to create a new router object, This router instance can be used to define routes, handle middleware, and manage routing for specific paths.
let connection = require("../database/dbcon.js"); //to create a connection with the database
let query = require("../database/queries.js"); //to write the queries
let contollers = require("../controllers/logic.js"); 

// For JWT
const bcrypt = require("bcrypt"); //to hash the password
const jwt = require("jsonwebtoken"); //to create a JSON Web Token
// const dotenv = require('dotenv');
// dotenv.config();

router.post("/register", contollers.register);
router.post("/login", contollers.login);
router.get("/showUsers", contollers.authenticateToken, contollers.showUsers);

router.post("/addAuthor", contollers.authenticateToken, contollers.addAuthors);
router.get("/showAuthors", contollers.authenticateToken, contollers.authorDetails);
router.get("/showAuthors/maxBooks", contollers.authenticateToken, contollers.authorDetailsWithMaxBooks);

router.get("/searchBook", contollers.searchBooks);
router.post("/insertBook",contollers.authenticateToken, contollers.insertBook);
router.post("/insertBookAuthor",contollers.authenticateToken, contollers.insertBookAuthor);
router.delete("/delBook",contollers.authenticateToken, contollers.delBook);
router.put("/updateBook",contollers.authenticateToken, contollers.updateBook);

router.post("/borrowBook",contollers.authenticateToken, contollers.borrowBook);
router.post("/checkUserFine",contollers.authenticateToken, contollers.checkFine);
router.get("checkAllUsersFine",contollers.authenticateToken, contollers.checkAllUsersFine);
router.get("/getAllBooks",contollers.authenticateToken, contollers.getAllBooks);

router.get("/getAllAuthorDetails",contollers.authenticateToken, contollers.getBookAuthorDetails);
router.get("/getAuthorDetails",contollers.authenticateToken, contollers.getAuthorDetails);

router.get("/getAllUserDetails", contollers.authenticateToken, contollers.getAllUserDetails);
router.get("/getUserDetails", contollers.authenticateToken, contollers.getUserDetails);


router.post("/returnBook",contollers.authenticateToken, contollers.returnBook);

module.exports = router;