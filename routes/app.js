var express = require('express');
var router = express.Router();
var User = require("../Models/Model");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var checkUser = require("../bin/appMiddlewere");
var uploadFilesMiddleware = require("../bin/mediaHelper");
var multer = require("multer");
var fs = require("fs");
var path = require('path');



const key = "this-is-my-key";


//get login
router.get("/login", (req, res)=>{
  res.render('login')
})

//post login
router.post("/login", async (req, res)=>{
  const username= req.body.username
  const password= req.body.password
  
  if (!username || !password) {
      return res.render('login', {message:"all fields required"})
    }
  const existinguser = await User.findOne({
      username:username
    })
  if (!existinguser) {
      return res.render('login', {message:"user does not exists"})
    }
  
  const correctPass = await bcrypt.compare(password, existinguser.password)

    if (!correctPass) {
      return res.render('login', {message:"wrong password"})
    }
    
    req.session.user= existinguser._id
   
   //console.log(existinguser)
   res.redirect('/')
})


//get register
router.get("/register", (req, res)=>{
  return res.render('register')
})

//post register
router.post("/register", async  (req, res)=>{
  const username= req.body.uname
  const password= req.body.pword
  const name= req.body.name
  const email= req.body.email
  const bio= req.body.bio
  const country= req.body.country
  const dob= req.body.dob
    
  const existinguser = await User.findOne({
      username:username
    })
    if (existinguser) {
      return res.render('register', {message:"user already exists"})
    }
    
  const salt = await bcrypt.genSalt();

  const hasPass = await bcrypt.hash(password, salt);
  
  const newUser = new User({
      username: username,
      password: hasPass,
      email: email,
      name:name,
      bio:bio,
      dob:dob,
      country:country
    })
  
  newUser.save((err, data)=>{
     if (err) {
       return res.render('register', {message:err})
     } else {
       const token = jwt.sign({
      _id: data._id
    }, key)
    req.session.user=data._id
      res.redirect("/")
     }});
})

//logout user
router.get("/logout", (req, res)=>{
  req.session.destroy((err) => {
  res.redirect('/login') 
})
})

//get index
router.get("/", checkUser, async (req, res)=>{
  feeds=[]
  const userId = req.session.user
  
  var bounded_users = await User.findOne({_id:userId}).lean()
  
  var myMoments = bounded_users.moments
  var feedable_data = bounded_users.Boundings
  
  for(let x of feedable_data){
   var uData = await User.findOne({_id:x.persion_id}).lean()
   x_moment = uData.moments
   feeds= feeds.concat(x_moment)
  }
  feeds=feeds.concat(myMoments)
  res.render("home",{
    user:req.session.user,
    feeds
  })
})

//get moment
router.get("/add-moment", (req, res)=>{
  res.render('add-post')
})

//post moment
router.post("/add-moment", checkUser, uploadFilesMiddleware, async (req, res)=>{
  
  const postImageName = req.file.filename
  const caption = req.body.caption
  
  var userData = await User.findOne({_id:req.session.user})
  
  User.updateOne({_id:req.session.user}, {$push:{
    moments:{
      user_id:userData._id,
      user_username:userData.username,
      user_dp:userData.profile_pic,
      postImageName:postImageName,
      caption:caption
    }
  }}, (err, data)=>{
    if (err) {
      return res.render('add-post', {message:err})
    } else {
      res.redirect("/")
    }
  })
})




module.exports=router