"use strict";

//For JWT
var dotenv = require("dotenv");

dotenv.config();

var express = require("express");

var bodyParser = require("body-parser"); //to parse the incoming request bodies
/// const session = require('express-session'); //to store the session data on the server side


var connection = require("./database/dbcon.js"); // let router = require("./routes/routers.js");


var router = require("./routes/routes.js");

var app = express(); //creates an Express application

app.use(bodyParser.json()); //to parse the incoming request bodies

app.use(bodyParser.urlencoded({
  extended: true
})); //to parse the incoming request bodies

/*    Used to sign the session ID cookie

app.use(
  session({
    secret: "your-secret-key", //used to sign the session ID cookie
    resave: false, //forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false, //forces a session that is "uninitialized" to be saved to the store
  })
);

*/

app.use("/proj", router); //to use the router

app.listen(3000, function () {
  console.log("Server is running"); //to start a UNIX socket and listen for connections on the given path
});