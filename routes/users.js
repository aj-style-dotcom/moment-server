var express = require('express');
var router = express.Router();
var User = require("../Models/Model");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var authenticator = require("../bin/middleweres");


const key = "this-is-my-key";


const authenticateJWT = async (req, res, next)=>{
  const token = req.cookies.token || ""
  console.log(token)
  if(!token){
    return res.status(400).send("login first")
  }
  try {
    const decrypt = await jwt.verify(token, key)
    console.log(decrypt)
    
    req.user={
      _id :decrypt._id
    }
    next();
  } catch (e) {}
}






/* Registeration of user*/
router.post('/register', async function(req, res, next) {
  try {
    const {
     name, username, password, email, dob, country, profile_pic
    } = req.body;
    
    
    const existinguser = await User.findOne({
      username
    })
    if (existinguser) {
      return res.status(400).send("user already exists")
    }

    //hash password ....

    const salt = await bcrypt.genSalt();

    const hasPass = await bcrypt.hash(password, salt);

    //saving users to database

    const newUser = new User({
      username: username,
      password: hasPass,
      email: email,
      name:name,
      dob:dob,
      country:country,
      profile_pic:profile_pic
    })

   newUser.save((err, data)=>{
     if (err) {
       res.status(400).send(err)
     } else {
       
           // generation of token

       const token = jwt.sign({
      _id: data._id
    }, key)


    res.cookie("token", token, {
      httpOnly: true
    }).send()
      /*{
      user:savedUser,
      token :token
    })*/
     }
     
   });


 
  } catch (e) {
    res.status(500).send(e)
  }
});



/* login of user*/

router.post("/login", async (req, res)=> {
  try {
    const {
      username,
      password
    } = req.body;

    if (!username || !password) {
      return res.status(400).send("fill all fields")
    }

    const existinguser = await User.findOne({
      username
    })

    if (!existinguser) {
      return res.status(400).send("user is not registered")
    }

    const correctPass = await bcrypt.compare(password, existinguser.password)

    if (!correctPass) {
      return res.status(400).send("wrong password")
    }


    const token = jwt.sign({
      _id: existinguser._id
    }, key)


    res.cookie("token", token, {
      httpOnly: true
    }).send(existinguser)
    /*  {
      user:existinguser,
      token :token
    })*/
    

  } catch (e) {
    res.status(500).send(e)
  }
})


router.get("/logout", (req, res)=> {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0)

  }).send("logged out")
})


router.get("/myInfo", authenticateJWT, (req, res)=>{
  User.findOne({_id:req.user._id}, (err, data)=>{
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(data)
    }
  })
})


//post moment

router.post("/post_moment", authenticateJWT, (req, res)=>{
  const {postImageName, caption} = req.body
  User.findOneAndUpdate({_id:req.user._id}, {$push:{
    moments:{
      postImageName:postImageName,
      caption:caption
    }
  }}, (err, data)=>{
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(data)
    }
  })
})

//delete moment 
router.post("/delete_moment", authenticateJWT, (req, res)=>{
  const {moment_id} = req.body
  User.findOneAndUpdate({_id:req.user._id}, {$pull:{
    moments:{
      _id:moment_id
    }
  }}, (err, data)=>{
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(data)
    }
  })
})

//update moment

router.post("/update_moment", authenticateJWT, (req, res)=>{
  const {moment_id, caption} = req.body
  User.findOneAndUpdate({_id:req.user._id},
  {
    
  },
  (err, data)=>{
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(data)
    }
  })
})



module.exports = router;