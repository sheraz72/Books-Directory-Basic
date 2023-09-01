require("dotenv").config();
let express = require("express"); //to create an Express application
let router = express.Router(); //to create a new router object
let connection = require("../database/dbcon.js"); //to create a connection with the database
let query = require("../database/queries.js"); //to write the queries

// For JWT
const bcrypt = require("bcrypt"); //to hash the password
const jwt = require("jsonwebtoken"); //to create a JSON Web Token
const { rejects } = require("assert");
// const { get } = require("http");
// const { rejects } = require("assert");
// const dotenv = require('dotenv');
// dotenv.config();



async function register (req, res) {
    const { u_name, email, role, password } = req.body; //recieve the data from the request body
    if (u_name == null || email == null || role == null || password == null) {
      return res.status(400).json({ message: "Please enter all the fields" }); //400: Bad request, server can't understand
    }
    if(role !== "admin" && role !== "user"){
      return res.status(400).json({ message: "Role should be Admin or User" });
    }
    if(password.length < 4){
      return res.status(400).json({ message: "Password should be at least 4 characters long" });
    }
    if(!email || !email.includes("@") || !email.includes(".")){
      return res.status(400).json({ message: "Please enter a valid email" });
    }
    const hashedPassword = await bcrypt.hashSync(password, 10); //hash the password, 10 is the saltRounds
  
    const values = [u_name, email, role, hashedPassword]; //values to be inserted in the database
    
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
      console.log("User Registered Successfully");
      res.json({message: "User Registered Successfully"});
    }
    catch (error) {
       console.error("Error while registering the user", error);
      res.status(500).json({ message: "Error while registering the user" });
    }
}
  



