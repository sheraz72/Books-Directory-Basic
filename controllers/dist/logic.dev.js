"use strict";

require("dotenv").config();

var express = require("express"); //to create an Express application


var router = express.Router(); //to create a new router object

var connection = require("../database/dbcon.js"); //to create a connection with the database


var query = require("../database/queries.js"); //to write the queries
// For JWT


var bcrypt = require("bcrypt"); //to hash the password


var jwt = require("jsonwebtoken"); //to create a JSON Web Token


var _require = require("assert"),
    rejects = _require.rejects; // const { get } = require("http");
// const { rejects } = require("assert");
// const dotenv = require('dotenv');
// dotenv.config();


function register(req, res) {
  var _req$body, u_name, email, role, password, hashedPassword, values, promise;

  return regeneratorRuntime.async(function register$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, u_name = _req$body.u_name, email = _req$body.email, role = _req$body.role, password = _req$body.password; //recieve the data from the request body

          if (!(u_name == null || email == null || role == null || password == null)) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: "Please enter all the fields"
          }));

        case 3:
          if (!(role !== "admin" && role !== "user")) {
            _context.next = 5;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: "Role should be Admin or User"
          }));

        case 5:
          if (!(password.length < 4)) {
            _context.next = 7;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: "Password should be at least 4 characters long"
          }));

        case 7:
          if (!(!email || !email.includes("@") || !email.includes("."))) {
            _context.next = 9;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: "Please enter a valid email"
          }));

        case 9:
          _context.next = 11;
          return regeneratorRuntime.awrap(bcrypt.hashSync(password, 10));

        case 11:
          hashedPassword = _context.sent;
          //hash the password, 10 is the saltRounds
          values = [u_name, email, role, hashedPassword]; //values to be inserted in the database

          promise = new Promise(function (resolve, reject) {
            connection.query(query.registerUserQuery, [values], function (error, result) {
              //query to be executed
              if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                  return res.status(409).json({
                    message: "User Already Exists"
                  }); //409: Conflict, user already exists
                } else {
                  reject(error);
                }
              } else {
                resolve(result);
              }
            });
          });
          _context.prev = 14;
          _context.next = 17;
          return regeneratorRuntime.awrap(promise);

        case 17:
          console.log("User Registered Successfully");
          res.json({
            message: "User Registered Successfully"
          });
          _context.next = 25;
          break;

        case 21:
          _context.prev = 21;
          _context.t0 = _context["catch"](14);
          console.error("Error while registering the user", _context.t0);
          res.status(500).json({
            message: "Error while registering the user"
          });

        case 25:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[14, 21]]);
}

function login(req, res) {
  var _req$body2, email, password, promise, result;

  return regeneratorRuntime.async(function login$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password;

          if (!(email == null || password == null)) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Please enter all the fields"
          }));

        case 3:
          promise = new Promise(function (resolve, reject) {
            connection.query(query.loginUserQuery, [email], function (error, result) {
              if (error) {
                reject(error); // console.log("Error while logging in", error);
                // return res.status(500).json({ message: "Error while logging in" });
              } else if (result.length === 0) {
                // console.log("User does not exist");
                // return res.status(401).json({ message: "User does not exist" }); //401: Unauthorized, user does not exist
                console.log("User does not exist");
                reject({
                  message: "User does not exist"
                });
              } else {
                var user = result[0]; //as email is unique, only one user will be returned

                var role = user.role; //  console.log("Entered Password:", PASSWORD);
                //  console.log("Stored Hashed Password:", user.password);
                //compare the password entered with the hashed password in the database

                bcrypt.compare(password, user.password, function (err, isMatch) {
                  if (err) {
                    reject({
                      message: "Error while comparing the passwords"
                    }); // console.log("Error while comparing the passwords", err);
                    // res
                    //   .status(500)
                    //   .json({ message: "Error while comparing the passwords" });
                  } else if (!isMatch) {
                    console.log("Invalid Credentials");
                    reject({
                      message: "Invalid Credentials"
                    }); // return res.status(401).json({
                    //   message: "Invalid Credentials or Hashed Password not found",
                    // });
                  } else {
                    var tokenPayload = {
                      email: email,
                      role: role,
                      user_id: user.user_id,
                      exp: Math.floor(Date.now() / 1000) + 60 * 60 //it will expire after 60 minutes, /1000 used to convert ms to seconds 60 seconds * 60 minutes

                    };
                    var token = jwt.sign(tokenPayload, "".concat(process.env.JWT_SECRET)); //secret key is used to sign the token

                    resolve({
                      message: "Login successful",
                      token: token
                    });
                  }
                });
              }
            });
          });
          _context2.prev = 4;
          _context2.next = 7;
          return regeneratorRuntime.awrap(promise);

        case 7:
          result = _context2.sent;
          console.log("Login successful");
          return _context2.abrupt("return", res.json(result));

        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](4);
          return _context2.abrupt("return", res.status(500).json({
            error: _context2.t0
          }));

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[4, 12]]);
}

