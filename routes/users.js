var express = require('express');
var router = express.Router();
var User = require("../Models/Model");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");


const key = "this-is-my-key";


const authenticateJWT = (req, res, next) => {
  const accesToken = req.cookies.token
  if (!accesToken) {

    return res.status(403).send("invalid")
  }

  let payload
  try {
    payload = jwt.verify(accessToken, key)
    next()
  } catch (e) {
    return res.status(401).send()
  }

}









/* Registeration of user*/
router.post('/register', async function(req, res, next) {
  try {
    const {
      username, password, email
    } = req.body;


    // validation .....

    if (!username || !password || !email) {
      return res.status(400).send("fill all fields")
    }

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
      email: email
    })

    const savedUser = await newUser.save();

    // generation of token

    const token = jwt.sign({
      username: savedUser._id
    }, key)


    res.cookie("token", token, {
      httpOnly: true
    }).send("registered ")


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
      username: existinguser._id
    }, key)


    res.cookie("token", token, {
      httpOnly: true
    }).send({
      message: "logged in",
      token: token
    })





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



router.get("/test/:username", authenticateJWT, (req, res)=> {
  const userData = User.findOne({
    username
  })
  res.send(userData.email)
})





module.exports = router;