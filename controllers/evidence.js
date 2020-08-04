const moment = require("moment")
const db = require("../models/db");
exports.getEvidence = (req,res) =>{
    if(req.session.email==undefined){
        res.redirect("../login")
    }else{
        var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, subbranch: req.session.subbranch})
        db.query("SELECT * FROM sub_branch WHERE id_sub_branch=?", login.subbranch, (err,sub_branch)=>{
            res.render("evidence", {
                login: login,
                moment: moment,
                subBranch: sub_branch
            })
        })
    }
}