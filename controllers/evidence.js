const moment = require("moment")
const db = require("../models/db");
const dbkepo = require("../models/db_kepo");
exports.getEvidence = (req,res) =>{
    if(req.session.email==undefined){
        res.redirect("../login")
    }else{
        var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, subbranch: req.session.subbranch})
        db.query("SELECT * FROM sub_branch WHERE id_sub_branch=?", login.subbranch, (err,sub_branch)=>{
            dbkepo.query("SELECT * FROM task WHERE project=6 AND filename IS NOT NULL ORDER BY uploadtime DESC", (errtask, task) => {
                res.render("evidence", {
                    login: login,
                    moment: moment,
                    subBranch: sub_branch,
                    task: task
                })
            })
        })
    }
}


exports.getDetailEvidence = (req,res) => {
    var id = req.params.id;
    var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, subbranch: req.session.subbranch})
    dbkepo.query("SELECT * FROM task WHERE id=?", id, (err,task)=>{
        res.render("detailevidence",{
            task: task,
            moment: moment,
            login: login
        })
    })
}