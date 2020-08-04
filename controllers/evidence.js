const moment = require("moment")
exports.getEvidence = (req,res) =>{
    if(req.session.email==undefined){
        res.redirect("../login")
    }else{
        res.render("evidence",{
            moment: moment
        })
    }
}