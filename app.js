if(process.env.NODE_ENV != "production"){
    
require('dotenv').config();
}
 


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
const {listingSchema} = require("./schema.js");
const Review = require("./models/review.js");
const {reviewSchema} = require("./schema.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash"); 
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true})); //the data coming through request has to be parsed
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
})

store.on("err",()=>{
    console.log("ERROR in mongo session store",err)
});

const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
}



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new  LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



main().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(dbUrl);
}

app.listen(8080,()=>{
    console.log("server is listening to 8080");
});





// app.get("/testListing", async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 2000,
//         location: "Calangute, Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// })





// app.all("*",(req,res,next)=>{          //if user requests a page that does not exist, this error handles
//     next(new ExpressError(404, "Page not found!"));   // the error for all the pages that do not exist. 
// })                                                    //It will map the pages strating from above and if fails to match then throws an error

//error handling
app.use((err,req,res,next)=>{
    let {statusCode=500, message} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
    // res.send("something went wrong!");
})

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

//Saving a user to check authentication
app.get("/demouser", async (req,res)=>{
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "delta-student",
    });
    let registeredUser = await User.register(fakeUser, "helloworld"); //register() saves the user with iven username and password
    res.send(registeredUser);
});


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

