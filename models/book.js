var mongoose=require("mongoose");
var BookSchema=new mongoose.Schema({
    name:String,
    author:String,
    published:String,
    price:Number,
    description:String,
    userId:String,
    bookImage:String
});

module.exports=mongoose.model("Book",BookSchema);