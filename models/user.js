var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var UserSchema=new mongoose.Schema({
    username:String,
    name:String,
    password:String,
   phoneNumber:String,
   age:Number,
   admin:{
       type:Boolean,
       default:false
   }
});

UserSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",UserSchema);