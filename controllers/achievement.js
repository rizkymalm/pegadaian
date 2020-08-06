const db = require("../models/db");
const moment = require("moment")


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

exports.getAcvAjax = async function (req,res){
    var kanwil = req.query.kanwil
    var area = req.query.area
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
    var jsonres = []
    db.query(sql, async function(err,result){
        for(var i=0;i<result.length;i++){
            var rand = await randomNumber(1, 100);
            if(typesql=="region"){
                jsonres.push({nama: result[i].region, label: "KANWIL", achievement: rand})
            }else if(typesql=="area"){
                jsonres.push({nama: result[i].area_name, label: "AREA", achievement: rand})
            }else if(typesql=="subbranch"){
                jsonres.push({nama: result[i].sub_branch_name, label: "SUB BRANCH", achievement: rand})
            }
        }
        res.render("partials/achievementajax", {
            moment: moment,
            results: result,
            json: jsonres
        })
    })
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