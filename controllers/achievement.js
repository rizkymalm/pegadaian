const db = require("../models/db");
const moment = require("moment")
const fs = require("fs");
const { type } = require("os");


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
exports.getAcv = async function(req,res){
    if(req.session.email==undefined){
        res.redirect("../login")
    }else{
        var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, subbranch: req.session.subbranch})
        var kanwil = await getKanwil()
        var area = await getArea()
        db.query("SELECT * FROM sub_branch WHERE id_sub_branch=?", login.subbranch, (err,sub_branch)=>{
            res.render("achievement", {
                login: login,
                moment: moment,
                subBranch: sub_branch,
                kanwil: kanwil,
                area: area
            })
        })
    }
}

function randomNumber(min, max) { 
    return new Promise(resolve =>{ 
        var random = Math.random() * (max - min) + min;
        var number = Math.floor(random)
        resolve(number)
    })
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

function countSkenario(kanwil, type) { 
    return new Promise(resolve =>{ 
        if(type=="region"){
            var sql = "SELECT * FROM skenario WHERE id_region="+kanwil
        }else if(type=="area"){
            var sql = "SELECT * FROM skenario WHERE id_area="+kanwil
        }
        db.query(sql, async function(err,result){
            resolve(result)
        })
    })
}

function avgSkenario(kanwil, type, skenario) { 
    return new Promise(resolve =>{ 
        if(type=="region"){
            var sql = "SELECT AVG("+skenario+") AS avg FROM skenario WHERE id_region="+kanwil
        }else if(type=="area"){
            var sql = "SELECT AVG("+skenario+") AS avg FROM skenario WHERE id_area="+kanwil
        }else if(type=="subbranch"){
            var sql = "SELECT AVG("+skenario+") AS avg FROM skenario WHERE id_sub_branch="+kanwil
        }else if(type=="year"){
            var sql = "SELECT AVG(Total_Skor_) AS avg FROM skenario WHERE id_region="+kanwil+" AND tahun="+skenario
        }
        db.query(sql, function(err,result){
            resolve(result[0].avg)
        })
    })
}

exports.getAcvAjax = async function (req,res){
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
        var rand = await randomNumber(1, 100);
        var arrskenario = ["Total_Satpam_KONDISI_1","Total_Penaksir_KONDISI_1","Total_Kasir_KONDISI_1","Total_Kebersihan_KONDISI_1","Total_New_Normal_KONDISI_1","Total_Pengelola_Agunan_KONDISI_1","Total_Frontliner"]
        if(typesql=="region"){
            var searchCount = await countSkenario(skenario[i].id_region, typesql)
            var count = 0
            var total = 0
            for (let x = 0; x < arrskenario.length; x++) {
                var searchAvg = await avgSkenario(skenario[i].id_region, typesql, arrskenario[x])
                total = total + searchAvg
            }
            var average = total / 7
            jsonres.push({nama: skenario[i].region, label: "KANWIL", achievement: average})
        }else if(typesql=="area"){
            var total = 0
            for (let x = 0; x < arrskenario.length; x++) {
                var searchAvg = await avgSkenario(skenario[i].id_area, typesql, arrskenario[x])
                total = total + searchAvg
            }
            var average = total / 7
            jsonres.push({nama: skenario[i].area_name, label: "AREA", achievement: average})
        }else if(typesql=="subbranch"){
            var total = 0
            for (let x = 0; x < arrskenario.length; x++) {
                var searchAvg = await avgSkenario(skenario[i].id_sub_branch, typesql, arrskenario[x])
                total = total + searchAvg
            }
            var average = total / 7
            jsonres.push({nama: skenario[i].sub_branch_name, label: "BRANCH", achievement: average})
        }else if(typesql=="year"){
            var searchAvg = await avgSkenario(skenario[i].id_region, typesql, date)
            var average = searchAvg
            jsonres.push({nama: skenario[i].region, label: "YEAR", achievement: average})
        }
    }
    res.send(jsonres)
}

exports.getAreaByKanwil = (req,res) => {
    if(req.params.kanwil!="all"){
        var sql = "SELECT * FROM area WHERE id_region="+req.params.kanwil
    }
    db.query(sql, (err,results) => {
        if(err){
            res.send("error")
        }else{
            res.render("partials/areabykanwil", {
                result: results
            })
        }

    })
}