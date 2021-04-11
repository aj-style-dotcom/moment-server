var express = require('express');
var router = express.Router();
var User = require("../Models/Model");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var authenticator = require("../bin/middleweres");


const key = "this-is-my-key";



/* Registeration of user*/
router.post('/register', async function(req, res, next) {
  try {
    const {
     name, bio, username, password, email, dob, country, profile_pic
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
      bio:bio,
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


    res.cookie("token",token).send()
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
      httpOnly:true
    }).send({
      user:existinguser,
      token :token
    })
    

  } catch (e) {
    res.status(500).send(e)
  }
})


// logout 
router.get("/logout", (req, res)=> {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0)

  }).send("logged out")
})


// my private information
router.get("/myInfo", authenticator, (req, res)=>{
  User.findOne({_id:req.user._id}, (err, data)=>{
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(data)
    }
  })
})


//post moment

router.post("/post_moment", authenticator, (req, res)=>{
  const {postImageName, caption} = req.body
  User.findOneAndUpdate({_id:req.user._id}, {$push:{
    moments:{
      postImageName:postImageName,
      caption:caption
    }
  }},{new :true}, (err, data)=>{
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(data)
    }
  })
})

//delete moment 
router.post("/delete_moment", authenticator, (req, res)=>{
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

router.post("/update_moment", authenticator, (req, res)=>{
  const {moment_id, caption} = req.body
  User.updateOne({_id:req.user._id,
    "moments._id" : moment_id
  },{
    $set:{
      "moments.$.caption":caption
    }
  },
  {new :true},
  (err, data)=>{
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(data)
    }
  })
})


//request a bounding

router.get("/req-bound/:_id", authenticator, (req, res)=>{
  const personId = req.params._id
  const userId = req.user._id
  
  User.findOneAndUpdate({_id:userId},{$push:{
   requested_Bounds:{
     persion_id:personId
   }
  }},{new:true}, (err,data)=>{
    if (err) {
      res.status(500).send(err)
    } else {
      User.findOneAndUpdate({_id:personId}, {
        $push:{
   requesting_Bounds:{
     persion_id:userId
   }
  }
      }, (err, data)=>{
        if (err) {
          res.status(500).send(err)
        } else {
          res.send()
        }
      })
      
      
    }
  })
  
})


//delete requested bounding

router.get("/delete-req-bound/:_id", authenticator, (req ,res)=>{
  
  const personId = req.params._id
  const userId = req.user._id
  
  User.findOneAndUpdate({_id:userId},{$pull:{
    requested_Bounds:{
      persion_id:personId
    }
  }}, (err, data)=>{
    if (err) {
      res.status(500).send(err)
    } else {
      
      User.findOneAndUpdate({_id:personId},{
        $pull:{
          requesting_Bounds:{
            persion_id:userId
          }
        }
      },(err, data)=>{
        if (err) {
          res.status(500).send(err)
        } else {
          res.send()
        }
      })
      
    }
  })
  
})


//reject bounding request 

router.get("/reject-bound-req/:_id", authenticator, (req ,res)=>{
  
  const personId = req.params._id
  const userId = req.user._id
  
  User.findOneAndUpdate({_id:userId},{$pull:{
    requested_Bounds:{
      persion_id:personId
    }
  }}, (err, data)=>{
    if (err) {
      res.status(500).send(err)
    } else {
      
      User.findOneAndUpdate({_id:personId},{
        $pull:{
          requesting_Bounds:{
            persion_id:userId
          }
        }
      },(err, data)=>{
        if (err) {
          res.status(500).send(err)
        } else {
          res.send()
        }
      })
    }
  })
  
})


//accept bound request 

router.get("/accept-bound-req/:_id", authenticator, (req, res)=>{
  
  const personId = req.params._id
  const userId = req.user._id
  
  User.findOneAndUpdate({_id:userId}, {$push:{
    Boundings:{
      persion_id:personId
    }
  }}, (err, data)=>{
    if (err) {
      res.status(500).send(err)
    } else {
      
      User.findOneAndUpdate({_id:personId},{$push:{
        Boundings:{
          persion_id:userId
        }
      }
      },(err, data)=>{
        if (err) {
          res.status(500).send(err)
        } else {
          
          User.findOneAndUpdate({_id:userId},{$pull:{
            requesting_Bounds:{
              persion_id:personId
            }
          }}, (err, data)=>{
            if (err) {
              res.status(500).send(err)
            } else {
              
              User.findOneAndUpdate({_id:personId}, {
                $pull:{
                  requested_Bounds:{
                    persion_id:userId
                  }
                }
              }, (err, data)=>{
                if (err) {
                  res.status(500).send(err)
                } else {
                  res.send()
                }
              })
              
            }
          })
        }
      })
    }
  })
  
})


//get feeds 

router.get("/feeds", authenticator, async (req, res)=>{
  const userId = req.user._id
  var bounded_users = await User.findOne({_id:userId})
  var feedable_data = bounded_users.Boundings
  
  var feeds =[]
  
  for(let x of feedable_data){
   var uData = await User.findOne({_id:x.persion_id})
   
   x_moment = uData.moments
   
   feeds= feeds.concat(x_moment)
   
   
  }
  console.log(feeds)
  res.send(feeds)
  
})

module.exports = router;