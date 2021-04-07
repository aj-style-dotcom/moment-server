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




router.get("temp-info/:_id", (req, res)=>{
 
})


module.exports = router;