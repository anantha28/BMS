var express=require("express");
var app=express=express();
var mongoose=require("mongoose");
var bodyParser=require("body-parser");
var User=require("./models/user");
var Book=require("./models/book");
var flash=require("connect-flash");

mongoose.connect("mongodb+srv://anantha28:anantha28@cluster1.nsdc3.mongodb.net/anantha28?retryWrites=true&w=majority",{useNewUrlParser: true});
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

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'duozkjp1p', 
  api_key: '722167338195677', 
  api_secret: 'E9riFMymF0Ue7tNh4dzjWJK_IXE'
});

app.use(function(req,res,next)
{
    res.locals.currentUser=req.user;
   res.locals.error=req.flash("error");
   res.locals.success=req.flash("success");
    next();
});

app.get("/",(req,res)=>{
   res.render("login.ejs");
});

app.get("/logout",function(req,res){
   req.logout();
   req.flash("success","Successfully logged you out");
   res.redirect("/");
});

app.get("/home",(req,res)=>{
    Book.find({},(err,all)=>{
        if(err)
        console.log(err);
        else{
            all.reverse();
        res.render("home.ejs",{all:all});
        }
    });
});
app.get("/addbook",isLoggedIn,(req,res)=>{
   
   res.render("newbook.ejs");
});
app.post("/addbook",isLoggedIn,upload.single('bookImage'),(req,res)=>{
     cloudinary.uploader.upload(req.file.path, function(result) {
  req.body.bookImage = result.secure_url;
   var user=req.user._id;
    var b={userId:user,description:req.body.description,price:req.body.price,author:req.body.author,published:req.body.published,bookImage:req.body.bookImage,name:req.body.name};
    Book.create(b,(err,created)=>{
        if(err)
        console.log(err);
        else{
            req.flash("success","Book Added Successfully");
           res.redirect("/addbook");
        }
    });
     });
   
});
app.post("/login",passport.authenticate("local",
{
  successRedirect:"/home",
  failureRedirect:"/",
  failureFlash:true,
  successFlash:true
}),function(req, res) {
   
});
app.get("/signup",(req,res)=>{
   res.render("signup.ejs");
});

app.post("/signup",function(req,res)
{
    var newUser=new User({username:req.body.username});
    User.register(newUser,req.body.password,function(err,users)
    {
        if(err){
        console.log(err);
        req.flash("error",""+err.message);
        return res.redirect("/signup");
        }
        else
        {
            passport.authenticate("local")(req,res,()=>{
            users.phoneNumber=req.body.phoneNumber;
            users.age=req.body.age;
            users.name=req.body.name;
            if(users.username==='admin@gmail.com'){
            users.admin=true;
            }
            users.save();
           req.flash("success","Welcome "+users.name);
           res.redirect("/home");
       });
        }
    });
});

app.get("/login",(req,res)=>{
   res.render("login.ejs");
});

app.get("/mybooks",isLoggedIn,(req,res)=>{
    var userId=req.user._id;
    Book.find({userId:userId},(err,books)=>{
        if(err)
        console.log(err);
        else{
            res.render("mybooks.ejs",{books:books});
        }
    });
});

app.get("/updatebook/:id",isLoggedIn,(req,res)=>{
  var id=req.params.id;
  Book.findById(id,(err,books)=>{
      if(err)
      console.log(err);
      else{
          res.render("updatebook.ejs",{books:books});
      }
  });
});

app.put("/updatebook/:id",isLoggedIn,(req,res)=>{
    var id=req.params.id;
     Book.findById(id,(err,bb)=>{
        if(err)
        console.log(err);
        else{
            bb.name=req.body.name;
            bb.price=req.body.price;
            bb.author=req.body.author;
            bb.published=req.body.published;
            bb.description=req.body.description;
            bb.save();
            req.flash("success","Deatils Updated Successfully");
            res.redirect("/mybooks");
        }
    });
});

app.delete("/updatebook/:id",isLoggedIn,(req,res)=>{
    var id=req.params.id;
    Book.findByIdAndRemove(id,(err,del)=>{
        if(err)
        console.log(err);
        else{
            req.flash("success","Book deleted Successfully");
            res.redirect("/mybooks");
        }
    });
});
app.get("/seeBookDetails/:id",isLoggedIn,(req,res)=>{
    var id=req.params.id;
    Book.findById(id,(err,bookk)=>{
        if(err)
        console.log(err);
        else{
            res.render("seeBookDetails.ejs",{bookk:bookk});
        }
    });
});

/*----------------------Admin Routes----------------------------------------*/

app.get("/allbooks",isAdminLoggedIn,(req,res)=>{
    Book.find({},(err,allbooks)=>{
        if(err)
        console.log(err);
        else{
            res.render("allbooks.ejs",{allbooks:allbooks});
        }
    });
});
app.get("/admin/dashboard",isAdminLoggedIn,(req,res)=>{
    res.render("adminDashboard.ejs");
});

app.get("/allusers",isAdminLoggedIn,(req,res)=>{
    User.find({},(err,users)=>{
        if(err)
        console.log(err);
        else{
            res.render("allusers.ejs",{users:users});
        }
    });
});

app.get("/makeadmin/:id",(req,res)=>{
    var id =req.params.id;
    User.findById(id,(err,foundUser)=>{
        if(err)
        console.log(err);
        else{
            foundUser.admin=true;
            foundUser.save();
            req.flash("success","User made Admin Successfully");
            res.redirect("/allusers");
        }
    });
});


function isLoggedIn(req,res,next){
    if(req.isAuthenticated())
    {   
        return next();
    }
     req.flash("error","Please login,Don't have an account? Please Sign Up");
    res.redirect("/");
   
}
function isAdminLoggedIn(req,res,next){
    if(req.isAuthenticated() )
    {   
        if(req.user.admin===true)
        return next();
        else{
             req.flash("error","You don't have the permission to do Admin Operations");
            res.redirect("/home");
        }
    }
    else{
        
     req.flash("error","Please login,Don't have an account? Please Sign Up");
    res.redirect("/");
   
    }
}

app.listen(process.env.PORT,process.env.IP,function(){
    console.log("BMS running");
});