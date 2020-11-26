const db = require("../models/db");
const moment = require("moment")
const fs = require("fs");
const { type, setPriority } = require("os");
const { resolve } = require("path");
const { json } = require("body-parser");


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
function getAspek(){
    return new Promise(resolve =>{
        db.query("SELECT * FROM aspek WHERE id_aspek NOT IN(9)", function(err,result){
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
        var aspek = await getAspek()
        db.query("SELECT * FROM sub_branch WHERE id_sub_branch=?", login.subbranch, (err,sub_branch)=>{
            res.render("achievement", {
                login: login,
                moment: moment,
                subBranch: sub_branch,
                kanwil: kanwil,
                area: area,
                aspek: aspek
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
            var sql = "SELECT AVG("+skenario+") AS avg FROM skenario WHERE id_region="+kanwil+" AND "+skenario+" IS NOT NULL"
        }else if(type=="area"){
            var sql = "SELECT AVG("+skenario+") AS avg FROM skenario WHERE id_area="+kanwil+" AND "+skenario+" IS NOT NULL"
        }else if(type=="subbranch"){
            var sql = "SELECT AVG("+skenario+") AS avg FROM skenario WHERE id_sub_branch="+kanwil+" AND "+skenario+" IS NOT NULL"
        }else if(type=="year"){
            var sql = "SELECT AVG(Total_Skor_) AS avg FROM skenario WHERE id_region="+kanwil+" AND tahun="+skenario+" AND "+skenario+" IS NOT NULL"
        }
        db.query(sql, function(err,result){
            resolve(result[0].avg)
        })
    })
}

function getSkenarioByRegion(skenario, region){
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
    var aspek = req.query.aspek
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
    if(aspek==9){
        for(var i=0;i<skenario.length;i++){
            var rand = await randomNumber(1, 100);
            var arrskenario = ["Total_Satpam_KONDISI_1","Total_Penaksir_KONDISI_1","Total_Kasir_KONDISI_1","Total_Kebersihan_KONDISI_1","Total_New_Normal_KONDISI_1","Total_Pengelola_Agunan_KONDISI_1","Total_Frontliner"]
            if(typesql=="region"){
                var total = 0
                for (let x = 0; x < arrskenario.length; x++) {
                    var searchAvg = await avgSkenario(skenario[i].id_region, typesql, arrskenario[x])
                    total = total + searchAvg
                }
                var average = total / 7
                jsonres.push({nama: skenario[i].region.replace("KANWIL ",""), label: "KANWIL", achievement: average})
            }else if(typesql=="area"){
                var total = 0
                for (let x = 0; x < arrskenario.length; x++) {
                    var searchAvg = await avgSkenario(skenario[i].id_area, typesql, arrskenario[x])
                    total = total + searchAvg
                }
                var average = total / 7
                jsonres.push({nama: skenario[i].area_name.replace("AREA ",""), label: "AREA", achievement: average})
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
    }else{
        var arraspek = [
            ["Total_Frontliner","Sikap_Frontliner_Dalam_Menerima_Panggilan_Telepon","Sikap_Saat_Melayani_di_Telepon_dan_Handling_Complaint","Sikap_Frontliner_Dalam_Mengakhiri_Panggilan_Telepon","Kegiatan_Frontliner_Lainnya"],
            ["Total_Kasir_KONDISI_1","Sikap_Kasir_Saat_Menyambut_Nasabah_Datang","Penampilan_Kasir","Sikap_Kasir_dalam_Melayani_Nasabah","Skill_Kasir","Sikap_Kasir_Saat_Mengakhiri_Pelayanan","Kegiatan_Kasir_Lainnya"],
            ["Total_Kebersihan_KONDISI_1","Eksterior_Kantor_Cabang","Interior_Kantor_Cabang"],
            ["Total_New_Normal_KONDISI_1","Pelayanan_dan_Pencegahan_oleh_Satpam","Fasilitas_Prasarana_dan_Sarana","Pelayanan_dan_Pencegahan_oleh_Karyawan"],
            ["Total_Penaksir_KONDISI_1","Sikap_Penaksir_Saat_Menyambut_Nasabah_Datang","Penampilan_Penaksir","Sikap_Penaksir_dalam_Melayani_Nasabah","Skill_Penaksir","Sikap_Penaksir_Saat_Mengakhiri_Pelayanan","Kegiatan_Penaksir_Lainnya"],
            ["Total_Pengelola_Agunan_KONDISI_1","Sikap_Pengelola_Agunan_Saat_Menyambut_Nasabah_Datang","Penampilan_Pengelola_Agunan","Sikap_Pengelola_Agunan_dalam_Melayani_Nasabah","Skill_Pengelola_Agunan","Sikap_yang_Dilakukan_Pengelola_Agunan_Saat_Mengakhiri_Layanan","Kegiatan_Pegelola_Agunan_Lainnya"],
            ["Total_RO_KONDISI_1","Sikap_RO_Saat_Menyambut_Nasabah_Datang","Penampilan_RO","Sikap_RO_Saat_Melayani_Nasabah","Skill_RO","Sikap_yang_Dilakukan_RO_Saat_Mengakhiri_Layanan","Kegiatan_RO_Lainnya"],
            ["Total_Satpam_KONDISI_1","Total_Keberadaan_Satpam","Sikap_Satpam_Saat_Menyambut_Nasabah","Sikap_Satpam_Saat_Melayani_Nasabah","Sikap_Satpam_Saat_Nasabah_Keluar","Penampilan_Satpam","Kegiatan_Satpam_Lainnya"],
        ]
        var aspekLabel = [
            ["Total Frontliner","Sikap Frontliner Dalam Menerima Panggilan Telepon","Sikap Saat Melayani di Telepon dan Handling Complaint","Sikap Frontliner Dalam Mengakhiri Panggilan Telepon","Frontliner tidak melakukan kegiatan lainnya contoh buka HP dll"],
            ["Total Kasir","Sikap Kasir Saat Menyambut Nasabah Datang","Penampilan Kasir","Sikap Kasir dalam Melayani Nasabah","Skill Kasir","Sikap Kasir Saat Mengakhiri Pelayanan","Kasir tidak melakukan kegiatan lainnya contoh buka HP dll"],
            ["Total Keersihan","Eksterior Kantor Cabang","Interior Kantor Cabang"],
            ["Total New Normal","Pelayanan dan Pencegahan oleh Satpam","Fasilitas, Prasarana, dan Sarana","Pelayanan dan Pencegahan oleh Karyawan"],
            ["Total Penaksir","Sikap Penaksir Saat Menyambut Nasabah Datang","Penampilan Penaksir","Sikap Penaksir dalam Melayani Nasabah","Skill Penaksir","Sikap Penaksir Saat Mengakhiri Pelayanan","Penaksir tidak melakukan kegiatan lainnya contoh buka HP dll"],
            ["Total Pengelola Agunan","Sikap Pengelola Agunan Saat Menyambut Nasabah Datang","Penampilan Pengelola Agunan","Sikap Pengelola Agunan dalam Melayani Nasabah","Skill Pengelola Agunan","Sikap yang Dilakukan Pengelola Agunan Saat Mengakhiri Layanan","Pengelola Agunan tidak melakukan kegiatan lainnya contoh buka HP dll"],
            ["Total RO","Sikap RO Saat Menyambut Nasabah Datang","Penampilan RO","Sikap RO Saat Melayani Nasabah","Skill RO","Sikap yang Dilakukan RO Saat Mengakhiri Layanan","RO tidak melakukan kegiatan lainnya contoh buka HP dll"],
            ["Total Satpam","Keberadaan Satpam","Sikap Satpam Saat Menyambut Nasabah","Sikap Satpam Saat Melayani Nasabah","Sikap Satpam Saat Nasabah Keluar","Penampilan Satpam","Satpam tidak melakukan kegiatan lainnya contoh buka HP dll"]
        ]
        for (let a = 0; a < arraspek[aspek-1].length; a++) {
            if(typesql=="region"){
                var total = 0
                for(var i=0;i<skenario.length;i++){
                    var searchAvg = await avgSkenario(skenario[i].id_region, typesql, arraspek[aspek-1][a])
                    total = total + searchAvg
                }
                var average = total / skenario.length
                jsonres.push({nama: aspekLabel[aspek-1][a], label: "KANWIL", achievement: average})
            }else if(typesql=="area"){
                var total = 0
                for(var i=0;i<skenario.length;i++){
                    var searchAvg = await avgSkenario(skenario[i].id_area, typesql, arraspek[aspek-1][a])
                    total = total + searchAvg
                }
                var average = total / skenario.length
                jsonres.push({nama: aspekLabel[aspek-1][a], label: "AREA", achievement: average})
            }else if(typesql=="subbranch"){
                var total = 0
                for(var i=0;i<skenario.length;i++){
                    var searchAvg = await avgSkenario(skenario[i].id_sub_branch, typesql, arraspek[aspek-1][a])
                    total = total + searchAvg
                }
                var average = total / skenario.length
                jsonres.push({nama: aspekLabel[aspek-1][a], label: "AREA", achievement: average})
            }
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
        if(err){
            res.send("error")
        }else{
            res.render("partials/areabykanwil", {
                result: results
            })
        }

    })
}

exports.getBranchByArea = (req,res) => {
    if(req.params.area!="all"){
        var sql = "SELECT * FROM sub_branch WHERE id_area="+req.params.area
    }else{
        var sql = "SELECT * FROM sub_branch"
    }
    db.query(sql, (err,results) => {
        if(err){
            res.send("error")
        }else{
            res.render("partials/branchbyarea", {
                result: results
            })
        }

    })
}


exports.getTop = async function(req,res){
    if(req.session.email==undefined){
        res.redirect("../login")
    }else{
        var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, subbranch: req.session.subbranch})
        var kanwil = await getKanwil()
        var area = await getArea()
        var aspek = await getAspek()
        res.render("top",{
            login: login,
            moment: moment,
            kanwil: kanwil,
            area: area,
            aspek: aspek
        })
    }
}

exports.getBottom = async function(req,res){
    if(req.session.email==undefined){
        res.redirect("../login")
    }else{
        var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, subbranch: req.session.subbranch})
        var kanwil = await getKanwil()
        var area = await getArea()
        var aspek = await getAspek()
        res.render("bottom",{
            login: login,
            moment: moment,
            kanwil: kanwil,
            area: area,
            aspek: aspek
        })
    }
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
        }
        db.query(sql, async function(err,result){
            resolve(result)
        })
    })
}

