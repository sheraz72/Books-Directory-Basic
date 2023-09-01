//For JWT
const dotenv = require("dotenv");
dotenv.config();

let express = require("express");
let bodyParser = require("body-parser"); //to parse the incoming request bodies
/// const session = require('express-session'); //to store the session data on the server side
let connection = require("./database/dbcon.js");
// let router = require("./routes/routers.js");
let router = require("./routes/routes.js");

let app = express(); // Create an instance of the Express.js application
app.use(bodyParser.json()); // Middleware: Parse incoming JSON requests and attach the parsed data to the 'req.body' object.

// Middleware: Parse incoming URL-encoded form data and attach the parsed data to the 'req.body' object.
// The 'extended' option set to 'true' allows for parsing of rich objects and arrays.
app.use(bodyParser.urlencoded({ extended: true }));

/*    Used to sign the session ID cookie

app.use(
  session({
    secret: "your-secret-key", //used to sign the session ID cookie
    resave: false, //forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false, //forces a session that is "uninitialized" to be saved to the store
  })
);

*/

//use() is used to execute all the incoming requests to the root path,
// & router is used to group related route handlers together and manage routes for specific paths.
app.use("/", router); 

app.listen(3000, function () {
  console.log("Server is running"); //to start a UNIX socket and listen for connections on the given path
});
