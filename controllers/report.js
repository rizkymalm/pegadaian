const moment = require("moment");
const db = require("../models/db");
const fs = require("fs");
const path = require("path");

function getKanwil() {
  return new Promise((resolve) => {
    db.query("SELECT * FROM region", function (err, result) {
      resolve(result);
    });
  });
}
function getArea() {
  return new Promise((resolve) => {
    db.query("SELECT * FROM area GROUP BY id_area", function (err, result) {
      resolve(result);
    });
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

function getKanwilById(id) {
  return new Promise((resolve) => {
    if (id != "all" && id != "") {
      var sql = "SELECT * FROM region WHERE id_region=" + id;
    } else {
      var sql = "SELECT * FROM region";
    }
    db.query(sql, function (err, result) {
      resolve(result);
    });
  });
}
function getAreaByIdRegion(id) {
  return new Promise((resolve) => {
    if (id != "all" && id != "") {
      var sql = "SELECT * FROM area WHERE id_region=" + id;
    } else {
      var sql = "SELECT * FROM area";
    }
    db.query(sql, function (err, result) {
      resolve(result);
    });
  });
}

function getBranchByIdArea(id) {
  return new Promise((resolve) => {
    if (id != "all" && id != "") {
      var sql = "SELECT * FROM sub_branch WHERE id_area=" + id;
    } else {
      var sql = "SELECT * FROM sub_branch";
    }
    db.query(sql, function (err, result) {
      resolve(result);
    });
  });
}

function getBranchById(id) {
  return new Promise((resolve) => {
    if (id != "all" && id != "") {
      var sql = "SELECT * FROM sub_branch WHERE id_sub_branch=" + id;
    } else {
      var sql = "SELECT * FROM sub_branch";
    }
    db.query(sql, function (err, result) {
      resolve(result);
    });
  });
}

function getAspekById(id) {
  return new Promise((resolve) => {
    if (id != "all" && id != "") {
      var sql = "SELECT * FROM aspek WHERE id_aspek=9";
    } else {
      var sql = "SELECT * FROM aspek WHERE id_aspek=9";
    }
    db.query(sql, function (err, result) {
      resolve(result);
    });
  });
}
function getElementByIdAspek(id) {
  return new Promise((resolve) => {
    if (id != "all" && id != "") {
      var sql = `SELECT * FROM element WHERE id_aspek=${id}`;
    } else {
      var sql = `SELECT * FROM element`;
    }
    db.query(sql, function (err, result) {
      resolve(result);
    });
  });
}

function getElementByIdElement(id) {
  return new Promise((resolve) => {
    if (id != "all" && id != "") {
      var sql = "SELECT * FROM element WHERE id_element=" + id;
    } else {
      var sql = "SELECT * FROM element";
    }
    db.query(sql, function (err, result) {
      resolve(result);
    });
  });
}

exports.getReport = async function (req, res) {
  // if (req.session.email == undefined) {
    // res.redirect("../login");
  // } else {
    var login = {
      idses: req.session.id,
      nameses: req.session.name,
      emailses: req.session.email,
      subbranch: req.session.subbranch,
    };
    var kanwil = await getKanwil();
    var aspek = await getAspek();
    db.query(
      "SELECT * FROM sub_branch WHERE id_sub_branch=?",
      login.subbranch,
      function (err, sub_branch) {
        res.render("report", {
          login: login,
          moment: moment,
          subBranch: sub_branch,
          kanwil: kanwil,
          aspek: aspek,
        });
      }
    );
  // }
};

function getSkenario(kanwil, area, type) {
  return new Promise((resolve) => {
    if (type == "region") {
      var sql = "SELECT * FROM region";
    } else if (type == "area") {
      var sql = "SELECT * FROM area WHERE id_region=" + kanwil;
    } else if (type == "subbranch") {
      var sql =
        "SELECT * FROM sub_branch WHERE id_region=" +
        kanwil +
        " AND id_area='" +
        area +
        "'";
    } else if (type == "year") {
      var sql = "SELECT * FROM region";
    }
    db.query(sql, async function (err, result) {
      resolve(result);
    });
  });
}

exports.getReportAjax = async function (req, res) {
  var kanwil = req.query.kanwil;
  var area = req.query.area;
  var cabang = req.query.cabang;
  var aspek = req.query.aspek;
  // var element = req.query.element
  if (kanwil == "all" && area == "all" && cabang == "all") {
    var typesql = "region";
    var skenario = await getKanwilById(kanwil);
  } else if (kanwil != "all" && area == "all" && cabang == "all") {
    var typesql = "area";
    var skenario = await getAreaByIdRegion(kanwil);
  } else if (kanwil == "all" && area != "all" && cabang == "all") {
    var typesql = "area";
    var skenario = await getKanwilById(kanwil);
  } else if (kanwil != "all" && area != "all" && cabang == "all") {
    var typesql = "subbranch";
    var skenario = await getBranchByIdArea(area);
  } else if (kanwil != "all" && area != "all" && cabang != "all") {
    var typesql = "subbranch";
    var skenario = await getBranchById(cabang);
  }
  if (aspek == 9) {
    var typeaspek = "ASPEK";
    var skenarioAspek = await getAspek();
  } else {
    var typeaspek = "ELEMENT";
    var skenarioAspek = await getElementByIdAspek(aspek);
  }
  // if(aspek==9 && element=="all"){
  //     var typeaspek = "ASPEK"
  //     var skenarioAspek = await getElementByIdAspek(9)
  // }else if(aspek!=9 && element=="all"){
  //     var typeaspek = "ELEMENT"
  //     var skenarioAspek = await getElementByIdAspek(aspek)
  // }else if(aspek==9 && element!="all"){
  //     var typeaspek = "ASPEK"
  //     var skenarioAspek = await getAspekById(aspek)
  // }else if(aspek!=9 && element!="all"){
  //     var typeaspek = "ELEMENT"
  //     var skenarioAspek = await getElementByIdElement(element)
  // }
  var dataExport = [];
  var jsonkanwil = [];
  var jsonaspek = [];
  for (var i = 0; i < skenario.length; i++) {
    if (typesql == "region") {
      jsonkanwil.push({ nama: skenario[i].region, label: "KANWIL" });
    } else if (typesql == "area") {
      jsonkanwil.push({ nama: skenario[i].area_name, label: "AREA" });
    } else if (typesql == "subbranch") {
      jsonkanwil.push({ nama: skenario[i].sub_branch_name, label: "BRANCH" });
    }
  }
  for (var i = 0; i < skenarioAspek.length; i++) {
    if (typeaspek == "ASPEK") {
      jsonaspek.push({ nama: skenarioAspek[i].label_aspek, label: "ASPEK" });
    } else if (typeaspek == "ELEMENT") {
      jsonaspek.push({
        nama: skenarioAspek[i].label_element,
        label: "ELEMENT",
      });
    } else if (typeaspek == "ELEMENT") {
      jsonaspek.push({
        nama: skenarioAspek[i].label_element,
        label: "ELEMENT",
      });
    }
  }
  if (typeaspek == "ASPEK") {
    jsonaspek.push({ nama: "OTHER", label: "ASPEK" });
  } else if (typeaspek == "ELEMENT") {
    jsonaspek.push({ nama: "OTHER", label: "ELEMENT" });
  } else if (typeaspek == "ELEMENT") {
    jsonaspek.push({ nama: "OTHER", label: "ELEMENT" });
  }
  dataExport.push(jsonkanwil);
  dataExport.push(jsonaspek);
  res.send(dataExport);
};

exports.getElementByAspek = (req, res) => {
  if (req.params.aspek != 9) {
    var sql = "SELECT * FROM element WHERE id_aspek=" + req.params.aspek;
  } else {
    var sql = "SELECT * FROM element WHERE id_aspek=10";
  }
  db.query(sql, (err, results) => {
    if (err) {
      res.send("error");
    } else {
      res.render("partials/elementbyaspek", {
        result: results,
      });
    }
  });
};

exports.getReportInternalPegadaian = async function (req, res) {
  if (req.session.email == undefined) {
    res.redirect("../login");
  } else {
    var login = {
      idses: req.session.id,
      nameses: req.session.name,
      emailses: req.session.email,
      subbranch: req.session.subbranch,
    };
    var kanwil = await getKanwil();
    var aspek = await getAspek();
    db.query(
      "SELECT * FROM sub_branch WHERE id_sub_branch=?",
      login.subbranch,
      function (err, sub_branch) {
        res.render("reportPegadaian", {
          login: login,
          moment: moment,
          subBranch: sub_branch,
          kanwil: kanwil,
          aspek: aspek,
        });
      }
    );
  }
};
