if( process.env.NODE_ENV != "production"){
    require('dotenv').config();
}




const express = require("express");
const { saveRedirectUrl } = require("./middleware.js"); // Add this line to import the middleware
const app = express();
const mongoose = require("mongoose");

const path= require("path");
const methodOverride = require("method-override");
const ejsMeta= require("ejs-mate")

const ExpressError = require("./utlis/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")


const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/dburl";

const dburl = process.env.ATLASDB_URL;

main ()
.then((res)=>{
    console.log("connect to db")
})
.catch((err)=>{
    console.log(err);
})

async function main (){
    await mongoose.connect(MONGO_URL)
}

app.set("view engine" ,"ejs");
app.set("views" , path.join(__dirname , "views"))
app.use(express.urlencoded({extended : true}))
app.use(methodOverride("_method"));
app.engine("ejs", ejsMeta);
app.use(express.static(path.join(__dirname,"/public")));


// const store = MongoStore.create({
//     mongoUrl : dburl ,
//     crypto :{
//         secret : "secret",
//     },
//     touchAfter : 24 * 3600,
// })

// store.on("error" , ()=>{
//     console.log("error in mongo session" , err);
// })


const sessionOptions ={
    // store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : false,
   cookie:{
    expires: Date.now() + 7*24 *60*60 *1000,
    maxAge: 7*24 *60*60 *1000,
    httpOnly: true
   },

};

// app.get("/",(req,res)=>{
//     res.send("hi im root");
// })
 


// Test route to verify user creation and authentication
app.get("/testauth", async (req, res) => {
    try {
        // Create test user
        const testUser = new User({
            username: "testuser",
            email: "test@example.com"
        });
        const registeredUser = await User.register(testUser, "testpassword");
        console.log("Test user created:", registeredUser);

        // Authenticate test user
        req.logIn(registeredUser, (err) => {
            if (err) {
                console.error("Login error:", err);
                return res.status(500).send("Login failed");
            }
            console.log("Test user authenticated:", req.user);
            res.send(`Test user authenticated: ${req.user.username}`);
        });
    } catch (err) {
        console.error("Test auth error:", err);
        res.status(500).send("Test authentication failed");
    }
});



app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})



app.use("/listings" , listingRouter);


app.use("/listings/:id/reviews", reviewRouter);
app.use(saveRedirectUrl); // Add this line to use the saveRedirectUrl middleware
app.use("/", userRouter);









app.all("*", (req,res ,next)=>{
    console.log(`Request received: ${req.method} ${req.originalUrl}`); // Log incoming requests
    next(new ExpressError(404, "page not found"));
})

app.use((err,req,res,next)=>{
    let {statusCode = 500, message = "something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{message})
    // res.status(statusCode).send(message)
})
 
app.listen(8080,()=>{
    console.log("app is listen on port 8080")
})