function getTopSkenarioByArray(array, aspek, sort){
    return new Promise(resolve =>{ 
        var sql = "SELECT CABANG AS cabang, "+aspek+" AS total FROM skenario WHERE id_sub_branch IN("+array+") AND "+aspek+" IS NOT NULL ORDER BY "+aspek+" "+sort+", id_skenario ASC LIMIT 10"
        db.query(sql, async function(err,result){
            resolve(result)
        })
    })
}

exports.getTopContent = async function(req,res){
    var kanwil = req.query.kanwil
    var area = req.query.area
    var aspek = req.query.aspek
    var element = req.query.element
    var sort = req.query.sortby
    if(kanwil=="all" && area=="all"){
        var typesql = "kanwil"
        var selectBranch = await getBranchByKanwil(kanwil, typesql)
    }else if(kanwil!="all" && area=="all"){
        var typesql = "kanwil"
        var selectBranch = await getBranchByKanwil(kanwil, typesql)
    }else if(kanwil!="all" && area!="all"){
        var typesql = "area"
        var selectBranch = await getBranchByKanwil(area, typesql)
    }
    var jsonres = []
    var arrbranch = ""
    for (let i = 0; i < selectBranch.length; i++) {
        if(i==selectBranch.length-1){
            arrbranch += selectBranch[i].id_sub_branch
        }else{
            arrbranch += selectBranch[i].id_sub_branch+","
        }
    }
    if(aspek=="all"){
        var typeaspek = "ASPEK"
        var getAspek = "Total_Skor_"
    }else if(aspek!="all" && element=="all"){
        var typeaspek = "ELEMENT"
        var arraspek = ['Total_Frontliner','Total_Kasir_KONDISI_1','Total_Kebersihan_KONDISI_1','Total_New_Normal_KONDISI_1','Total_Penaksir_KONDISI_1','Total_Pengelola_Agunan_KONDISI_1','Total_RO_KONDISI_1','Total_Satpam_KONDISI_1']
        var getAspek = arraspek[aspek-1]
    }else if(aspek!="all" && element!="all"){
        var typeaspek = "ELEMENT"
        var arrelement = ['Total_Frontliner',
                        'Kegiatan_Frontliner_Lainnya',
                        'Sikap_Frontliner_Dalam_Menerima_Panggilan_Telepon',
                        'Sikap_Frontliner_Dalam_Mengakhiri_Panggilan_Telepon',
                        'Total_Kasir_KONDISI_1',
                        'Kegiatan_Kasir_Lainnya',
                        'Penampilan_Kasir',
                        'Sikap_Kasir_dalam_Melayani_Nasabah',
                        'Sikap_Kasir_Saat_Mengakhiri_Pelayanan',
                        'Sikap_Kasir_Saat_Menyambut_Nasabah_Datang',
                        'Skill_Kasir',
                        'Total_Kebersihan_KONDISI_1',
                        'Eksterior_Kantor_Cabang',
                        'Interior_Kantor_Cabang',
                        'Total_New_Normal_KONDISI_1',
                        'Fasilitas_Prasarana_dan_Sarana',
                        'Total_Penaksir_KONDISI_1',
                        'Penampilan_Penaksir',
                        'Kegiatan_Penaksir_Lainnya',
                        'Sikap_Penaksir_dalam_Melayani_Nasabah',
                        'Sikap_Penaksir_Saat_Mengakhiri_Pelayanan',
                        'Sikap_Penaksir_Saat_Menyambut_Nasabah_Datang',
                        'Sikap_Saat_Melayani_di_Telepon_dan_Handling_Complaint',
                        'Skill_Penaksir',
                        'Total_Pengelola_Agunan_KONDISI_1',
                        'Kegiatan_Pegelola_Agunan_Lainnya',
                        'Penampilan_Pengelola_Agunan',
                        'Sikap_Pengelola_Agunan_dalam_Melayani_Nasabah',
                        'Sikap_Pengelola_Agunan_Saat_Menyambut_Nasabah_Datang',
                        'Sikap_yang_Dilakukan_Pengelola_Agunan_Saat_Mengakhiri_Layanan',
                        'Skill_Pengelola_Agunan',
                        'Total_RO_KONDISI_1',
                        'Penampilan_RO',
                        'Kegiatan_RO_Lainnya',
                        'Sikap_RO_Saat_Melayani_Nasabah',
                        'Sikap_RO_Saat_Menyambut_Nasabah_Datang',
                        'Sikap_yang_Dilakukan_RO_Saat_Mengakhiri_Layanan',
                        'Skill_RO',
                        'Total_Satpam_KONDISI_1',
                        'Total_Keberadaan_Satpam',
                        'Kegiatan_Satpam_Lainnya',
                        'Pelayanan_dan_Pencegahan_oleh_Satpam',
                        'Pelayanan_dan_Pencegahan_oleh_Karyawan',
                        'Penampilan_Satpam',
                        'Sikap_Satpam_Saat_Melayani_Nasabah',
                        'Sikap_Satpam_Saat_Melayani_Nasabah',
                        'Sikap_Satpam_Saat_Nasabah_Keluar']
                        var getAspek = arrelement[element-1]
    }
    var skenario = await getTopSkenarioByArray(arrbranch, getAspek, sort)
    if(sort=="DESC"){
        for (let x = 0; x < skenario.length; x++) {
            jsonres.push({nama: skenario[x].cabang, label: typesql, achievement: skenario[x].total})
        }
    }else{
        for (let x = skenario.length-1; x >= 0 ; x--) {
            jsonres.push({nama: skenario[x].cabang, label: typesql, achievement: skenario[x].total})
        }
    }
    res.send(jsonres)
}