const checkUser =(req, res, next)=>{
  if (req.session.user) {
    next();
  } else {
    //var err = new Error("not logged in")
    return res.redirect ("/login")
  }
}

module.exports = checkUser;