function showUsers(req, res) {
  return regeneratorRuntime.async(function showUsers$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // console.log("User Role:", userRole);  
          connection.query(query.showUsersQuery, function (error, result) {
            if (error) {
              console.error("Error while getting all users", error);
              return res.status(500).json({
                error: error
              });
            }

            console.log("All users fetched successfully");
            return res.json(result);
          });

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
}

function addAuthors(req, res) {
  var _req$body3, a_name, age, userRole, values, result;

  return regeneratorRuntime.async(function addAuthors$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$body3 = req.body, a_name = _req$body3.a_name, age = _req$body3.age;
          userRole = req.user.role; // console.log("User Role:", userRole);

          if (!(userRole !== "admin")) {
            _context4.next = 4;
            break;
          }

          return _context4.abrupt("return", res.status(403).json({
            message: "Sorry, you are not an admin"
          }));

        case 4:
          if (a_name) {
            _context4.next = 6;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: "Please enter author name"
          }));

        case 6:
          values = [a_name, age];
          _context4.prev = 7;
          _context4.next = 10;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.query(query.addAuthors, [values], function (error, result) {
              if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                  console.log("Author Already Exists");
                  return res.status(409).json({
                    message: "Author Already Exists"
                  }); //409: Conflict, user already exists
                } else {
                  reject(error);
                }
              } else {
                console.log("Author ID:", result.insertId);
                resolve(result);
              }
            });
          }));

        case 10:
          result = _context4.sent;
          console.log("Author added successfully");
          return _context4.abrupt("return", res.json({
            message: "Author added successfully"
          }));

        case 15:
          _context4.prev = 15;
          _context4.t0 = _context4["catch"](7);
          console.error("Error while adding authors", _context4.t0);
          return _context4.abrupt("return", res.status(500).json({
            error: _context4.t0
          }));

        case 19:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[7, 15]]);
}

function authorDetails(req, res) {
  return regeneratorRuntime.async(function authorDetails$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          connection.query(query.authorDetails, function (error, result) {
            if (error) {
              console.error("Error while getting all authors", error);
              return res.status(500).json({
                error: error
              });
            }

            console.log("All authors details fetched successfully");
            return res.json(result);
          });

        case 1:
        case "end":
          return _context5.stop();
      }
    }
  });
}

function authorDetailsWithMaxBooks(req, res) {
  return regeneratorRuntime.async(function authorDetailsWithMaxBooks$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          connection.query(query.authorDetailsWithMaxBooksQuery, function (error, result) {
            if (error) {
              console.error("Error", error);
              return res.status(500).json({
                error: error
              });
            }

            console.log("Author with maximum books fetched successfully");
            return res.json(result);
          });

        case 1:
        case "end":
          return _context6.stop();
      }
    }
  });
}