async function login(req, res) {
    const { email, password} = req.body;
    if (email == null || password == null) {
      // res.status(400).json({ message: "Please enter all the fields" });
      return res.status(400).json({ message: "Please enter all the fields" }); //400: Bad request, server can't understand
    }
  
    const promise = new Promise((resolve, reject) => {
    connection.query(query.loginUserQuery, [email], (error, result) => {
      if (error) {
        reject(error);

        // console.log("Error while logging in", error);
        // return res.status(500).json({ message: "Error while logging in" });
      }else if (result.length === 0) {
        // console.log("User does not exist");
        // return res.status(401).json({ message: "User does not exist" }); //401: Unauthorized, user does not exist

      console.log("User does not exist");
        reject({message : "User does not exist"});
       
      }
      else {
  
         const user = result[0]; //as email is unique, only one user will be returned
        const role = user.role;
        //  console.log("Entered Password:", PASSWORD);
        //  console.log("Stored Hashed Password:", user.password);

      //compare the password entered with the hashed password in the database
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          reject({message : "Error while comparing the passwords"});
          // console.log("Error while comparing the passwords", err);
          // res
          //   .status(500)
          //   .json({ message: "Error while comparing the passwords" });
        }else if (!isMatch) {
          console.log("Invalid Credentials");
          reject({message : "Invalid Credentials"});
          // return res.status(401).json({
          //   message: "Invalid Credentials or Hashed Password not found",
          // });
        }
        else {
              const tokenPayload = {
                email: email,
                role: role,
                user_id : user.user_id,
                exp: Math.floor(Date.now() / 1000) + 60 * 60, //it will expire after 60 minutes, /1000 used to convert ms to seconds 60 seconds * 60 minutes
                  
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
      console.log("Login successful");
      return res.json(result);
    } catch (error) {
      //console.error("Error while logging in", error);
      return res.status(500).json({ error });
    }
}


async function showUsers(req, res) {
    // console.log("User Role:", userRole);  
  
    connection.query(query.showUsersQuery, (error, result) => {
      if (error) {
        console.error("Error while getting all users", error);
        return res.status(500).json({ error });
      }
      console.log("All users fetched successfully");
      return res.json(result);
    });
}


  

async function addAuthors(req, res) {
  const { a_name, age} = req.body;
 

  const userRole = req.user.role;
    // console.log("User Role:", userRole);
  
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Sorry, you are not an admin" });
    }

    if (!a_name) {
      return res.status(400).json({ message: "Please enter author name" });
    }

  const values = [a_name, age];
  try {
    const result = await new Promise((resolve, reject) => {
      connection.query(query.addAuthors, [values], (error, result) => {
        if (error) {
          if (error.code === "ER_DUP_ENTRY") {
            console.log("Author Already Exists");
            return res.status(409).json({ message: "Author Already Exists" }); //409: Conflict, user already exists
          } else {
            reject(error);
          }
        } else {
          console.log("Author ID:", result.insertId);
          resolve(result);
        }
      });
    });

    console.log("Author added successfully");
    return res.json({message : "Author added successfully"});
  } catch (error) {
    console.error("Error while adding authors", error);
    return res.status(500).json({ error });
  }

  
}

async function authorDetails(req, res){

  connection.query(query.authorDetails, (error, result) => {

    if (error) {
      console.error("Error while getting all authors", error);
      return res.status(500).json({ error });
    }
    console.log("All authors details fetched successfully");
    return res.json(result);
  });

}

async function authorDetailsWithMaxBooks(req, res){

  connection.query(query.authorDetailsWithMaxBooksQuery, (error, result) => {

    if (error) {
      console.error("Error", error);
      return res.status(500).json({ error });
    }
    console.log("Author with maximum books fetched successfully");
    return res.json(result);
  });

}

async function insertBook(req, res) {
 
    const { b_name, genre} = req.body;
    // const userRole = req.body.role; // Get the user role from the request body
  
    const userRole = req.user.role;
    // console.log("User Role:", userRole);
  
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Sorry, you are not an admin" });
    }
  
    if (!b_name || !genre ) {
      return res.status(400).json({ message: "Please enter all the fields" });
    }

    try{

      // const checkAuthor = await new Promise((resolve, reject) => {
      //   connection.query(query.checkAuthorQuery, [author_id], (error, result) => {
      //     if (error) {
      //       reject(error);
      //     } else if(result.length === 0){
      //       console.log("Author does not exist");
      //       reject({message : "Author does not exist"});
      //     }
      //     else {
      //       resolve(result);
      //     }
      //   });

      // });

  
    const bookInsertResult  = await new Promise((resolve, reject) => {
  
    const values = [b_name, genre];
    connection.query(query.insertBookQuery, [values], (error, result) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          //return res.status(409).json({ message: "Book Already Exists" });
          console.log("Book Already Exists");
          reject({message : "Book Already Exists"});
        } else {
          reject(error);
        }
      }
      else {
        resolve(result);
        // AUTHOR_ID = result.AUTHOR_ID;
      }
      });
    });
  
    // const bookId = bookInsertResult.insertId; // Get the last inserted book ID
    

    // const bookAuthorInsertPromise = new Promise((resolve, reject) => {
    //   const bookAuthorValues = [bookId, author_id];
    //   connection.query(query.insertBookAuthorQuery, [bookAuthorValues], (error, result) => {
    //     if (error) {
    //       reject(error);
    //     } else {
    //       resolve(result);
    //     }
    //   });
    // });

      await Promise.all([bookInsertResult]); // Wait for all the author insert promises to resolve
      console.log("Book inserted successfully");
      return res.status(201).json({ message: "Book inserted successfully" });
    }
    catch (error) {
       console.error(error);
      return res
        .status(500)
        .json({error});
    }
}


  
async function insertBookAuthor(req, res) {

  //const { book_id, author_id} = req.body;

  const { book_name, author_name} = req.body;

  const userRole = req.user.role; // Get the user role from the request body
  if(userRole !== "admin"){
    return res.status(403).json({ message: "Sorry, you are not an admin" });
  }
  if(!book_name || !author_name){
    return res.status(400).json({ message: "Please enter all the fields" });
  }  

  var author_id;
  var book_id;

  
try{
    const checkAuthor = await new Promise((resolve, reject) => {
      connection.query(query.checkAuthorQuery, [author_name], (error, result) => {
        if (error) {
          reject(error);
        } else if(result.length == 0){
          console.log("Author does not exist");
          reject({message : "Author does not exist"});
        }
        else {
          
          author_id = result[0].author_id;
          console.log("Author ID:", author_id)
          resolve(result);
        }
      });

    });



    const checkBook = await new Promise((resolve, reject) => {
      connection.query(query.BookAvailabilityQuery, [book_name], (error, result) => {
        if (error) {
          reject(error);
        } else if(result.length == 0){
          reject({message : "Book does not exist"});
        }
        else {
          book_id = result[0].book_id;
          console.log("Book ID:", book_id);
          resolve(result);
        }
      });

    });
    
    // .catch(error => {
    //   return res.status(500).json({ error: "An error occurred" });
    //   //throw error; // Re-throw the error to be caught in the outer try-catch block
    // });

    const checkDuplicateEntry = await new Promise((resolve, reject) => {

      connection.query(query.checkAuthorBookExists, [book_id, author_id], (error, result) => {
        if (error) {
          reject(error);
        } else if(result.length !== 0){
          console.log("Book and Author already exists");
          reject({message : "Book and Author already exists"});
        }
        else {
          console.log("Book id and Author id ", book_id, author_id);
          console.log("Result: ", result.length);
          resolve(result);
        }

      });
    });
    

      const bookAuthorInsertPromise = await new Promise((resolve, reject) => {

        connection.query(query.insertBookAuthorQuery, [book_id, author_id], (error, result) => {
          if (error) {
            console.error("Error while inserting book author", error);
            reject(error);
          } else {
            resolve(result);
          }
        });
        
      });


      //await Promise.all([checkAuthor,checkBook,checkDuplicateEntry, bookAuthorInsertPromise]); // Wait for all the author insert promises to resolve
      // await Promise.all([checkDuplicateEntry,checkAuthor, checkBook,bookAuthorInsertPromise]); // Wait for all the author insert promises to resolve
      console.log("Author's of Book has been inserted successfully");
      return res.status(201).json({ message: "Author's of Book has been inserted successfully" });
    }
    catch (error) {
       console.error(error);
      return res
        .status(500)
        .json({error});
    }

}


