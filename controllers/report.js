const moment = require("moment")
const db = require("../models/db");
const fs = require("fs")
const path = require("path")
exports.getReport = (req,res) => {
    if(req.session.email==undefined){
        res.redirect("../login")
    }else{
        var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, subbranch: req.session.subbranch})
        if(req.query.skenario==undefined){
            var directoryPath = path.join(__dirname, '../public/rawdatacsv/gadai/')
            var dir = "gadai"
        }else{
            if(req.query.skenario=="gadai"){
                var dir = "gadai"
                var directoryPath = path.join(__dirname, '../public/rawdatacsv/gadai/')
            }else if(req.query.skenario=="telepon"){
                var dir = "telepon"
                var directoryPath = path.join(__dirname, '../public/rawdatacsv/telepon/')
            }else if(req.query.skenario=="pelunasan"){
                var dir = "pelunasan"
                var directoryPath = path.join(__dirname, '../public/rawdatacsv/pelunasan/')
            }
        }
        fs.readdir(directoryPath, function(err,files){
            for(var f=0;f<files.length;f++){
                var readfilecsv = files[f]
                db.query("SELECT * FROM sub_branch WHERE id_sub_branch=?", login.subbranch, (err,sub_branch)=>{
                    res.render("report", {
                        login: login,
                        moment: moment,
                        subBranch: sub_branch,
                        filecsv: readfilecsv,
                        dir: dir
                    })
                })
            }
        })
    }
}