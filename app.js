//EXPRESS
const express= require("express");
const app=express();
//Using Router
const router = express.Router();
const path = require("path");
app.use(express.urlencoded({ extended: true }));
//REQUIRING THE METHOD OVERRIDE package so that we can use the PUT REQUEST with the update route
const methodOverride= require("method-override");
app.use(methodOverride('_method'));
//Requiring and using the ejs-mate for templating 
const ejsMate= require('ejs-mate');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname,"/public")));
//Error handling using wrapAsync - using try and catch block
const wrapAsync = require("./utils/wrapAsync.js");
//Require ExpressError.js for Error Handling
const ExpressError= require("./utils/ExpressError.js");
//Require Express-session
const session = require('express-session');
//Require CONNECT-FLASH to send flash messages
const flash = require("connect-flash");
//Requiring Passport so that we can do authentication and authorization securely
const passport = require("passport");
const localStrategy = require("passport-local");
//User model so that we can use it for signup & login
const User = require("./models/user.js");
//Use FLASH
app.use(flash());
//Importing IsLoggedin Middleware to check whether the user is logged in or not
const {isLoggedIn, saveRedirectUrl} = require("./middleware.js");

app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
});

//Importing Transaction Schema 
const TransactionModel = require('./TransactionSchema.js');

// app.get('/testtransactions', async (req, res)=>{
//     let sampleTransaction = new TransactionModel({
//         transaction: "Bank Transfer",
//         amount: 600000,
//         date: "2025/02/18",
//         cardholder: "Suresh",
//         bank: "BOB",
//         cardNumber: "3456",
//         expiry: "07/30",
//         cardType: "AMEX (2.5%)"
//     });
//     await sampleTransaction.save();
//     console.log("Sample was saved.");
//     res.send("Successful Testing.");
// });


//MONGOOSE
const mongoose=require("mongoose");

//Using Express-Sesson - to keep the user logged in for desired time
//SESSION-OPTIONS
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true
    }
};
//Use EXPRESS-SESSION
app.use(session(sessionOptions));

//INITIALIZING PASSPORT
app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new localStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user; // Makes user data available in all EJS views
    next();
});


app.get('/', (req, res)=>{
    res.render('home.ejs')
});

//DATABASE CONNECTION SETUP with MONGOOSE
const MONGO_URL="mongodb://127.0.0.1:27017/instamudraa";

async function main(){
    await mongoose.connect(MONGO_URL);
}

//CALLING THE main() function
main()
    .then(()=>{
        console.log("connected to DataBase.");
    })
    .catch((err)=>{
        console.log(err);
    });


//Middleware for res.flash using res.local
app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    next();
});
app.use((req, res, next)=>{
    res.locals.failure = req.flash("failure");
    next();
});


//Setting the ROUTES
//INDEX ROUTE (/transactions table)
app.get("/transactions", isLoggedIn, async (req, res)=>{
    const allTransactions= await TransactionModel.find({}).populate("contributor", "username"); // Populate contributor's username only
    res.render("./transactions/index.ejs", {allTransactions});
});

//Route to Create New Transaction
//NEW ROUTE
app.get("/transactions/new", isLoggedIn, (req, res)=>{
    res.render("transactions/new.ejs");
});
//CREATE ROUTE
app.post("/transactions", wrapAsync(async (req, res) => {
    
        if(!req.body.transaction){
            throw new ExpressError(400, "Send valid data for transaction.");
        }
        const newTransaction = new TransactionModel(req.body.transaction);
        newTransaction.contributor = req.user._id; // Associate transaction with logged-in user

        await newTransaction.save();
        req.flash("success", "New Transaction Saved!");
        res.redirect("/transactions");
    
    
}));

//Edit and Update
//Edit Route
app.get("/transactions/:id/edit", async (req,res)=>{
    let {id} = req.params;
    const transaction= await TransactionModel.findById(id);
    res.render("transactions/edit.ejs", {transaction});
}); 

//UPDATE Route
app.put("/transactions/:id", isLoggedIn, async (req, res)=>{
    let {id} = req.params;
    await TransactionModel.findByIdAndUpdate(id, {...req.body.transaction});
    req.flash("success", "Transaction Edited Successfully.");
    res.redirect("/transactions");
});

//Delete Route
app.delete("/transactions/:id", async (req, res) => {
    try {
        let { id } = req.params;
        await TransactionModel.findByIdAndDelete(id);
        req.flash("failure", "Transaction Deleted Successfully."); //Failure is used to show deletion only
        res.redirect("/transactions");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting transaction");
    }
});

// Error Handler for the CREATE ROUTE
app.use((err, req, res, next)=>{
    let {statusCode = 500, message = "Something went wrong"}= err;
    // res.status(statusCode);
    // res.send(message);
    res.render("error.ejs", {err});
}); 
 

// //DEMO USER
// app.get("/demouser", async (req, res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

//User login & Signup Routes
//SIGNUP ROUTE
app.get("/signup", (req, res)=>{
    res.render("users/signup.ejs")
});
//POST SIGNUP
app.post("/signup", wrapAsync(
    async(req, res)=>{
        try{
            let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.flash("success", "Welcome to Instamudra Tally Dashboard!");
        res.redirect("/transactions");
        }
        catch(e){
            console.log(e.message);
            req.flash("error", e.message);
            res.redirect("/signup");
        }
})
);

//LOGIN ROUTES
//LOGIN 
//GET REQUEST
app.get("/login", (req, res)=>{
    res.render("users/login.ejs");
});

//POST REQUEST
app.post("/login", saveRedirectUrl, passport.authenticate("local", {failureRedirect: '/login', failureFlash: true}), async(req, res)=>{
    req.flash("success", "Welcome back to Instamudra Tally Dashboard!");
    //Redirect after login to the page which the user was trying to access before loggin ih
    //Use the VARIABLE "redirectUrl" to get the path or the route
    let redirectUrl = res.locals.redirectUrl || "/transactions";
    res.redirect(redirectUrl);
});

//LOGOUT
app.get("/logout", (req, res, next)=>{
    req.logout((err)=>{
        return next(err);
    })
    req.flash("success", "you are logged out!");
    res.redirect("/");
});