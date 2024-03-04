const moment = require("moment");
const { resolve } = require("path");
const db = require("../models/db");
// const dbkepo = require("../models/db_kepo");
function countrecord(sql) {
  return new Promise((resolve) => {
    db.query(sql, function (err, result) {
      resolve(result);
    });
  });
}
exports.getEvidence = async function (req, res) {
  if (req.session.email == undefined) {
    res.redirect("../login");
  } else {
    var login = {
      idses: req.session.id,
      nameses: req.session.name,
      emailses: req.session.email,
      subbranch: req.session.subbranch,
    };
    var limit = 20;
    if (!req.query.page) {
      var page = 0;
    } else {
      var page = req.query.page;
    }
    if (req.query.search) {
      var search = " AND task.deskripsi LIKE '%" + req.query.search + "%'";
    } else {
      var search = "";
    }

    if (req.query.region != undefined) {
      var qregion = req.query.region;
    } else {
      var qregion = "";
    }
    if (req.query.skenario != undefined) {
      var qskenario = req.query.skenario;
    } else {
      var qskenario = "";
    }
    var sqlcount =
      "SELECT COUNT(*) AS countrec FROM task JOIN taskstatus ON task.id=taskstatus.task WHERE task.project=6 AND task.filename IS NOT NULL AND taskstatus.state=200 " +
      search +
      "";

    var count = await countrecord(sqlcount);
    var math = Math.ceil(count[0].countrec / limit);
    if (page > 1) {
      var start = page * limit - limit;
    } else {
      var start = 0;
    }
    var arrpage = [];
    var pageint = parseInt(page);
    if (page > 2) {
      if (page >= math - 2) {
        var startarr = page - 5;
      } else {
        var startarr = page - 3;
      }
    } else {
      var startarr = 1;
    }
    if (page <= 3) {
      var endarr = 7;
    } else {
      var endarr = pageint + 3;
    }
    for (var i = startarr; i <= endarr; i++) {
      if (i > 0 && i < math) {
        arrpage.push(i);
      }
    }

    db.query(
      "SELECT * FROM sub_branch WHERE id_sub_branch=?",
      login.subbranch,
      async function (err, sub_branch) {
        db.query(
          "SELECT *, task.id AS idtask, taskstatus.id AS idtaskstatus FROM task JOIN taskstatus ON task.id=taskstatus.task WHERE task.project=6 AND task.filename IS NOT NULL AND taskstatus.state=200 " +
            search +
            " ORDER BY task.uploadtime DESC LIMIT ?,?",
          [start, limit],
          async function (errtask, task) {
            db.query(
              "SELECT * FROM region",
              login.subbranch,
              async function (errregion, region) {
                res.render("evidence", {
                  login: login,
                  moment: moment,
                  subBranch: sub_branch,
                  task: task,
                  count: math,
                  page: page,
                  arrpage: arrpage,
                  region: region,
                  qregion: qregion,
                  qskenario: qskenario,
                });
              }
            );
          }
        );
      }
    );
  }
};

function random(limit) {
  return new Promise((resolve) => {
    var random = "";
    var char = "1234567890abcdefghijklmnopqrstuvwxyz";
    var charLength = char.length;
    for (var i = 0; i < limit; i++) {
      random += char.charAt(Math.floor(Math.random() * charLength));
    }
    resolve(random);
  });
}

exports.getDetailEvidence = async function (req, res) {
  var id = req.params.id;
  var randomChar = await random(32);
  var login = {
    idses: req.session.id,
    nameses: req.session.name,
    emailses: req.session.email,
    subbranch: req.session.subbranch,
  };
  db.query("SELECT * FROM task WHERE id=?", id, (err, task) => {
    db.query("SELECT * FROM note WHERE task=?", id, (errnote, notess) => {
      res.render("detailevidence", {
        task: task,
        moment: moment,
        login: login,
        notes: notess,
        randomChar: randomChar,
      });
    });
  });
};

exports.getListBranchEvidence = async function (req, res) {
  var wave = req.query.wave;
  var kanwil = req.query.kanwil;
  var area = req.query.area;
  var cabang = req.query.cabang;
  var page = req.query.page;
  var perPage = req.query.perPage;
  if (kanwil == "all" && area == "all") {
    var typesql = "kanwil";
    var selectBranch = await getBranchByKanwil(kanwil, typesql, wave);
  } else if (kanwil != "all" && area == "all") {
    var typesql = "kanwil";
    var selectBranch = await getBranchByKanwil(kanwil, typesql, wave);
  } else if (kanwil != "all" && area != "all" && cabang == "all") {
    var typesql = "area";
    var selectBranch = await getBranchByKanwil(area, typesql, wave);
  } else if (kanwil != "all" && area != "all" && cabang != "all") {
    var typesql = "cabang";
    var selectBranch = await getBranchByKanwil(cabang, typesql, wave);
  }
  var arrbranch = "";
  for (let i = 0; i < selectBranch.length; i++) {
    if (i == selectBranch.length - 1) {
      arrbranch += selectBranch[i].id_sub_branch;
    } else {
      arrbranch += selectBranch[i].id_sub_branch + ",";
    }
  }
  var taskFilter = await getTaskFilter(kanwil, area, cabang);
  var jsonres = [];
  var skenario = await getSkenarioByArrayPagination(arrbranch, page, perPage);
  var countSkenario = await getSkenarioByArrayCount(arrbranch);
  for (let i = 0; i < skenario.length; i++) {
    var kanwilbyid = await getKanwilById(skenario[i].id_region);
    var areabyid = await getAreaById(skenario[i].id_area);
    jsonres.push({
      id_skenario: skenario[i].id_skenario,
      id_cabang: skenario[i].id_sub_branch,
      region: kanwilbyid[0].region.replace("KANWIL ", ""),
      area: areabyid[0].area_name.replace("AREA ", ""),
      cabang: skenario[i].sub_branch_name,
      status: skenario[i].status,
      acvGadai: skenario[i].gadai > 0 ? "Y" : "N",
      acvPelunasan: skenario[i].lunas > 0 ? "Y" : "N",
      acvTelepon: skenario[i].phone > 0 ? "Y" : "N",
      linkGadai: "linkGadai",
      linkLunas: "linkLunas",
      linkPhone: "linkPhone",
    });
  }
  res.status(200).json({
    statusCode: 200,
    message: "Success get list branch",
    totalData: countSkenario[0].NumberOfSkenario,
    data: jsonres,
  });
};
