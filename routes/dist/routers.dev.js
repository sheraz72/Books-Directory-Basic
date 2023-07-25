"use strict";

require("dotenv").config();

var express = require("express"); //to create an Express application


var router = express.Router(); //to create a new router object

var connection = require("../database/dbcon.js"); //to create a connection with the database


var query = require("../database/queries.js"); //to write the queries
// For JWT


var bcrypt = require("bcrypt"); //to hash the password


var jwt = require("jsonwebtoken"); //to create a JSON Web Token
// const dotenv = require('dotenv');
// dotenv.config();


router.post("/register/", function _callee(req, res) {
  var _req$body, U_NAME, EMAIL, ROLE, PASSWORD, hashedPassword, values, promise;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, U_NAME = _req$body.U_NAME, EMAIL = _req$body.EMAIL, ROLE = _req$body.ROLE, PASSWORD = _req$body.PASSWORD; //recieve the data from the request body

          if (!(U_NAME == null || EMAIL == null || ROLE == null || PASSWORD == null)) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: "Please enter all the fields"
          }));

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(bcrypt.hashSync(PASSWORD, 10));

        case 5:
          hashedPassword = _context.sent;
          //hash the password, 10 is the saltRounds
          values = [U_NAME, EMAIL, ROLE, hashedPassword]; //values to be inserted in the database

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
          _context.prev = 8;
          _context.next = 11;
          return regeneratorRuntime.awrap(promise);

        case 11:
          res.send("User Registered Successfully");
          _context.next = 18;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](8);
          console.error("Error while registering the user", _context.t0);
          res.status(500).json({
            message: "Error while registering the user"
          });

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[8, 14]]);
}); //for login

