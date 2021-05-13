const GridFsStorage = require("multer-gridfs-storage");
var multer = require("multer");
const util = require("util");


const storage = GridFsStorage({
  url:"mongodb://localhost:27017/",
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-bezkoder-${file.originalname}`;
      return filename;
    }

    return {
      bucketName: "photos",
      filename: `${Date.now()}+${file.originalname}`
    };
  }
})


var uploadFile = multer({ storage: storage }).single("postImageName");
var uploadFilesMiddleware = util.promisify(uploadFile);
module.exports = uploadFilesMiddleware;