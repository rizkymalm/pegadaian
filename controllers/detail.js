const db = require("../models/db");
const moment = require("moment");
const xlsx = require("node-xlsx")
const fs = require("fs");
const { type, setPriority } = require("os");
const { resolve } = require("path");
const { json } = require("body-parser");
const { brotliDecompress } = require("zlib");
require("../library");

function getKanwil() {
  return new Promise((resolve) => {
    db.query("SELECT * FROM region", function (err, result) {
      resolve(result);
    });
  });
}
function getKanwilById(id) {
  return new Promise((resolve) => {
    db.query(
      "SELECT * FROM region WHERE id_region=?",
      id,
      function (err, result) {
        resolve(result);
      }
    );
  });
}
function getAreaById(id) {
  return new Promise((resolve) => {
    db.query("SELECT * FROM area WHERE id_area=?", id, function (err, result) {
      resolve(result);
    });
  });
}

function getCabang() {
  return new Promise((resolve) => {
    db.query(
      "SELECT * FROM sub_branch GROUP BY id_sub_branch",
      function (err, result) {
        resolve(result);
      }
    );
  });
}

function getAspek() {
  return new Promise((resolve) => {
    db.query(
      "SELECT * FROM aspek WHERE id_aspek NOT IN(9)",
      function (err, result) {
        resolve(result);
      }
    );
  });
}

function getBranchByKanwil(id, type) {
  return new Promise((resolve) => {
    if (type == "kanwil") {
      if (id == "all") {
        var sql = "SELECT * FROM sub_branch";
      } else {
        var sql = "SELECT * FROM sub_branch WHERE id_region=" + id;
      }
    } else if (type == "area") {
      var sql = "SELECT * FROM sub_branch WHERE id_area=" + id;
    } else if (type == "cabang") {
      var sql = "SELECT * FROM sub_branch WHERE id_sub_branch=" + id;
    }
    db.query(sql, async function (err, result) {
      resolve(result);
    });
  });
}

exports.getDetail = async function (req, res) {
  var login = {
    idses: req.session.id,
    nameses: req.session.name,
    emailses: req.session.email,
    subbranch: req.session.subbranch,
  };
  var kanwil = await getKanwil();
  var aspek = await getAspek();
  res.render("detailcabang", {
    moment: moment,
    login: login,
    kanwil: kanwil,
    aspek: aspek,
  });
};

function getTopSkenarioByArray(array) {
  return new Promise((resolve) => {
    var sql = "SELECT * FROM newskenario WHERE id_sub_branch IN(" + array + ")";
    db.query(sql, async function (err, result) {
      resolve(result);
    });
  });
}

