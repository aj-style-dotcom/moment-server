var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose");
var cors = require("cors");

var mongoDB = "mongodb://localhost:27017/"

//database connection

mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useCreateIndex: true, 
  useUnifiedTopology: true
}).then(()=> {
  console.log("connected to database ✓")
}).catch((err)=> console.log(err))


// all usables..
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(cors({credentials : true, origin:"http://localhost:3000"}))

//all routes   ..........

app.use('/private', require('./routes/users'));
app.use("/public", require("./routes/public"))



module.exports = app;