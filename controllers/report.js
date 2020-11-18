const moment = require("moment")
const db = require("../models/db");
const fs = require("fs")
const path = require("path")

function getKanwil(){
    return new Promise(resolve =>{
        db.query("SELECT * FROM region", function(err,result){
            resolve(result)
        })
    })
}
function getArea(){
    return new Promise(resolve =>{
        db.query("SELECT * FROM area GROUP BY id_area", function(err,result){
            resolve(result)
        })
    })
}
exports.getReport = async function(req,res){
    if(req.session.email==undefined){
        res.redirect("../login")
    }else{
        var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, subbranch: req.session.subbranch})
        var kanwil = await getKanwil()
        var area = await getArea()
        db.query("SELECT * FROM sub_branch WHERE id_sub_branch=?", login.subbranch, function(err,sub_branch){
            res.render("report", {
                login: login,
                moment: moment,
                subBranch: sub_branch,
                kanwil: kanwil,
                area: area
            })
        })
    }
}

function getSkenario(kanwil, area, type) { 
    return new Promise(resolve =>{ 
        if(type=="region"){
            var sql = "SELECT * FROM region"
        }else if(type=="area"){
            var sql = "SELECT * FROM area WHERE id_region="+kanwil
        }else if(type=="subbranch"){
            var sql = "SELECT * FROM sub_branch WHERE id_region="+kanwil+" AND id_area='"+area+"'"
        }else if(type=="year"){
            var sql = "SELECT * FROM region"
        }
        db.query(sql, async function(err,result){
            resolve(result)
        })
    })
}


exports.getReportAjax = async function (req,res){
    var kanwil = req.query.kanwil
    var area = req.query.area
    var date = req.query.date
    if(kanwil=="all" && area=="all" && date=="all" && date!=2020){
        var typesql = "region"
    }else if(kanwil!="all" && area=="all"){
        var typesql = "area"
    }else if(kanwil!="all" && area!="all"){
        var typesql = "subbranch"
    }else if(date!="all" && date!=2020){
        var typesql = "year"
    }else if(date==2020){
        var typesql = "region"
    }
    var skenario = await getSkenario(kanwil, area, typesql)
    var jsonres = []
    for(var i=0;i<skenario.length;i++){
        if(typesql=="region"){
            jsonres.push({nama: skenario[i].region, label: "KANWIL"})
        }else if(typesql=="area"){
            jsonres.push({nama: skenario[i].area_name, label: "AREA"})
        }else if(typesql=="subbranch"){
            jsonres.push({nama: skenario[i].sub_branch_name, label: "BRANCH"})
        }else if(typesql=="year"){
            jsonres.push({nama: skenario[i].region, label: "YEAR"})
        }
    }
    console.log(skenario)
    res.send(jsonres)
}