exports.getDetailContent = async function (req, res) {
  var login = {
    idses: req.session.id,
    nameses: req.session.name,
    emailses: req.session.email,
    subbranch: req.session.subbranch,
  };
  var kanwil = req.query.kanwil;
  var area = req.query.area;
  var cabang = req.query.cabang;
  // var aspek = req.query.aspek;
  if (kanwil == "all" && area == "all") {
    var typesql = "kanwil";
    var selectBranch = await getBranchByKanwil(kanwil, typesql);
  } else if (kanwil != "all" && area == "all") {
    var typesql = "kanwil";
    var selectBranch = await getBranchByKanwil(kanwil, typesql);
  } else if (kanwil != "all" && area != "all" && cabang == "all") {
    var typesql = "area";
    var selectBranch = await getBranchByKanwil(area, typesql);
  } else if (kanwil != "all" && area != "all" && cabang != "all") {
    var typesql = "cabang";
    var selectBranch = await getBranchByKanwil(cabang, typesql);
  }
  var arrbranch = "";
  for (let i = 0; i < selectBranch.length; i++) {
    if (i == selectBranch.length - 1) {
      arrbranch += selectBranch[i].id_sub_branch;
    } else {
      arrbranch += selectBranch[i].id_sub_branch + ",";
    }
  }
  var jsonres = [];
  var skenario = await getTopSkenarioByArray(arrbranch);
  for (let i = 0; i < skenario.length; i++) {
    var kanwilbyid = await getKanwilById(skenario[i].id_region);
    var areabyid = await getAreaById(skenario[i].id_area);
    var cabangbyid = await getCabangByID(skenario[i].id_sub_branch);
    if (skenario[i].total_kebersihan != null) {
      var kebersihan = skenario[i].total_kebersihan.toFixed(2);
    } else {
      var kebersihan = "N/A";
    }
    if (skenario[i].total_ro != null) {
      var total_RO = skenario[i].total_ro.toFixed(2);
    } else {
      var total_RO = "N/A";
    }
    var arrStatus = ["UPC", "CABANG", "COLOCATION"];
    var getTaskGadai = await getTaskByIdCabang(skenario[i].id_sub_branch, 'gadai', skenario[i].status);
    if(getTaskGadai.length > 0){
      var linkGadai = getTaskGadai[0].id;
    }
    var getTaskLunas = await getTaskByIdCabang(skenario[i].id_sub_branch, 'lunas', skenario[i].status);
    if(getTaskLunas.length > 0){
      var linkLunas = getTaskLunas[0].id;
    }
    var getTaskPhone = await getTaskByIdCabang(skenario[i].id_sub_branch, 'phone', skenario[i].status);
    if(getTaskPhone.length > 0){
      var linkPhone = getTaskPhone[0].id;
    }
    jsonres.push({
      id_skenario: skenario[i].id_skenario,
      id_cabang: skenario[i].id_sub_branch,
      outlet: cabangbyid[0].code_outlet,
      region: kanwilbyid[0].region.replace("KANWIL ", ""),
      area: areabyid[0].area_name.replace("AREA ", ""),
      cabang: skenario[i].sub_branch_name,
      status: arrStatus[randomIntFromInterval(0, 2)],
      total_skor: skenario[i].total_skor,
      totalSatpam: Math.round(skenario[i].total_satpam * 100) / 100,
      totalPenaksir:
        Math.round(skenario[i].total_penaksir * 100) / 100,
      totalKasir: Math.round(skenario[i].total_kasir * 100) / 100,
      totalKebersihan: kebersihan,
      totalNewNormal:
        Math.round(skenario[i].total_prokes * 100) / 100,
      totalPengelolaAgunan:
        Math.round(skenario[i].total_pengelola_agunan * 100) / 100,
      totalFrontliner: Math.round(skenario[i].total_frontliner * 100) / 100,
      totalRO: total_RO,
      kategori: skenario[i].total_skor <= 60 ? 'Copper' : skenario[i].total_skor > 60 && skenario[i].total_skor <= 70 ? 'Bronze' : skenario[i].total_skor > 70 && skenario[i].total_skor <= 80 ? 'Silver' : skenario[i].total_skor > 80 && skenario[i].total_skor <= 90 ? 'Gold' : skenario[i].total_skor > 90 ? 'Diamond' : '',
      linkGadai: linkGadai,
      linkLunas: linkLunas,
      linkPhone: linkPhone
    });
  }
  res.render("partials/detailContent", {
    jsonres: jsonres,
  });
};

exports.getDetailVideo = async function (req, res) {
  var id = req.params.idcabang;
  var tipe = req.params.tipe;
  // var randomChar = await random(32)
  var login = {
    idses: req.session.id,
    nameses: req.session.name,
    emailses: req.session.email,
    subbranch: req.session.subbranch,
  };
  db.query(
    `SELECT * FROM taskstatus WHERE task=${id} ORDER BY id ASC`,
    [tipe, id],
    (err, task) => {
      db.query("SELECT * FROM note WHERE task=?", id, (errnote, notess) => {
        res.render("detailevidence", {
          task: task,
          moment: moment,
          login: login,
          notes: notess,
          countfiles:task.length
        });
      });
    }
  );
};

exports.getDetailInternalPegadaian = async function (req, res) {
  var login = {
    idses: req.session.id,
    nameses: req.session.name,
    emailses: req.session.email,
    subbranch: req.session.subbranch,
  };
  var kanwil = await getKanwil();
  var aspek = await getAspek();
  res.render("detailcabanginternal", {
    moment: moment,
    login: login,
    kanwil: kanwil,
    aspek: aspek,
  });
};

