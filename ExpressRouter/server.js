// EXPRESS
const express = require("express");
const app = express();
//Require COOKIE-PARSER
const cookieParser = require("cookie-parser");
//use COOKIE-PARSER
app.use(cookieParser("secretCode"));


// Root Route
app.get("/", (req, res) => {
    console.log(req.cookies);
    res.send("Hi! I am root, ExpressRouter");
});

// Creating a ROUTE for sending the cookie
app.get("/getcookies", (req, res) => {
    res.cookie("Greet_Key", "Namaste_Value");  // Valid cookie name
    res.cookie("MadeWithLove", "By Biplove"); // Valid cookie name
    res.send("Sent you some cookies!");
});

//Signed COOKIES
app.get("/getsignedcookie", (req,res)=>{
    res.cookie("MADE-IN", "INDIA", {signed: true});
    res.send("Signed Cookie sent");
});

//Verify the cookie is SIGNED COOKIE or not
app.get("/verify", (req, res)=>{
    console.log(req.signedCookies);
    res.send("VERIFIED");
});

// Setting up server
app.listen(3000, () => {
    console.log("Server is listening to 3000, ExpressRouter");
});
