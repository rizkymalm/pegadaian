const db = require("../models/db");
const moment = require("moment")
const fs = require("fs")


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

function getSkenario(kanwil, area) { 
    return new Promise(resolve =>{ 
        if(kanwil=="all" && area=="all"){
            var sql = "SELECT * FROM region"
            var typesql = "region"
        }else if(kanwil!="all" && area=="all"){
            var sql = "SELECT * FROM area WHERE id_region="+kanwil
            var typesql = "area"
        }else if(kanwil!="all" && area!="all"){
            var sql = "SELECT * FROM sub_branch WHERE id_region="+kanwil+" AND id_area='"+area+"'"
            var typesql = "subbranch"
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

exports.getAcvAjax = async function (req,res){
    var kanwil = req.query.kanwil
    var area = req.query.area
    var skenario = await getSkenario(kanwil, area)
    if(kanwil=="all" && area=="all"){
        var typesql = "region"
    }else if(kanwil!="all" && area=="all"){
        var typesql = "area"
    }else if(kanwil!="all" && area!="all"){
        var typesql = "subbranch"
    }
    var jsonres = []
    for(var i=0;i<skenario.length;i++){
        var rand = await randomNumber(1, 100);
        if(typesql=="region"){
            var searchCount = await countSkenario(skenario[i].id_region, typesql)
            var count = 0
            var total = 0
            for (let x = 0; x < searchCount.length; x++) {
                if(searchCount[x].id_region==skenario[i].id_region){
                    total = total+ searchCount[i].Total_Satpam_KONDISI_1
                    count = count+1
                }
            }
            var average = total / count
            jsonres.push({nama: skenario[i].region, label: "KANWIL", achievement: average})
        }else if(typesql=="area"){
            var searchCount = await countSkenario(skenario[i].id_area, typesql)
            var count = 0
            var total = 0
            for (let x = 0; x < searchCount.length; x++) {
                if(searchCount[x].id_area==skenario[i].id_area){
                    total = total+ searchCount[i].Total_Satpam_KONDISI_1
                    count = count+1
                }
            }
            var average = total / count
            jsonres.push({nama: skenario[i].area_name, label: "AREA", achievement: rand})
        }else if(typesql=="subbranch"){
            jsonres.push({nama: skenario[i].sub_branch_name, label: "SUB BRANCH", achievement: rand})
        }
    }
    res.send(jsonres)
}

exports.getAreaByKanwil = (req,res) => {
    if(req.params.kanwil!="all"){
        var sql = "SELECT * FROM area WHERE id_region="+req.params.kanwil
    }else{
        var sql = "SELECT * FROM area"
    }
    db.query(sql, (err,results) => {
        console.log(sql)
        if(err){
            res.send("error")
        }else{
            res.render("partials/areabykanwil", {
                result: results
            })
        }

    })
}