function insertBook(req, res) {
  var _req$body4, b_name, genre, userRole, bookInsertResult;

  return regeneratorRuntime.async(function insertBook$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _req$body4 = req.body, b_name = _req$body4.b_name, genre = _req$body4.genre; // const userRole = req.body.role; // Get the user role from the request body

          userRole = req.user.role; // console.log("User Role:", userRole);

          if (!(userRole !== "admin")) {
            _context7.next = 4;
            break;
          }

          return _context7.abrupt("return", res.status(403).json({
            message: "Sorry, you are not an admin"
          }));

        case 4:
          if (!(!b_name || !genre)) {
            _context7.next = 6;
            break;
          }

          return _context7.abrupt("return", res.status(400).json({
            message: "Please enter all the fields"
          }));

        case 6:
          _context7.prev = 6;
          _context7.next = 9;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            var values = [b_name, genre];
            connection.query(query.insertBookQuery, [values], function (error, result) {
              if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                  //return res.status(409).json({ message: "Book Already Exists" });
                  console.log("Book Already Exists");
                  reject({
                    message: "Book Already Exists"
                  });
                } else {
                  reject(error);
                }
              } else {
                resolve(result); // AUTHOR_ID = result.AUTHOR_ID;
              }
            });
          }));

        case 9:
          bookInsertResult = _context7.sent;
          _context7.next = 12;
          return regeneratorRuntime.awrap(Promise.all([bookInsertResult]));

        case 12:
          // Wait for all the author insert promises to resolve
          console.log("Book inserted successfully");
          return _context7.abrupt("return", res.status(201).json({
            message: "Book inserted successfully"
          }));

        case 16:
          _context7.prev = 16;
          _context7.t0 = _context7["catch"](6);
          console.error(_context7.t0);
          return _context7.abrupt("return", res.status(500).json({
            error: _context7.t0
          }));

        case 20:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[6, 16]]);
}

function insertBookAuthor(req, res) {
  var _req$body5, book_name, author_name, userRole, author_id, book_id, checkAuthor, checkBook, checkDuplicateEntry, bookAuthorInsertPromise;

  return regeneratorRuntime.async(function insertBookAuthor$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          //const { book_id, author_id} = req.body;
          _req$body5 = req.body, book_name = _req$body5.book_name, author_name = _req$body5.author_name;
          userRole = req.user.role; // Get the user role from the request body

          if (!(userRole !== "admin")) {
            _context8.next = 4;
            break;
          }

          return _context8.abrupt("return", res.status(403).json({
            message: "Sorry, you are not an admin"
          }));

        case 4:
          if (!(!book_name || !author_name)) {
            _context8.next = 6;
            break;
          }

          return _context8.abrupt("return", res.status(400).json({
            message: "Please enter all the fields"
          }));

        case 6:
          _context8.prev = 6;
          _context8.next = 9;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.query(query.checkAuthorQuery, [author_name], function (error, result) {
              if (error) {
                reject(error);
              } else if (result.length == 0) {
                console.log("Author does not exist");
                reject({
                  message: "Author does not exist"
                });
              } else {
                author_id = result[0].author_id;
                console.log("Author ID:", author_id);
                resolve(result);
              }
            });
          }));

        case 9:
          checkAuthor = _context8.sent;
          _context8.next = 12;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.query(query.BookAvailabilityQuery, [book_name], function (error, result) {
              if (error) {
                reject(error);
              } else if (result.length == 0) {
                reject({
                  message: "Book does not exist"
                });
              } else {
                book_id = result[0].book_id;
                console.log("Book ID:", book_id);
                resolve(result);
              }
            });
          }));

        case 12:
          checkBook = _context8.sent;
          _context8.next = 15;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.query(query.checkAuthorBookExists, [book_id, author_id], function (error, result) {
              if (error) {
                reject(error);
              } else if (result.length !== 0) {
                console.log("Book and Author already exists");
                reject({
                  message: "Book and Author already exists"
                });
              } else {
                console.log("Book id and Author id ", book_id, author_id);
                console.log("Result: ", result.length);
                resolve(result);
              }
            });
          }));

        case 15:
          checkDuplicateEntry = _context8.sent;
          _context8.next = 18;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.query(query.insertBookAuthorQuery, [book_id, author_id], function (error, result) {
              if (error) {
                console.error("Error while inserting book author", error);
                reject(error);
              } else {
                resolve(result);
              }
            });
          }));

        case 18:
          bookAuthorInsertPromise = _context8.sent;
          //await Promise.all([checkAuthor,checkBook,checkDuplicateEntry, bookAuthorInsertPromise]); // Wait for all the author insert promises to resolve
          // await Promise.all([checkDuplicateEntry,checkAuthor, checkBook,bookAuthorInsertPromise]); // Wait for all the author insert promises to resolve
          console.log("Author's of Book has been inserted successfully");
          return _context8.abrupt("return", res.status(201).json({
            message: "Author's of Book has been inserted successfully"
          }));

        case 23:
          _context8.prev = 23;
          _context8.t0 = _context8["catch"](6);
          console.error(_context8.t0);
          return _context8.abrupt("return", res.status(500).json({
            error: _context8.t0
          }));

        case 27:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[6, 23]]);
}

