var jwt = require("jsonwebtoken");
const key = "this-is-my-key";

const authenticator = async (req, res, next) => {
  const accesToken = req.cookies.token || ""
  
  console.log(accesToken)
  
  try {
  if (!accesToken) {
    return res.status(403).send("invalid")
  }
  
    const decrypt = await jwt.verify(token, key)
    
    req.user={
      _id :decrypt._id
    }
    next()
    
  } catch (e) {
    return res.status(500).send(e)
  }
}


module.export = authenticator;