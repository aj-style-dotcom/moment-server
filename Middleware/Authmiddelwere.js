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


module.export = authenticateJWT;