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
            user_id:String,
            user_username:String,
            user_dp:String,
            postImageName :String,
            caption:String,
            date:{
              type:Date,
              default : Date
            },
            liked_by :[{
              persion_id:String
            }],
            comments:[{
                date:{
              type:Date,
              default : Date
            },
                persion_id : String,
                comment:String
            }],
        }],
    Boundings:[{
        date:{
              type:Date,
              default : Date
            },
        persion_id:String
    }],
    requested_Bounds:[{
        date:{
              type:Date,
              default : Date
            },
        persion_id:String
    }],
    requesting_Bounds:[{
        date:{
              type:Date,
              default : Date
            },
        persion_id:String
    }]
}, {timestamps:true})

module.exports = User = mongoose.model("users", UserSchema);