async function delBook(req, res) {
    const {b_name} = req.body;
    // const userRole = req.body.role; // Get the user role from the request body

    const userRole = req.user.role;

  
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Sorry, you are not an admin" });
    }
  
    if (!b_name) {
      return res.status(400).json({ message: "Please enter Book name" });
    }
  
    const promise = new Promise((resolve, reject) => {
    connection.query(query.delBookQuery,[b_name],(error, result) => {
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
      console.log("Book deleted successfully");
      return res.json({ message: "Book deleted successfully" });
    }
    catch (error){
      console.error(error);
      return res
        .status(500)
        .json({error});
    }
  }



  async function searchBooks (req, res) {
    const { b_name, author_id, genre } = req.body;
    if (!b_name && !author_id && !genre) {
      return res.status(400).json({ message: "Please enter at least one field" });
    }
  
    const b_name_pattern = `%${b_name}%`;
    const genre_pattern = `%${genre}%`;

    const promise = new Promise((resolve, reject) => {
    connection.query(query.getBooksQuery,[b_name_pattern, author_id, genre_pattern],(error, result) => {
        if (error) {
          reject(error);
        } else {
          if(result.length === 0){
            reject({message : "Book not found"});
          }
          resolve(result);
        }
      }
    );
  });
  
  try {
  const result = await promise;
    
      console.log("Books found");
      return res.json(result);
       } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Book not found" });
    }
}


  
async function updateBook(req, res) {
    const { book_id, b_name, author_id, genre } = req.body;
    // const userRole = req.body.role; // Get the user role from the request body
  
    const userRole = req.user.role;
    const bookID = req.body.BID;
  
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Sorry, you are not an admin" });
    }
  
    if (!book_id || !b_name || !author_id || !genre) {
      return res.status(400).json({ message: "Please enter all the fields" });
    }
  
    const updateBookResult = new Promise((resolve, reject) => {
    connection.query(
      query.updateBookQuery,
      [b_name, author_id, genre, book_id],
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

    const updateBookAuthorResult = new Promise((resolve, reject) => {
      connection.query(query.updateBookAuthorQuery, [author_id, book_id, book_id], (error, result) => {
        if (error) {
          console.error("Error while updating the book", error);
          reject(error);
        } else {
          resolve(result);
        }
      });

    });

  
    try {
      await Promise.all([updateBookResult, updateBookAuthorResult]);
      console.log("Book updated successfully");
      return res.json({ message: "Book updated successfully" });
    }
    catch (error) {
      console.error("Error while updating the book", error);
      return res
        .status(500)
        .json({ error});
    }
  }
  

  async function borrowBook(req, res) {

    const {book_id, due_date} = req.body;
    const userRole = req.user.role;
    const userID = req.user.user_id;
    const borrowedAt = new Date();
    const dueDate = new Date(borrowedAt.getTime() + due_date * 24 * 60 * 60 * 1000);

    // if(userRole !== "user"){
    //   return res.status(403).json({ message: "Sorry, you are not an user" });
    // }

    if(!book_id || !due_date){
      return res.status(400).json({ message: "Please enter the ID of Book which you want to borrow and Due Date!" });
    }


    try {
    const bannedResult = await new Promise((resolve, reject) => {

      // console.log("User ID", userID);
      // console.log(query.isUserBannedQuery, "user id", userID);
      connection.query(query.isUserBannedQuery, userID, (error, result) => {
        if (error) {
          reject(error);
        }
      
        else {
          // console.log("User is banned, cannot borrow book");
          resolve(result);
        }
      });
    });

    //console.log("Banned Result", bannedResult);
    if(bannedResult.length > 0 && bannedResult[0].user_status === 'banned'){
      console.log("User is banned, cannot borrow book")
      return res.status(403).json({ message: "User is banned, cannot borrow a book" });
    }


    const BookAvailabilityResult = await new Promise((resolve, reject) => {
      connection.query(query.BookAvailabilityQuery, [book_id], (error, result) => {
        if (error) {
          reject(error);
        } else if(result.length === 0){
          reject({message : "Book does not exist"});
        }
        //  else if(result[0].STATUS !== 'Available'){
        //   reject({message : "Book is not available"});
        // }
        else {
          resolve(result[0]);
        }
      });
    });

    const alreadyBorrowed = await new Promise((resolve, reject) => {

      //To check if the book is already borrowed by the user or not
      connection.query(query.checkIfAlreadyBorrowedQuery, [book_id], (error, result) => {
        if (error) {
          reject(error);
        } else if(result.length !== 0){
          reject({message : "Book is already borrowed"});
        }
        else {
          resolve(false);
        }
      });
    });

    if(!alreadyBorrowed){
      const values = [[BookAvailabilityResult.book_id, userID, borrowedAt, dueDate]];

      // Borrowed book is inserted into the borrowing table
      const borrowBookResult = await new Promise((resolve, reject) => {
          connection.query(query.borrowBookQuery, values, (error, result) => {
              if (error) {
                //If Book is returned and user is not banned, then that Book can be borrowed again
                if(error.code === "ER_DUP_ENTRY"){
                  connection.query(query.updateBorrowBookQuery, [userID, borrowedAt, dueDate,BookAvailabilityResult.book_id], (error, result) => {
                      if (error) {
                        console.error(error);
                          reject(error);
                      } else {
                          resolve(result);
                      }
                  });
                }
                else{
                  reject(error);
                }
              } else {
                  resolve(result);
              }
          });
      });

      console.log("Book borrowed successfully");
      return res.json({ message: "Book borrowed successfully" });
    }

  }
  catch (error) {
    console.error( error);
        return res.status(500).json({ error });
  }
}



 async function checkFine(req,res){

  //const userID = req.user.user_id;
  const {u_name} = req.body;
  const u_name_pattern = `%${u_name}%`;
  //console.log("userID",user_id);

  var userId;
  if (!u_name) {
    return res.status(400).json({ message: "Please provide a valid user name" });
  }

 try {
  //console.log("Executing updateFineQuery:", query.updateFineQuery);


  const isUserBannedResult = await new Promise((resolve, reject) => {

    connection.query(query.isUserBannedQuery, u_name_pattern, (error, result) => {
      if (error) {
        console.error("Error checking if user is banned:", error);
        reject(error);
      }
    
       else {
        //console.log("User is banned, cannot borrow book");
         userId = result[0].user_id;
        resolve(result);
      }
    });
  });

  if(isUserBannedResult.length > 0 && isUserBannedResult[0].user_status === 'banned'){
    console.log("User is banned due to not submitting fine on time")
    return res.status(403).json({ message: "User is banned due to not submitting fine on time" });
  }


  const updateFineResult = await new Promise((resolve, reject) => {

    connection.query(query.updateFineQuery, (error, result) => {
      if (error) {
        console.error("Error updating fines:", error);
        reject(error);
      } else {
        //console.log("Fine updated successfully");
        resolve(result);
      }
    });
  });


  const banUserResult = await new Promise((resolve, reject) => {
    connection.query(query.banUser, (error, result) => {
      if (error) {
        console.error("Error banning users:", error);
        reject(error);
      }
    
       else {
        resolve(result);
      }
    });
  });

  //console.log("Executing checkFineQuery:", query.checkFineQuery, "with user_id:", user_id);

  const checkFineResult = await new Promise((resolve, reject) => {
    
    connection.query(query.checkFineQuery, userId, (error, result) => {
      if (error) {
        console.error("Error checking fines:", error)
        reject(error);
      } else {
        if(result.length === 0){
          console.log("User did not borrow any book");
          return res.json({ message: "User did not borrow any book" });
        }
        else{
        console.log("Fine details found"); 
        resolve(result);
      }
      }
    });
  });

 

    return res.json(checkFineResult);
 }
    catch (error) {
    console.error("Error while checking fines:", error);
    return res.status(500).json({ message: "Error while checking fines" });
  }
 }


async function checkAllUsersFine (){

  const updateFineResult = await new Promise((resolve, reject) => {

    connection.query(query.updateFineQuery, (error, result) => {
      if (error) {
        console.error("Error updating fines:", error);
        reject(error);
      } else {
        //console.log("Fine updated successfully");
        resolve(result);
      }
    });
  });


  const checkAllUserFineResult = await new Promise((resolve, reject) => {
    

    try{

    connection.query(query.checkAllUserFineQuery, userId, (error, result) => {
      if (error) {
        console.error("Error checking fines:", error)
        reject(error);
      } else {
        if(result.length === 0){
          console.log("User did not borrow any book");
          return res.json({ message: "User did not borrow any book" });
        }
        else{
        console.log("Fine details found"); 
        resolve(result);
      }
      }
    });

    return res.json(checkAllUserFineResult);

  }
    catch (error) {
    console.error("Error while checking fines:", error);
    return res.status(500).json({ message: "Error while checking fines" });
  }

});

}

 async function getAllBooks(req,res){

  connection.query(query.getAllBooksQuery, (error, result) => {

    if (error) {
      console.error("Error while getting all books", error);
      return res.status(500).json({ error });
    }
    console.log("All books fetched successfully");
    return res.json(result);

  });
 }


  async function getBookAuthorDetails(req,res){

    connection.query(query.getBookAuthorDetailsQuery, (error, result) => {
        
        if (error) {
          console.error("Error while getting all authors", error);
          return res.status(500).json({ error });
        }
        console.log("All authors details fetched successfully");
        return res.json(result);
    
    });

  }

  async function getAuthorDetails(req,res){

    const {a_name} = req.body;


    if(!a_name){
      return res.status(400).json({ message: "Please provide a valid author name" });
    }

    const a_name_pattern = `%${a_name}%`;
    console.log("Pattern ", a_name_pattern)
    var author_id;

    try{
      const checkAuthor = await new Promise((resolve, reject) => {
        connection.query(query.checkAuthorQuery, [a_name], (error, result) => {
          if (error) {
            reject(error);
          } else if(result.length == 0){
            console.log("Author does not exist");
            reject({message : "Author does not exist"});
          }
          else {
            
            author_id = result[0].author_id;
            console.log("Author ID:", author_id)
            resolve(result);
          }
        });
  
      });
  

      const getAuthorResult = await new Promise((resolve, reject) => {

        connection.query(query.getAuthorDetailsQuery, [author_id], (error, result) => {
        
          if (error) {
            console.error("Error while getting all authors", error);
            return res.status(500).json({ error });
          }
          console.log("Author details fetched successfully");
          return res.json(result);
      
      });
    });

    console.log("Author's of Book has been inserted successfully");
    return res.status(201).json({ message: "Author's of Book has been inserted successfully" });
  }
  catch(error){
    console.error(error);
    return res
      .status(500)
      .json({error});

  }
    
}
   

  async function getAllUserDetails(req,res){
  
    connection.query(query.getAllUsersDetailsQuery, (error, result) => {
          
          if (error) {
            console.error("Error while getting all users", error);
            return res.status(500).json({ error });
          }
          console.log("All users details fetched successfully");
          return res.json(result);
    });
  }


  async function getUserDetails(req,res){
    
      const {u_name} = req.body;
  
      if (!u_name) {
        return res.status(400).json({ message: "Please provide a valid user_id" });
      }

      const u_name_pattern = `%${u_name}%`;
      
  
      connection.query(query.getUserDetailQuery, u_name_pattern, (error, result) => {
            
            if (error) {
              console.error("Error while getting user details", error);
              return res.status(500).json({ error });
            }
            console.log("User details fetched successfully");
            return res.json(result);
      });
  }

  async function returnBook(req, res) {

    const {book_id} = req.body;
    const userID = req.user.user_id;

    const values = [book_id, userID];

    connection.query(query.checkIfBorrowBookQuery,values, (error, result) => {

      if (error) {
        console.error("Error while returning book", error);
        return res.status(500).json({ error });
      }
      else if(result.length === 0){
        console.log("Book is not borrowed by you");
        return res.json({ message: "Book is not borrowed by you" });
      }
      else if(result[0].STATUS === 'Returned'){
        console.log("Book is already returned");
        return res.json({ message: "Book is already returned" });
      }

    
      connection.query(query.returnBookQuery, values, (error, result) => {
          
          if (error) {
            console.error("Error while returning book", error);
            return res.status(500).json({ error });
          }
          else{
            console.log("Book returned successfully");
            return res.json({ message: "Book returned successfully" });
          }
      });

    });



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
        register,
        login,
        showUsers,
        addAuthors,
        authorDetails, 
        authorDetailsWithMaxBooks, 
        searchBooks,
        insertBook,
        insertBookAuthor,
        delBook,
        updateBook,
        borrowBook,
        checkFine,
        checkAllUsersFine,
        getAllBooks,
        getBookAuthorDetails,
        getAuthorDetails,
        getAllUserDetails,
        getUserDetails,
        returnBook,
        authenticateToken
    }

  