function delBook(req, res) {
  var b_name, userRole, promise;
  return regeneratorRuntime.async(function delBook$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          b_name = req.body.b_name; // const userRole = req.body.role; // Get the user role from the request body

          userRole = req.user.role;

          if (!(userRole !== "admin")) {
            _context9.next = 4;
            break;
          }

          return _context9.abrupt("return", res.status(403).json({
            message: "Sorry, you are not an admin"
          }));

        case 4:
          if (b_name) {
            _context9.next = 6;
            break;
          }

          return _context9.abrupt("return", res.status(400).json({
            message: "Please enter Book name"
          }));

        case 6:
          promise = new Promise(function (resolve, reject) {
            connection.query(query.delBookQuery, [b_name], function (error, result) {
              if (error) {
                console.error("Error while deleting the book", error);
                reject(error); // return res
                //   .status(500)
                //   .json({ message: "Error while deleting the book" });
              } else if (result.affectedRows == 0) {
                reject({
                  message: "Book does not exist"
                });
              } else {
                resolve(result);
              }
            });
          });
          _context9.prev = 7;
          _context9.next = 10;
          return regeneratorRuntime.awrap(promise);

        case 10:
          console.log("Book deleted successfully");
          return _context9.abrupt("return", res.json({
            message: "Book deleted successfully"
          }));

        case 14:
          _context9.prev = 14;
          _context9.t0 = _context9["catch"](7);
          console.error(_context9.t0);
          return _context9.abrupt("return", res.status(500).json({
            error: _context9.t0
          }));

        case 18:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[7, 14]]);
}

function searchBooks(req, res) {
  var _req$body6, b_name, author_id, genre, b_name_pattern, genre_pattern, promise, result;

  return regeneratorRuntime.async(function searchBooks$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _req$body6 = req.body, b_name = _req$body6.b_name, author_id = _req$body6.author_id, genre = _req$body6.genre;

          if (!(!b_name && !author_id && !genre)) {
            _context10.next = 3;
            break;
          }

          return _context10.abrupt("return", res.status(400).json({
            message: "Please enter at least one field"
          }));

        case 3:
          b_name_pattern = "%".concat(b_name, "%");
          genre_pattern = "%".concat(genre, "%");
          promise = new Promise(function (resolve, reject) {
            connection.query(query.getBooksQuery, [b_name_pattern, author_id, genre_pattern], function (error, result) {
              if (error) {
                reject(error);
              } else {
                if (result.length === 0) {
                  reject({
                    message: "Book not found"
                  });
                }

                resolve(result);
              }
            });
          });
          _context10.prev = 6;
          _context10.next = 9;
          return regeneratorRuntime.awrap(promise);

        case 9:
          result = _context10.sent;
          console.log("Books found");
          return _context10.abrupt("return", res.json(result));

        case 14:
          _context10.prev = 14;
          _context10.t0 = _context10["catch"](6);
          console.error(_context10.t0);
          return _context10.abrupt("return", res.status(500).json({
            message: "Book not found"
          }));

        case 18:
        case "end":
          return _context10.stop();
      }
    }
  }, null, null, [[6, 14]]);
}

