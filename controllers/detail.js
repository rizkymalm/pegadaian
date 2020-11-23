const db = require("../models/db");
const moment = require("moment")
const fs = require("fs");
const { type, setPriority } = require("os");
const { resolve } = require("path");
const { json } = require("body-parser");
const { brotliDecompress } = require("zlib");

function getKanwil(){
    return new Promise(resolve =>{
        db.query("SELECT * FROM region", function(err,result){
            resolve(result)
        })
    })
}
function getKanwilById(id){
    return new Promise(resolve =>{
        db.query("SELECT * FROM region WHERE id_region=?",id, function(err,result){
            resolve(result)
        })
    })
}
function getAreaById(id){
    return new Promise(resolve =>{
        db.query("SELECT * FROM area WHERE id_area=?",id, function(err,result){
            resolve(result)
        })
    })
}

function getCabang(){
    return new Promise(resolve =>{
        db.query("SELECT * FROM sub_branch GROUP BY id_sub_branch", function(err,result){
            resolve(result)
        })
    })
}

function getAspek(){
    return new Promise(resolve =>{
        db.query("SELECT * FROM aspek WHERE id_aspek NOT IN(9)", function(err,result){
            resolve(result)
        })
    })
}

function getBranchByKanwil(id, type){
    return new Promise(resolve => {
        if(type=="kanwil"){
            if(id=="all"){
                var sql = "SELECT * FROM sub_branch"
            }else{
                var sql = "SELECT * FROM sub_branch WHERE id_region="+id
            }
        }else if(type=="area"){
            var sql = "SELECT * FROM sub_branch WHERE id_area="+id
        }else if(type=="cabang"){
            var sql = "SELECT * FROM sub_branch WHERE id_sub_branch="+id
        }
        db.query(sql, async function(err,result){
            resolve(result)
        })
    })
}

exports.getDetail = async function(req,res){
    var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, subbranch: req.session.subbranch})
    var kanwil = await getKanwil()
    var aspek = await getAspek()
    res.render("detailcabang",{
        moment: moment,
        login: login,
        kanwil: kanwil,
        aspek: aspek
    })
}

function getTopSkenarioByArray(array){
    return new Promise(resolve =>{ 
        var sql = "SELECT * FROM skenario WHERE id_sub_branch IN("+array+")"
        db.query(sql, async function(err,result){
            resolve(result)
        })
    })
}

exports.getDetailContent = async function(req,res){
    var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, subbranch: req.session.subbranch})
    var kanwil = req.query.kanwil
    var area = req.query.area
    var cabang = req.query.cabang
    var aspek = req.query.aspek
    if(kanwil=="all" && area=="all"){
        var typesql = "kanwil"
        var selectBranch = await getBranchByKanwil(kanwil, typesql)
    }else if(kanwil!="all" && area=="all"){
        var typesql = "kanwil"
        var selectBranch = await getBranchByKanwil(kanwil, typesql)
    }else if(kanwil!="all" && area!="all" && cabang=="all"){
        var typesql = "area"
        var selectBranch = await getBranchByKanwil(area, typesql)
    }else if(kanwil!="all" && area!="all" && cabang!="all"){
        var typesql = "cabang"
        var selectBranch = await getBranchByKanwil(cabang, typesql)
    }
    console.log(cabang)
    var arrbranch = ""
    for (let i = 0; i < selectBranch.length; i++) {
        if(i==selectBranch.length-1){
            arrbranch += selectBranch[i].id_sub_branch
        }else{
            arrbranch += selectBranch[i].id_sub_branch+","
        }
    }
    var jsonres = []
    var skenario = await getTopSkenarioByArray(arrbranch)
    for (let i = 0; i < skenario.length; i++) {
        var kanwilbyid = await getKanwilById(skenario[i].id_region)
        var areabyid = await getAreaById(skenario[i].id_area)
        jsonres.push({
            id_skenario: skenario[i].id_skenario,
            id_cabang: skenario[i].id_sub_branch,
            region: kanwilbyid[0].region.replace("KANWIL ",""),
            area: areabyid[0].area_name.replace("AREA ",""),
            cabang: skenario[i].CABANG,
            total_skor: skenario[i].Total_Skor_,
            totalSatpam: skenario[i].Total_Satpam_KONDISI_1.toFixed(2),
            totalPenaksir: skenario[i].Total_Penaksir_KONDISI_1.toFixed(2),
            totalKasir: skenario[i].Total_Kasir_KONDISI_1.toFixed(2),
            totalKebersihan: skenario[i].Total_Kebersihan_KONDISI_1.toFixed(2),
            totalNewNormal: skenario[i].Total_New_Normal_KONDISI_1.toFixed(2),
            totalPengelolaAgunan: skenario[i].Total_Pengelola_Agunan_KONDISI_1.toFixed(2),
            totalFrontliner: skenario[i].Total_Frontliner.toFixed(2),
            totalRO: skenario[i].Total_RO_KONDISI_1.toFixed(2),
        })
    }
    res.render("partials/detailContent",{
        jsonres: jsonres
    })
}

exports.getDetailVideo = async function(req,res){
    var id = req.params.idcabang;
    var tipe = req.params.tipe;
    // var randomChar = await random(32)
    var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, subbranch: req.session.subbranch})
    db.query("SELECT * FROM task WHERE tipe=? AND id_sub_branch=?", [tipe,id], (err,task)=>{
        db.query("SELECT * FROM note WHERE task=?", id, (errnote,notess) => {
            res.render("detailevidence",{
                task: task,
                moment: moment,
                login: login,
                notes: notess
            })
        })
    })
}