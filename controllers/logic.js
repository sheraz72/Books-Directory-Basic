require("dotenv").config();
let express = require("express"); //to create an Express application
let router = express.Router(); //to create a new router object
let connection = require("../database/dbcon.js"); //to create a connection with the database
let query = require("../database/queries.js"); //to write the queries

// For JWT
const bcrypt = require("bcrypt"); //to hash the password
const jwt = require("jsonwebtoken"); //to create a JSON Web Token
// const dotenv = require('dotenv');
// dotenv.config();

 async function searchBooks (req, res) {
    const { BNAME, AUTHORS, GENRE } = req.body;
    if (!BNAME && !AUTHORS && !GENRE) {
      return res.status(400).json({ message: "Please enter at least one field" });
    }
  
    const promise = new Promise((resolve, reject) => {
    connection.query(query.getBooksQuery,[BNAME, AUTHORS, GENRE],(error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
  
  try {
  const result = await promise;
      return res.json(result);
       } catch (error) {
      console.error("Error while searching the book", error);
      return res.status(500).json({ message: "Error while searching the book" });
    }
}





async function register (req, res) {
    const { U_NAME, EMAIL, ROLE, PASSWORD } = req.body; //recieve the data from the request body
    if (U_NAME == null || EMAIL == null || ROLE == null || PASSWORD == null) {
      return res.status(400).json({ message: "Please enter all the fields" }); //400: Bad request, server can't understand
    }
    if(ROLE !== "admin" && ROLE !== "user"){
      return res.status(400).json({ message: "Role should be Admin or User" });
    }
    if(PASSWORD.length < 4){
      return res.status(400).json({ message: "Password should be at least 4 characters long" });
    }
    if(!EMAIL || !EMAIL.includes("@") || !EMAIL.includes(".")){
      return res.status(400).json({ message: "Please enter a valid email" });
    }
    const hashedPassword = await bcrypt.hashSync(PASSWORD, 10); //hash the password, 10 is the saltRounds
  
    const values = [U_NAME, EMAIL, ROLE, hashedPassword]; //values to be inserted in the database
    
    const promise = new Promise((resolve, reject) => {
    
    connection.query(query.registerUserQuery, [values], (error, result) => {
      //query to be executed
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "User Already Exists" }); //409: Conflict, user already exists
        } else {
          reject(error);
        }
  
      }
      else {
        resolve(result);
      }
       }
      );
    });
  
  
    try {
      await promise;
      res.json({message: "User Registered Successfully"});
    }
    catch (error) {
       console.error("Error while registering the user", error);
      res.status(500).json({ message: "Error while registering the user" });
    }
}
  



async function login(req, res) {
    const { EMAIL, PASSWORD } = req.body;
    if (EMAIL == null || PASSWORD == null) {
      res.status(400).json({ message: "Please enter all the fields" });
    }
  
    const promise = new Promise((resolve, reject) => {
    connection.query(query.loginUserQuery, [EMAIL], (error, result) => {
      if (error) {
        reject(error);
        // console.log("Error while logging in", error);
        // return res.status(500).json({ message: "Error while logging in" });
      }else if (result.length === 0) {
        // console.log("User does not exist");
        // return res.status(401).json({ message: "User does not exist" }); //401: Unauthorized, user does not exist

        reject({message : "User does not exist"});
      }
      else {
  
         const user = result[0]; //as email is unique, only one user will be returned
  
      //compare the password entered with the hashed password in the database
      bcrypt.compare(PASSWORD, user.PASSWORD, (err, isMatch) => {
        if (err) {
          reject(err);
          // console.log("Error while comparing the passwords", err);
          // res
          //   .status(500)
          //   .json({ message: "Error while comparing the passwords" });
        }else if (!isMatch) {
          reject({message : "Invalid Credentials or Hashed Password not found"});
          // return res.status(401).json({
          //   message: "Invalid Credentials or Hashed Password not found",
          // });
        }
        else {
              const tokenPayload = {
                email: EMAIL,
                role: user.ROLE,
                exp: Math.floor(Date.now() / 1000) + 60 * 10, //it will expire after 10 minutes
              };
  
          const token = jwt.sign(tokenPayload, `${process.env.JWT_SECRET}`); //secret key is used to sign the token
          resolve({ message: "Login successful", token: token });
  
        }
      });
       }
        }
      );
    });
  
    try {
      const result = await promise;
      return res.json(result);
    } catch (error) {
      console.error("Error while logging in", error);
      return res.status(500).json({ error });
    }
}
  