function updateBook(req, res) {
  var _req$body7, book_id, b_name, author_id, genre, userRole, bookID, updateBookResult, updateBookAuthorResult;

  return regeneratorRuntime.async(function updateBook$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          _req$body7 = req.body, book_id = _req$body7.book_id, b_name = _req$body7.b_name, author_id = _req$body7.author_id, genre = _req$body7.genre; // const userRole = req.body.role; // Get the user role from the request body

          userRole = req.user.role;
          bookID = req.body.BID;

          if (!(userRole !== "admin")) {
            _context11.next = 5;
            break;
          }

          return _context11.abrupt("return", res.status(403).json({
            message: "Sorry, you are not an admin"
          }));

        case 5:
          if (!(!book_id || !b_name || !author_id || !genre)) {
            _context11.next = 7;
            break;
          }

          return _context11.abrupt("return", res.status(400).json({
            message: "Please enter all the fields"
          }));

        case 7:
          updateBookResult = new Promise(function (resolve, reject) {
            connection.query(query.updateBookQuery, [b_name, author_id, genre, book_id], function (error, result) {
              if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                  reject({
                    message: "Duplicate Entry"
                  });
                  console.error("Duplicate Entry", error);
                }

                console.error("Error while updating the book", error);
                reject(error); // return res
                //   .status(500)
                //   .json({ message: "Error while updating the book" });
              } else if (result.affectedRows === 0) {
                reject({
                  message: "Book does not exist"
                });
              } else {
                resolve(result);
              }
            });
          });
          updateBookAuthorResult = new Promise(function (resolve, reject) {
            connection.query(query.updateBookAuthorQuery, [author_id, book_id, book_id], function (error, result) {
              if (error) {
                console.error("Error while updating the book", error);
                reject(error);
              } else {
                resolve(result);
              }
            });
          });
          _context11.prev = 9;
          _context11.next = 12;
          return regeneratorRuntime.awrap(Promise.all([updateBookResult, updateBookAuthorResult]));

        case 12:
          console.log("Book updated successfully");
          return _context11.abrupt("return", res.json({
            message: "Book updated successfully"
          }));

        case 16:
          _context11.prev = 16;
          _context11.t0 = _context11["catch"](9);
          console.error("Error while updating the book", _context11.t0);
          return _context11.abrupt("return", res.status(500).json({
            error: _context11.t0
          }));

        case 20:
        case "end":
          return _context11.stop();
      }
    }
  }, null, null, [[9, 16]]);
}

function borrowBook(req, res) {
  var _req$body8, book_id, due_date, userRole, userID, borrowedAt, dueDate, bannedResult, BookAvailabilityResult, alreadyBorrowed, values, borrowBookResult;

  return regeneratorRuntime.async(function borrowBook$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          _req$body8 = req.body, book_id = _req$body8.book_id, due_date = _req$body8.due_date;
          userRole = req.user.role;
          userID = req.user.user_id;
          borrowedAt = new Date();
          dueDate = new Date(borrowedAt.getTime() + due_date * 24 * 60 * 60 * 1000); // if(userRole !== "user"){
          //   return res.status(403).json({ message: "Sorry, you are not an user" });
          // }

          if (!(!book_id || !due_date)) {
            _context12.next = 7;
            break;
          }

          return _context12.abrupt("return", res.status(400).json({
            message: "Please enter the ID of Book which you want to borrow and Due Date!"
          }));

        case 7:
          _context12.prev = 7;
          _context12.next = 10;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            // console.log("User ID", userID);
            // console.log(query.isUserBannedQuery, "user id", userID);
            connection.query(query.isUserBannedQuery, userID, function (error, result) {
              if (error) {
                reject(error);
              } else {
                // console.log("User is banned, cannot borrow book");
                resolve(result);
              }
            });
          }));

        case 10:
          bannedResult = _context12.sent;

          if (!(bannedResult.length > 0 && bannedResult[0].user_status === 'banned')) {
            _context12.next = 14;
            break;
          }

          console.log("User is banned, cannot borrow book");
          return _context12.abrupt("return", res.status(403).json({
            message: "User is banned, cannot borrow a book"
          }));

        case 14:
          _context12.next = 16;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.query(query.BookAvailabilityQuery, [book_id], function (error, result) {
              if (error) {
                reject(error);
              } else if (result.length === 0) {
                reject({
                  message: "Book does not exist"
                });
              } //  else if(result[0].STATUS !== 'Available'){
              //   reject({message : "Book is not available"});
              // }
              else {
                  resolve(result[0]);
                }
            });
          }));

        case 16:
          BookAvailabilityResult = _context12.sent;
          _context12.next = 19;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            //To check if the book is already borrowed by the user or not
            connection.query(query.checkIfAlreadyBorrowedQuery, [book_id], function (error, result) {
              if (error) {
                reject(error);
              } else if (result.length !== 0) {
                reject({
                  message: "Book is already borrowed"
                });
              } else {
                resolve(false);
              }
            });
          }));

        case 19:
          alreadyBorrowed = _context12.sent;

          if (alreadyBorrowed) {
            _context12.next = 27;
            break;
          }

          values = [[BookAvailabilityResult.book_id, userID, borrowedAt, dueDate]]; // Borrowed book is inserted into the borrowing table

          _context12.next = 24;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.query(query.borrowBookQuery, values, function (error, result) {
              if (error) {
                //If Book is returned and user is not banned, then that Book can be borrowed again
                if (error.code === "ER_DUP_ENTRY") {
                  connection.query(query.updateBorrowBookQuery, [userID, borrowedAt, dueDate, BookAvailabilityResult.book_id], function (error, result) {
                    if (error) {
                      console.error(error);
                      reject(error);
                    } else {
                      resolve(result);
                    }
                  });
                } else {
                  reject(error);
                }
              } else {
                resolve(result);
              }
            });
          }));

        case 24:
          borrowBookResult = _context12.sent;
          console.log("Book borrowed successfully");
          return _context12.abrupt("return", res.json({
            message: "Book borrowed successfully"
          }));

        case 27:
          _context12.next = 33;
          break;

        case 29:
          _context12.prev = 29;
          _context12.t0 = _context12["catch"](7);
          console.error(_context12.t0);
          return _context12.abrupt("return", res.status(500).json({
            error: _context12.t0
          }));

        case 33:
        case "end":
          return _context12.stop();
      }
    }
  }, null, null, [[7, 29]]);
}

