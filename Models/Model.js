const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name:String,
    email: String,
    bio: String,
    profile_pic :String,
    dob:String,
    email:String,
    country:String,
    username :{
        type : String,
        unique : true,
        requred :true
    },
    password : {
        type : String,
        requred :true
    },
    
    moments:[
        {
            postImageName :String,
            caption:String,
            date:Date,
            likes:{
                type:Number,
                default:0
            },
            comments:[{
                date:Date,
                commenter_id : String,
                comments:String
            },{timestamps:true}]
        },
        {
          timestamps:true
        }],
    Boundings:[{
        date:Date,
        persion_id:String
    },{timestamps:true}],
    requested_Bounds:[{
        date:Date,
        persion_id:String
    },{timestamps:true}],
    requesting_Bounds:[{
        date:Date,
        persion_id:String
    },{timestamps:true}]
}, {timestamps:true})

module.exports = User = mongoose.model("users", UserSchema);