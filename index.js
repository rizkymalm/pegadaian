const express = require("express")
const mysql = require("mysql")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const session = require("express-session")

const indexRoutes = require("./routes/index");

global.baseurl = function(){
	var url = "http://localhost:5000/";
    return url;
}
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

app.use("/", indexRoutes)
app.use("/login", (req,res)=> {
    res.render("login")
})

app.listen(5000, (req,res) => {
    
})