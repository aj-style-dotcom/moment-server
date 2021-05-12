
var multer = require("multer");

const storage = multer.diskStorage({
  destination:"./public/uploads",
  filename:(req, file, cb)=>{
    cb(null, Date.now()+"-"+file.originalname)
  }
})


module.exports=storage