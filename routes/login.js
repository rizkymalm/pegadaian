const express = require("express");
const Router = express.Router();
const db = require("../models/db");
const moment = require("moment")
Router.get("/", (req,res) => {
    db.query("SELECT * FROM sub_branch", (err,result) => {
        res.render("login", {
            title: "Login",
            result: result
        })
    })
})


Router.post("/auth", (req,res) => {
    var email = req.body.email;
    var pass = req.body.password;
    db.query("SELECT * FROM admin WHERE admin_email=? AND admin_pass=?", [email,pass], (err,result)=>{
        if(result.length>0){
            req.session.loggedin = true;
            req.session.email = result[0].admin_email;
            req.session.id = result[0].id_admin;
            req.session.name = result[0].admin_name;
            req.session.type = result[0].admin_type;
            req.session.subbranch = result[0].id_sub_branch;
            res.redirect("../landingpage")
        }else{
            res.redirect("../login/")
        }
    })
})

module.exports = Router;