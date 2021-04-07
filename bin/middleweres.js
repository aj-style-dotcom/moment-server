var jwt = require("jsonwebtoken");
const key = "this-is-my-key";

const authenticator = async (req, res, next)=>{
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



module.exports = authenticator;