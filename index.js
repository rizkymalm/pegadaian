const express = require("express")
const mysql = require("mysql")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const session = require("express-session")

const indexRoutes = require("./routes/index");
const updateRoutes = require("./routes/update");
const reportRoutes = require("./routes/report");
const findingRoutes = require("./routes/finding");
const loginRoutes = require("./routes/login");
const evidenceRoutes = require("./routes/evidence");
const acvRoutes = require("./routes/acv");
const achievementRoutes = require("./routes/achievement");
const detailRoutes = require("./routes/detail");
const filterRoutes = require("./routes/filter");


global.baseurl = function(){
	var url = `${process.env.URL}:${process.env.PORT}/`;
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
app.use("/update", updateRoutes)
app.use("/login", loginRoutes)
app.use("/findings", findingRoutes)
app.use("/acv", acvRoutes)
app.use("/achievement", achievementRoutes)
app.use("/report", reportRoutes)
app.use("/evidence", evidenceRoutes)
app.use("/detail", detailRoutes)
app.use("/filters", filterRoutes)
app.get("/logout", function(req,res) {
    var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        req.session.destroy();
        res.redirect("/login")
})

app.listen(process.env.PORT, (req,res) => {

})