function checkFine(req, res) {
  var u_name, u_name_pattern, userId, isUserBannedResult, updateFineResult, banUserResult, checkFineResult;
  return regeneratorRuntime.async(function checkFine$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          //const userID = req.user.user_id;
          u_name = req.body.u_name;
          u_name_pattern = "%".concat(u_name, "%"); //console.log("userID",user_id);

          if (u_name) {
            _context13.next = 4;
            break;
          }

          return _context13.abrupt("return", res.status(400).json({
            message: "Please provide a valid user name"
          }));

        case 4:
          _context13.prev = 4;
          _context13.next = 7;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.query(query.isUserBannedQuery, u_name_pattern, function (error, result) {
              if (error) {
                console.error("Error checking if user is banned:", error);
                reject(error);
              } else {
                //console.log("User is banned, cannot borrow book");
                userId = result[0].user_id;
                resolve(result);
              }
            });
          }));

        case 7:
          isUserBannedResult = _context13.sent;

          if (!(isUserBannedResult.length > 0 && isUserBannedResult[0].user_status === 'banned')) {
            _context13.next = 11;
            break;
          }

          console.log("User is banned due to not submitting fine on time");
          return _context13.abrupt("return", res.status(403).json({
            message: "User is banned due to not submitting fine on time"
          }));

        case 11:
          _context13.next = 13;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.query(query.updateFineQuery, function (error, result) {
              if (error) {
                console.error("Error updating fines:", error);
                reject(error);
              } else {
                //console.log("Fine updated successfully");
                resolve(result);
              }
            });
          }));

        case 13:
          updateFineResult = _context13.sent;
          _context13.next = 16;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.query(query.banUser, function (error, result) {
              if (error) {
                console.error("Error banning users:", error);
                reject(error);
              } else {
                resolve(result);
              }
            });
          }));

        case 16:
          banUserResult = _context13.sent;
          _context13.next = 19;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.query(query.checkFineQuery, userId, function (error, result) {
              if (error) {
                console.error("Error checking fines:", error);
                reject(error);
              } else {
                if (result.length === 0) {
                  console.log("User did not borrow any book");
                  return res.json({
                    message: "User did not borrow any book"
                  });
                } else {
                  console.log("Fine details found");
                  resolve(result);
                }
              }
            });
          }));

        case 19:
          checkFineResult = _context13.sent;
          return _context13.abrupt("return", res.json(checkFineResult));

        case 23:
          _context13.prev = 23;
          _context13.t0 = _context13["catch"](4);
          console.error("Error while checking fines:", _context13.t0);
          return _context13.abrupt("return", res.status(500).json({
            message: "Error while checking fines"
          }));

        case 27:
        case "end":
          return _context13.stop();
      }
    }
  }, null, null, [[4, 23]]);
}

