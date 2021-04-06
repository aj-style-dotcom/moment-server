const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name:String,
    email: String,
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
            }]
        }
    ],
    Boundings:[{
        persion_id:String
    }],
    requested_Bounds:[{
        persion_id:String
    }],
    requesting_Bounds:[{
        persion_id:String
    }]
})

module.exports = User = mongoose.model("users", UserSchema);