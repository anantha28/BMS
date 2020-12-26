var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var UserSchema=new mongoose.Schema({
    email:String,
    name:String,
    password:String,
   phoneNumber:String,
   age:Number
});

UserSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",UserSchema);