router.post("/login/", function _callee2(req, res) {
  var _req$body2, EMAIL, PASSWORD, promise, result;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body2 = req.body, EMAIL = _req$body2.EMAIL, PASSWORD = _req$body2.PASSWORD;

          if (EMAIL == null || PASSWORD == null) {
            res.status(400).json({
              message: "Please enter all the fields"
            });
          }

          promise = new Promise(function (resolve, reject) {
            connection.query(query.loginUserQuery, [EMAIL], function (error, result) {
              if (error) {
                reject(error); // console.log("Error while logging in", error);
                // return res.status(500).json({ message: "Error while logging in" });
              } else if (result.length === 0) {
                // console.log("User does not exist");
                // return res.status(401).json({ message: "User does not exist" }); //401: Unauthorized, user does not exist
                reject({
                  message: "User does not exist"
                });
              } else {
                var user = result[0]; //as email is unique, only one user will be returned
                //compare the password entered with the hashed password in the database

                bcrypt.compare(PASSWORD, user.PASSWORD, function (err, isMatch) {
                  if (err) {
                    reject(err); // console.log("Error while comparing the passwords", err);
                    // res
                    //   .status(500)
                    //   .json({ message: "Error while comparing the passwords" });
                  } else if (!isMatch) {
                    reject({
                      message: "Invalid Credentials or Hashed Password not found"
                    }); // return res.status(401).json({
                    //   message: "Invalid Credentials or Hashed Password not found",
                    // });
                  } else {
                    var tokenPayload = {
                      email: EMAIL,
                      role: user.ROLE,
                      exp: Math.floor(Date.now() / 1000) + 60 * 10 //it will expire after 10 minutes

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
          _context2.prev = 3;
          _context2.next = 6;
          return regeneratorRuntime.awrap(promise);

        case 6:
          result = _context2.sent;
          return _context2.abrupt("return", res.json(result));

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](3);
          console.error("Error while logging in", _context2.t0);
          return _context2.abrupt("return", res.status(500).json({
            message: "Error while logging in"
          }));

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[3, 10]]);
}); //payload is the data that is stored inside the token
//jwt.sign function takes the payload and the secret, and it returns a JWT as a string.

router.post("/insertBook/", authenticateToken, function _callee3(req, res) {
  var _req$body3, BNAME, AUTHORS, GENRE, userRole, promise;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$body3 = req.body, BNAME = _req$body3.BNAME, AUTHORS = _req$body3.AUTHORS, GENRE = _req$body3.GENRE; // const userRole = req.body.role; // Get the user role from the request body

          userRole = req.user.role;

          if (!(userRole !== "admin")) {
            _context3.next = 4;
            break;
          }

          return _context3.abrupt("return", res.status(403).json({
            message: "Sorry, you are not an admin"
          }));

        case 4:
          if (!(!BNAME || !AUTHORS || !GENRE)) {
            _context3.next = 6;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: "Please enter all the fields"
          }));

        case 6:
          promise = new Promise(function (resolve, reject) {
            var values = [BNAME, AUTHORS, GENRE];
            connection.query(query.insertBookQuery, [values], function (error, result) {
              if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                  //return res.status(409).json({ message: "Book Already Exists" });
                  reject({
                    message: "Book Already Exists"
                  });
                } else {
                  reject(error);
                }
              } else {
                resolve(result);
              }
            });
          });
          _context3.prev = 7;
          _context3.next = 10;
          return regeneratorRuntime.awrap(promise);

        case 10:
          return _context3.abrupt("return", res.status(201).json({
            message: "Book inserted successfully"
          }));

        case 13:
          _context3.prev = 13;
          _context3.t0 = _context3["catch"](7);
          console.error("Error while inserting the book", _context3.t0);
          return _context3.abrupt("return", res.status(500).json({
            message: "Error while inserting the book"
          }));

        case 17:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[7, 13]]);
});
router["delete"]("/delBook/", authenticateToken, function _callee4(req, res) {
  var _req$body4, BID, BNAME, AUTHORS, GENRE, userRole, promise;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$body4 = req.body, BID = _req$body4.BID, BNAME = _req$body4.BNAME, AUTHORS = _req$body4.AUTHORS, GENRE = _req$body4.GENRE; // const userRole = req.body.role; // Get the user role from the request body

          userRole = req.user.role;

          if (!(userRole !== "admin")) {
            _context4.next = 4;
            break;
          }

          return _context4.abrupt("return", res.status(403).json({
            message: "Sorry, you are not an admin"
          }));

        case 4:
          if (!(!BID && !BNAME && !AUTHORS && !GENRE)) {
            _context4.next = 6;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: "Please enter at least one field"
          }));

        case 6:
          promise = new Promise(function (resolve, reject) {
            connection.query(query.delBookQuery, [BID, BNAME, AUTHORS, GENRE], function (error, result) {
              if (error) {
                console.error("Error while deleting the book", error);
                reject(error); // return res
                //   .status(500)
                //   .json({ message: "Error while deleting the book" });
              } else {
                resolve(result);
              }
            });
          });
          _context4.prev = 7;
          _context4.next = 10;
          return regeneratorRuntime.awrap(promise);

        case 10:
          return _context4.abrupt("return", res.json({
            message: "Book deleted successfully"
          }));

        case 13:
          _context4.prev = 13;
          _context4.t0 = _context4["catch"](7);
          console.error("Error while deleting the book", _context4.t0);
          return _context4.abrupt("return", res.status(500).json({
            message: "Error while deleting the book"
          }));

        case 17:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[7, 13]]);
});
router.put("/updateBook/", authenticateToken, function _callee5(req, res) {
  var _req$body5, BID, BNAME, AUTHORS, GENRE, userRole, promise;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _req$body5 = req.body, BID = _req$body5.BID, BNAME = _req$body5.BNAME, AUTHORS = _req$body5.AUTHORS, GENRE = _req$body5.GENRE; // const userRole = req.body.role; // Get the user role from the request body

          userRole = req.user.role;

          if (!(userRole !== "admin")) {
            _context5.next = 4;
            break;
          }

          return _context5.abrupt("return", res.status(403).json({
            message: "Sorry, you are not an admin"
          }));

        case 4:
          if (!(!BID || !BNAME || !AUTHORS || !GENRE)) {
            _context5.next = 6;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            message: "Please enter all the fields"
          }));

        case 6:
          promise = new Promise(function (resolve, reject) {
            connection.query(query.updateBookQuery, [BNAME, AUTHORS, GENRE, BID], function (error, result) {
              if (error) {
                console.error("Error while updating the book", error);
                reject(error); // return res
                //   .status(500)
                //   .json({ message: "Error while updating the book" });
              } else {
                resolve(result);
              }
            });
          });
          _context5.prev = 7;
          _context5.next = 10;
          return regeneratorRuntime.awrap(promise);

        case 10:
          return _context5.abrupt("return", res.json({
            message: "Book updated successfully"
          }));

        case 13:
          _context5.prev = 13;
          _context5.t0 = _context5["catch"](7);
          console.error("Error while updating the book", _context5.t0);
          return _context5.abrupt("return", res.status(500).json({
            message: "Error while updating the book"
          }));

        case 17:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[7, 13]]);
});
router.get("/searchBook/", function _callee6(req, res) {
  var _req$body6, BNAME, AUTHORS, GENRE, promise, result;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _req$body6 = req.body, BNAME = _req$body6.BNAME, AUTHORS = _req$body6.AUTHORS, GENRE = _req$body6.GENRE;

          if (!(!BNAME && !AUTHORS && !GENRE)) {
            _context6.next = 3;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            message: "Please enter at least one field"
          }));

        case 3:
          promise = new Promise(function (resolve, reject) {
            connection.query(query.getBooksQuery, [BNAME, AUTHORS, GENRE], function (error, result) {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            });
          });
          _context6.prev = 4;
          _context6.next = 7;
          return regeneratorRuntime.awrap(promise);

        case 7:
          result = _context6.sent;
          return _context6.abrupt("return", res.json(result));

        case 11:
          _context6.prev = 11;
          _context6.t0 = _context6["catch"](4);
          console.error("Error while searching the book", _context6.t0);
          return _context6.abrupt("return", res.status(500).json({
            message: "Error while searching the book"
          }));

        case 15:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[4, 11]]);
}); //  console.error("Error while searching the book", error);
//         return res
//           .status(500)
//           .json({ message: "Error while searching the book" });
//       return res.json(result);

function authenticateToken(req, res, next) {
  var authHeader, token, promise;
  return regeneratorRuntime.async(function authenticateToken$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          authHeader = req.headers["authorization"]; // is used to extract JSON Web Token from the Authorization header in an HTTP request.

          token = authHeader && authHeader.split(" ")[1]; // Checks if the token is present in the Authorization header, if not then it will short circuit and return undefined

          if (token) {
            _context7.next = 4;
            break;
          }

          return _context7.abrupt("return", res.status(401).json({
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
          _context7.prev = 5;
          _context7.next = 8;
          return regeneratorRuntime.awrap(promise);

        case 8:
          next();
          _context7.next = 15;
          break;

        case 11:
          _context7.prev = 11;
          _context7.t0 = _context7["catch"](5);
          console.error("Error while verifying token", _context7.t0);
          return _context7.abrupt("return", res.status(403).json({
            message: "Invalid token"
          }));

        case 15:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[5, 11]]);
}

module.exports = router;