function checkAllUsersFine() {
  var updateFineResult, checkAllUserFineResult;
  return regeneratorRuntime.async(function checkAllUsersFine$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          _context14.next = 2;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.query(query.updateFineQuery, function (error, result) {
              if (error) {
                console.error("Error updating fines:", error);
                reject(error);
              } else {
                //console.log("Fine updated successfully");
                resolve(result);
              }
            });
          }));

        case 2:
          updateFineResult = _context14.sent;
          _context14.next = 5;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            try {
              connection.query(query.checkAllUserFineQuery, userId, function (error, result) {
                if (error) {
                  console.error("Error checking fines:", error);
                  reject(error);
                } else {
                  if (result.length === 0) {
                    console.log("User did not borrow any book");
                    return res.json({
                      message: "User did not borrow any book"
                    });
                  } else {
                    console.log("Fine details found");
                    resolve(result);
                  }
                }
              });
              return res.json(checkAllUserFineResult);
            } catch (error) {
              console.error("Error while checking fines:", error);
              return res.status(500).json({
                message: "Error while checking fines"
              });
            }
          }));

        case 5:
          checkAllUserFineResult = _context14.sent;

        case 6:
        case "end":
          return _context14.stop();
      }
    }
  });
}

function getAllBooks(req, res) {
  return regeneratorRuntime.async(function getAllBooks$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          connection.query(query.getAllBooksQuery, function (error, result) {
            if (error) {
              console.error("Error while getting all books", error);
              return res.status(500).json({
                error: error
              });
            }

            console.log("All books fetched successfully");
            return res.json(result);
          });

        case 1:
        case "end":
          return _context15.stop();
      }
    }
  });
}

function getBookAuthorDetails(req, res) {
  return regeneratorRuntime.async(function getBookAuthorDetails$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          connection.query(query.getBookAuthorDetailsQuery, function (error, result) {
            if (error) {
              console.error("Error while getting all authors", error);
              return res.status(500).json({
                error: error
              });
            }

            console.log("All authors details fetched successfully");
            return res.json(result);
          });

        case 1:
        case "end":
          return _context16.stop();
      }
    }
  });
}

function getAuthorDetails(req, res) {
  var a_name, a_name_pattern, author_id, checkAuthor, getAuthorResult;
  return regeneratorRuntime.async(function getAuthorDetails$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          a_name = req.body.a_name;

          if (a_name) {
            _context17.next = 3;
            break;
          }

          return _context17.abrupt("return", res.status(400).json({
            message: "Please provide a valid author name"
          }));

        case 3:
          a_name_pattern = "%".concat(a_name, "%");
          console.log("Pattern ", a_name_pattern);
          _context17.prev = 5;
          _context17.next = 8;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.query(query.checkAuthorQuery, [a_name], function (error, result) {
              if (error) {
                reject(error);
              } else if (result.length == 0) {
                console.log("Author does not exist");
                reject({
                  message: "Author does not exist"
                });
              } else {
                author_id = result[0].author_id;
                console.log("Author ID:", author_id);
                resolve(result);
              }
            });
          }));

        case 8:
          checkAuthor = _context17.sent;
          _context17.next = 11;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.query(query.getAuthorDetailsQuery, [author_id], function (error, result) {
              if (error) {
                console.error("Error while getting all authors", error);
                return res.status(500).json({
                  error: error
                });
              }

              console.log("Author details fetched successfully");
              return res.json(result);
            });
          }));

        case 11:
          getAuthorResult = _context17.sent;
          console.log("Author's of Book has been inserted successfully");
          return _context17.abrupt("return", res.status(201).json({
            message: "Author's of Book has been inserted successfully"
          }));

        case 16:
          _context17.prev = 16;
          _context17.t0 = _context17["catch"](5);
          console.error(_context17.t0);
          return _context17.abrupt("return", res.status(500).json({
            error: _context17.t0
          }));

        case 20:
        case "end":
          return _context17.stop();
      }
    }
  }, null, null, [[5, 16]]);
}

function getAllUserDetails(req, res) {
  return regeneratorRuntime.async(function getAllUserDetails$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          connection.query(query.getAllUsersDetailsQuery, function (error, result) {
            if (error) {
              console.error("Error while getting all users", error);
              return res.status(500).json({
                error: error
              });
            }

            console.log("All users details fetched successfully");
            return res.json(result);
          });

        case 1:
        case "end":
          return _context18.stop();
      }
    }
  });
}