exports.getDetailContentInternal = async function (req, res) {
  var login = {
    idses: req.session.id,
    nameses: req.session.name,
    emailses: req.session.email,
    subbranch: req.session.subbranch,
  };
  var kanwil = req.query.kanwil;
  var area = req.query.area;
  var cabang = req.query.cabang;
  var aspek = req.query.aspek;
  if (kanwil == "all" && area == "all") {
    var typesql = "kanwil";
    var selectBranch = await getBranchByKanwil(kanwil, typesql);
  } else if (kanwil != "all" && area == "all") {
    var typesql = "kanwil";
    var selectBranch = await getBranchByKanwil(kanwil, typesql);
  } else if (kanwil != "all" && area != "all" && cabang == "all") {
    var typesql = "area";
    var selectBranch = await getBranchByKanwil(area, typesql);
  } else if (kanwil != "all" && area != "all" && cabang != "all") {
    var typesql = "cabang";
    var selectBranch = await getBranchByKanwil(cabang, typesql);
  }
  var arrbranch = "";
  for (let i = 0; i < selectBranch.length; i++) {
    if (i == selectBranch.length - 1) {
      arrbranch += selectBranch[i].id_sub_branch;
    } else {
      arrbranch += selectBranch[i].id_sub_branch + ",";
    }
  }
  var jsonres = [];
  var skenario = await getTopSkenarioByArray(arrbranch);
  var arrStatus = ["UPC", "CABANG", "COLOCATION"];
  for (let i = 0; i < skenario.length; i++) {
    var kanwilbyid = await getKanwilById(skenario[i].id_region);
    var areabyid = await getAreaById(skenario[i].id_area);
    if (skenario[i].Total_Kebersihan_KONDISI_1 != null) {
      var kebersihan = randomIntFromInterval(0, 100);
    } else {
      var kebersihan = "N/A";
    }
    if (skenario[i].Total_RO_KONDISI_1 != null) {
      var total_RO = randomIntFromInterval(0, 100);
    } else {
      var total_RO = "N/A";
    }
    jsonres.push({
      id_skenario: skenario[i].id_skenario,
      id_cabang: skenario[i].id_sub_branch,
      region: kanwilbyid[0].region.replace("KANWIL ", ""),
      area: areabyid[0].area_name.replace("AREA ", ""),
      cabang: skenario[i].CABANG,
      status: arrStatus[randomIntFromInterval(0, 2)],
      total_skor: randomIntFromInterval(50, 100),
      totalSatpam: randomIntFromInterval(40, 100),
      totalPenaksir: randomIntFromInterval(20, 100),
      totalKasir: randomIntFromInterval(30, 100),
      totalKebersihan: kebersihan,
      totalNewNormal: randomIntFromInterval(10, 100),
      totalPengelolaAgunan: randomIntFromInterval(10, 100),
      totalFrontliner: randomIntFromInterval(0, 100),
      totalRO: total_RO,
    });
  }
  res.render("partials/detailContent", {
    jsonres: jsonres,
  });
};

exports.getDetailExport = async function (req, res) {
  var datefrom = req.body.date_from;
  var dateto = req.body.date_to;
  var type = req.body.type;
  var a = moment(dateto);
  var b = moment(datefrom);
  var newfilename = `report_ms_kadence.xlsx`;
  var isifile = [];
  var header = [
    [
      "No Unit",
      "kanwil",
      "Area",
      "cabang",
      "Status",
      "Total Skor",
      "Telepon",
      "Satpam",
      "Penaksir",
      "Kasir",
      "Kebersihan",
      "Protokol Kesehatan",
      "Pengelola Agunan",
      "RO"
    ],
  ];
  var createfile = header.concat(isifile);
  const progress = xlsx.build([{ name: "Data", data: createfile }]);
  fs.writeFile(
    "public/filexls/" + newfilename,
    progress,
    function (errwritefile) {
      if (errwritefile) {
        console.log("error");
      } else {
        res.render("download", {
          newfilename: newfilename,
        });
      }
    }
  );
};


exports.getDetailExportPegadaian = async function(req,res){
    var datefrom = req.body.date_from;
  var dateto = req.body.date_to;
  var type = req.body.type;
  var a = moment(dateto);
  var b = moment(datefrom);
  var newfilename = `report_ms_pegadaian.xlsx`;
  var isifile = [];
  var header = [
    [
      "No Unit",
      "kanwil",
      "Area",
      "cabang",
      "Status",
      "Achievement Gadai",
      "Achievement Calling",
    ],
  ];
  var createfile = header.concat(isifile);
  const progress = xlsx.build([{ name: "Data", data: createfile }]);
  fs.writeFile(
    "public/filexls/" + newfilename,
    progress,
    function (errwritefile) {
      if (errwritefile) {
        console.log("error");
      } else {
        res.render("download", {
          newfilename: newfilename,
        });
      }
    }
  );
}