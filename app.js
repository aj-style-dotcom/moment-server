var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose");
var cors = require("cors");
var session = require("express-session");
var exphbs = require('express-handlebars');


var mongoDB = "mongodb://localhost:27017/"

//database connection

mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useCreateIndex: true, 
  useUnifiedTopology: true
}).then(()=> {
  console.log("connected to database ✔️")
}).catch((err)=> console.log("can't connect to database ❌"))

// all usables..
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(cors({origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 }))
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
}));
app.use(express.static(__dirname + '/public'));


//setting views

/*exphbs.registerHelper("iterate", function(array, options){
  array.map((obj)=>{
    return options.fn(obj)
  })
})*/

app.set('view engine', 'hbs');

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: __dirname+"/views/partial",
    helpers:{
      iterate:function(array, options){
  array.map((obj)=>{
    return options.fn(obj)
  })
}
    }
}));

//app.set('views','./views');


//landing routes   ..........

app.use('/private', require('./routes/users'));
app.use("/public", require("./routes/public"));
app.use("/", require("./routes/app"))



module.exports = app;