var express = require("express");
var router = express.Router()
var Users = require("../Models/Model")

router.get("/allUser", (req, res)=>{
  Users.find({}, (err, data)=>{
    if (err) {
      return res.status(500).send(err)
      
    } else {
      return res.send(data)
    }
  })
})




router.get("/id", (req, res)=>{
 User.findOne({_id:req.paramd._id},(err, data=>{
   if (err) {
     return res.status(500).send(err)
   } else {
     return res.send({
       username:data.username,
       profile_pic:data.profile_pic
     })
   }
 }))
})


module.exports = router;