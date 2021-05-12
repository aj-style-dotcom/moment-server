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
       const token = jwt.sign({
      _id: data._id
    }, key)
    res.cookie("token",token).send({
      user:data,
      token :token
    }) }
     });


 
  } catch (e) {
    res.status(500).send(e)
  }
});



// login of user

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

//update profile 

router.put("/update-profile", authenticator, async (req, res)=>{
  
  const me = await User.findOne({_id:req.user._id})
  
  const name = req.body.name || me.name
  const bio = req.body.bio || me.bio
  const email = req.body.email || me.email
  const dob = req.body.dob || me.dob
  const profile_pic = req.body.profile_pic || me.profile_pic
  const country = req.body.country || me.country
  
  User.updateOne({_id:req.user._id}, {
    name:name,
    bio:bio,
    email:email,
    dob:dob,
    profile_pic:profile_pic,
    country:country
  }, (err, data)=>{
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(data)
    }
  })
  
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

router.post("/post-moment", authenticator, async (req, res)=>{
  const {postImageName, caption} = req.body
  
  var userData = await User.findOne({_id:req.user._id})
  
  User.findOneAndUpdate({_id:req.user._id}, {$push:{
    moments:{
      user_id:userData._id,
      user_username:userData.username,
      user_dp:userData.profile_pic,
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
router.post("/delete_moment/:_id", authenticator, (req, res)=>{
  const moment_id = req.params._id
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

router.put("/update_moment", authenticator, (req, res)=>{
  const {moment_id, caption} = req.body
  User.updateOne({_id:req.user._id,
    "moments._id" : moment_id
  },{
    $set:{
      "moments.$.caption":caption
    }
  },
  (err, data)=>{
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(data)
    }
  })
})

//react on a moment

router.post("/react", authenticator, (req, res)=>{
  const {
    reaction, persion_id, moment_id
  } = req.body;
  
  if (reaction=="like") {
    
    User.updateOne({_id:persion_id, "moments._id":moment_id}, {
        $push:{
          "moments.$.liked_by":{
            persion_id:persion_id
          }
        }
    }, (err, data)=>{
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(data)
    }
  })
    
  } else if(reaction=="dislike") {
    
    User.updateOne({_id:persion_id,
    "moments._id" : moment_id}, {
      $pull:{
        "moments.$.liked_by":{
            persion_id:persion_id
          }
      }
    }, (err, data)=>{
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(data)
    }
  })
  
  } else{
    res.status(404).send("wtf")
  }
  
})


//create comment

router.post("/create-comment", authenticator, (req, res)=>{
  const {
    comment, persion_id, moment_id
  } = req.body;
  const userId = req.user._id
  
  User.updateOne({_id:persion_id, "moments._id":moment_id},{
    $push:{
      "moments.$.comments":{
          persion_id:userId,
          comment: comment
          }
        }
  },(err, data)=>{
    if (err) {
      res.status(500).send("wtf")
    } else {
      res.send()
    }
  })
  
})


// delete comment

router.post("/delete-comment", authenticator, (req, res)=>{
  const {
    persion_id, moment_id
  } = req.body;
  const userId = req.user._id
  
  User.updateOne({_id:persion_id, "moments._id":moment_id},{
    $pull:{
      "moments.$.comments":{
          persion_id:userId,
          }
        }
  },(err, data)=>{
    if (err) {
      res.status(500).send("wtf")
    } else {
      res.send()
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
  }}, (err,data)=>{
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

router.get("/delete-req-bound/:_id", authenticator, async (req ,res)=>{
  
  const personId = req.params._id
  const userId = req.user._id
  
//  var test = await User.findOne({_id:userId, ""})
  
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
  var myMoments = bounded_users.moments
  var feedable_data = bounded_users.Boundings
  
  var feeds =[]
  
  for(let x of feedable_data){
   var uData = await User.findOne({_id:x.persion_id})
   x_moment = uData.moments
   feeds= feeds.concat(x_moment)
  }
  feeds=feeds.concat(myMoments)
  res.send(feeds)
  
})

module.exports = router;