function getUserDetails(req, res) {
  var u_name, u_name_pattern;
  return regeneratorRuntime.async(function getUserDetails$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          u_name = req.body.u_name;

          if (u_name) {
            _context19.next = 3;
            break;
          }

          return _context19.abrupt("return", res.status(400).json({
            message: "Please provide a valid user_id"
          }));

        case 3:
          u_name_pattern = "%".concat(u_name, "%");
          connection.query(query.getUserDetailQuery, u_name_pattern, function (error, result) {
            if (error) {
              console.error("Error while getting user details", error);
              return res.status(500).json({
                error: error
              });
            }

            console.log("User details fetched successfully");
            return res.json(result);
          });

        case 5:
        case "end":
          return _context19.stop();
      }
    }
  });
}

function returnBook(req, res) {
  var book_id, userID, values;
  return regeneratorRuntime.async(function returnBook$(_context20) {
    while (1) {
      switch (_context20.prev = _context20.next) {
        case 0:
          book_id = req.body.book_id;
          userID = req.user.user_id;
          values = [book_id, userID];
          connection.query(query.checkIfBorrowBookQuery, values, function (error, result) {
            if (error) {
              console.error("Error while returning book", error);
              return res.status(500).json({
                error: error
              });
            } else if (result.length === 0) {
              console.log("Book is not borrowed by you");
              return res.json({
                message: "Book is not borrowed by you"
              });
            } else if (result[0].STATUS === 'Returned') {
              console.log("Book is already returned");
              return res.json({
                message: "Book is already returned"
              });
            }

            connection.query(query.returnBookQuery, values, function (error, result) {
              if (error) {
                console.error("Error while returning book", error);
                return res.status(500).json({
                  error: error
                });
              } else {
                console.log("Book returned successfully");
                return res.json({
                  message: "Book returned successfully"
                });
              }
            });
          });

        case 4:
        case "end":
          return _context20.stop();
      }
    }
  });
}

function authenticateToken(req, res, next) {
  var authHeader, token, promise;
  return regeneratorRuntime.async(function authenticateToken$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          authHeader = req.headers["authorization"]; // is used to extract JSON Web Token from the Authorization header in an HTTP request.

          token = authHeader && authHeader.split(" ")[1]; // Checks if the token is present in the Authorization header, if not then it will short circuit and return undefined

          if (token) {
            _context21.next = 4;
            break;
          }

          return _context21.abrupt("return", res.status(401).json({
            message: "Access token not provided"
          }));

        case 4:
          promise = new Promise(function (resolve, reject) {
            jwt.verify(token, "".concat(process.env.JWT_SECRET), function (err, user) {
              //jwt.verify function takes the token and the secret, and it returns the payload if the signature is valid.
              if (err) {
                // console.error("Error while verifying token", err);
                // return res.status(403).json({ message: "Invalid token" });
                reject(err);
              } else {
                req.user = user;
                resolve();
              }
            });
          });
          _context21.prev = 5;
          _context21.next = 8;
          return regeneratorRuntime.awrap(promise);

        case 8:
          next();
          _context21.next = 15;
          break;

        case 11:
          _context21.prev = 11;
          _context21.t0 = _context21["catch"](5);
          console.error("Error while verifying token", _context21.t0);
          return _context21.abrupt("return", res.status(403).json({
            message: "Invalid token"
          }));

        case 15:
        case "end":
          return _context21.stop();
      }
    }
  }, null, null, [[5, 11]]);
}

module.exports = {
  register: register,
  login: login,
  showUsers: showUsers,
  addAuthors: addAuthors,
  authorDetails: authorDetails,
  authorDetailsWithMaxBooks: authorDetailsWithMaxBooks,
  searchBooks: searchBooks,
  insertBook: insertBook,
  insertBookAuthor: insertBookAuthor,
  delBook: delBook,
  updateBook: updateBook,
  borrowBook: borrowBook,
  checkFine: checkFine,
  checkAllUsersFine: checkAllUsersFine,
  getAllBooks: getAllBooks,
  getBookAuthorDetails: getBookAuthorDetails,
  getAuthorDetails: getAuthorDetails,
  getAllUserDetails: getAllUserDetails,
  getUserDetails: getUserDetails,
  returnBook: returnBook,
  authenticateToken: authenticateToken
};