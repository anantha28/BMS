var express=require("express");
var app=express=express();
var mongoose=require("mongoose");
var bodyParser=require("body-parser");

//mongoose.connect("mongodb://localhost/MMT_v7",{useNewUrlParser: true});
var passport=require("passport");
var localStrategy=require("passport-local");
var methodOverride=require("method-override");

app.use(methodOverride("_method"));

app.use(bodyParser.urlencoded({limit: '50mb',extended:true}));

app.use(require("express-session")({
    secret:"Book management",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

/*passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
*/

app.use(function(req,res,next)
{
    res.locals.currentUser=req.user;
    //res.locals.error=req.flash("error");
    //res.locals.success=req.flash("success");
    next();
});

app.get("/",(req,res)=>{
   res.render("login.ejs");
});

app.listen(process.env.PORT,process.env.IP,function(){
    console.log("BMS running");
});