async function insertBook(req, res) {
    const { BNAME, AUTHORS, GENRE } = req.body;
    // const userRole = req.body.role; // Get the user role from the request body
  
    const userRole = req.user.role;
  
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Sorry, you are not an admin" });
    }
  
    if (!BNAME || !AUTHORS || !GENRE) {
      return res.status(400).json({ message: "Please enter all the fields" });
    }
  
    const promise = new Promise((resolve, reject) => {
  
    const values = [BNAME, AUTHORS, GENRE];
    connection.query(query.insertBookQuery, [values], (error, result) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          //return res.status(409).json({ message: "Book Already Exists" });
          reject({message : "Book Already Exists"});
        } else {
          reject(error);
        }
      }
      else {
        resolve(result);
      }
      });
    });
  
    try {
       await promise;
      return res.status(201).json({ message: "Book inserted successfully" });
    }
    catch (error) {
       console.error("Error while inserting the book", error);
      return res
        .status(500)
        .json({error});
    }
}
  



async function delBook(req, res) {
    const { BID, BNAME, AUTHORS, GENRE } = req.body;
    // const userRole = req.body.role; // Get the user role from the request body
  
    const userRole = req.user.role;
  
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Sorry, you are not an admin" });
    }
  
    if (!BID && !BNAME && !AUTHORS && !GENRE) {
      return res.status(400).json({ message: "Please enter at least one field" });
    }
  
    const promise = new Promise((resolve, reject) => {
    connection.query(
      query.delBookQuery,
      [BID, BNAME, AUTHORS, GENRE],
      (error, result) => {
        if (error) {
            
          console.error("Error while deleting the book", error);
          reject(error);
          // return res
          //   .status(500)
          //   .json({ message: "Error while deleting the book" });
        }
        else if(result.affectedRows == 0){
            reject({message : "Book does not exist"});
        }
        else {
          resolve(result);
        }
  
      }
      );
    });
  
    try {
      await promise;
      return res.json({ message: "Book deleted successfully" });
    }
    catch (error){
      console.error("Error while deleting the book", error);
      return res
        .status(500)
        .json({error});
    }
  }


  
async function updateBook(req, res) {
    const { BID, BNAME, AUTHORS, GENRE } = req.body;
    // const userRole = req.body.role; // Get the user role from the request body
  
    const userRole = req.user.role;
  
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Sorry, you are not an admin" });
    }
  
    if (!BID || !BNAME || !AUTHORS || !GENRE) {
      return res.status(400).json({ message: "Please enter all the fields" });
    }
  
    const promise = new Promise((resolve, reject) => {
    connection.query(
      query.updateBookQuery,
      [BNAME, AUTHORS, GENRE, BID],
      (error, result) => {
        if (error) {
            if(error.code === "ER_DUP_ENTRY"){
                reject({message : "Duplicate Entry"});
                console.error("Duplicate Entry", error);
            }
          console.error("Error while updating the book", error);
          reject(error);
          // return res
          //   .status(500)
          //   .json({ message: "Error while updating the book" });
        } else if(result.affectedRows === 0){
            reject({message : "Book does not exist"});
        }
        else {
          resolve(result);
        }
      }
      );
    });
  
    try {
      await promise;
      return res.json({ message: "Book updated successfully" });
    }
    catch (error) {
      console.error("Error while updating the book", error);
      return res
        .status(500)
        .json({ error});
    }
  }
  
  



  async function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"]; // is used to extract JSON Web Token from the Authorization header in an HTTP request.
    const token = authHeader && authHeader.split(" ")[1];
  
    // Checks if the token is present in the Authorization header, if not then it will short circuit and return undefined
  
    if (!token) {
      return res.status(401).json({ message: "Access token not provided" });
    }
  
    const promise = new Promise((resolve, reject) => {
    jwt.verify(token, `${process.env.JWT_SECRET}`, (err, user) => {
      //jwt.verify function takes the token and the secret, and it returns the payload if the signature is valid.
      if (err) {
        // console.error("Error while verifying token", err);
        // return res.status(403).json({ message: "Invalid token" });
        reject(err);
      }
      else{
        req.user = user;
          resolve();
        }
      });
    });
  
    try {
      await promise;
      next();
    } catch (error) {
      console.error("Error while verifying token", error);
      return res.status(403).json({ message: "Invalid token" });
    }
  }



    module.exports = {
        searchBooks,
        register,
        login,
        insertBook,
        delBook,
        updateBook,
        authenticateToken
    }