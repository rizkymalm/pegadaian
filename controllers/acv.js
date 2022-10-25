const db = require("../models/db");
const moment = require("moment");
const fs = require("fs");
const { type, setPriority } = require("os");
const { resolve } = require("path");
const { json } = require("body-parser");
require("../library");

exports.getAcv = async function (req, res) {
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
    var area = await getArea();
    var aspek = await getAspek();
    db.query(
      "SELECT * FROM sub_branch WHERE id_sub_branch=?",
      login.subbranch,
      (err, sub_branch) => {
        res.render("acv", {
          login: login,
          moment: moment,
          subBranch: sub_branch,
          kanwil: kanwil,
          area: area,
          aspek: aspek,
        });
      }
    );
  }
};

exports.getAcvPegadaian = async function (req, res) {
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
    var area = await getArea();
    var aspek = await getAspek();
    db.query(
      "SELECT * FROM sub_branch WHERE id_sub_branch=?",
      login.subbranch,
      (err, sub_branch) => {
        res.render("acvPegadaian", {
          login: login,
          moment: moment,
          subBranch: sub_branch,
          kanwil: kanwil,
          area: area,
          aspek: aspek,
        });
      }
    );
  }
};

function randomNumber(min, max) {
  return new Promise((resolve) => {
    var random = Math.random() * (max - min) + min;
    var number = Math.floor(random);
    resolve(number);
  });
}

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

function countSkenario(kanwil, type) {
  return new Promise((resolve) => {
    if (type == "region") {
      var sql = "SELECT * FROM skenario WHERE id_region=" + kanwil;
    } else if (type == "area") {
      var sql = "SELECT * FROM skenario WHERE id_area=" + kanwil;
    }
    db.query(sql, async function (err, result) {
      resolve(result);
    });
  });
}

function avgSkenario(kanwil, type, skenario) {
  return new Promise((resolve) => {
    if (type == "region") {
      var sql =
        `SELECT AVG(${skenario}) AS avg FROM newskenario WHERE id_region=${kanwil}`
    } else if (type == "area") {
      var sql =
        `SELECT AVG(${skenario}) AS avg FROM newskenario WHERE id_area=${kanwil}`
    } else if (type == "subbranch") {
      var sql =
        `SELECT AVG(${skenario}) AS avg FROM newskenario WHERE id_sub_branch=${kanwil}`
    } else if (type == "year") {
      var sql =
        "SELECT AVG(Total_Skor_) AS avg FROM newskenario WHERE id_region=" +
        kanwil +
        " AND tahun=" +
        skenario +
        " AND " +
        skenario +
        " IS NOT NULL";
    }
    db.query(sql, function (err, result) {
      resolve(result[0].avg);
    });
  });
}

function getSkenarioByRegion(skenario, region) {
  return new Promise((resolve) => {
    if (type == "region") {
      var sql =
        "SELECT AVG(" +
        skenario +
        ") AS avg FROM skenario WHERE id_region=" +
        kanwil;
    } else if (type == "area") {
      var sql =
        "SELECT AVG(" +
        skenario +
        ") AS avg FROM skenario WHERE id_area=" +
        kanwil;
    } else if (type == "subbranch") {
      var sql =
        "SELECT AVG(" +
        skenario +
        ") AS avg FROM skenario WHERE id_sub_branch=" +
        kanwil;
    } else if (type == "year") {
      var sql =
        "SELECT AVG(Total_Skor_) AS avg FROM skenario WHERE id_region=" +
        kanwil +
        " AND tahun=" +
        skenario;
    }
    db.query(sql, function (err, result) {
      resolve(result[0].avg);
    });
  });
}

exports.getAcvAjax = async function (req, res) {
  var kanwil = req.query.kanwil;
  var area = req.query.area;
  var date = req.query.date;
  var aspek = req.query.aspek;
  if (kanwil == "all" && area == "all" && date == "all" && date != 2020) {
    var typesql = "region";
  } else if (kanwil != "all" && area == "all") {
    var typesql = "area";
  } else if (kanwil != "all" && area != "all") {
    var typesql = "subbranch";
  } else if (date != "all" && date != 2020) {
    var typesql = "year";
  } else if (date == 2020) {
    var typesql = "region";
  }
  var skenario = await getSkenario(kanwil, area, typesql);
  var jsonres = [];
  if (aspek == 9) {
    for (var i = 0; i < skenario.length; i++) {
      var rand = await randomNumber(1, 100);
      var arrskenario = ["total_skor"];
      if (typesql == "region") {
        var total = 0;
        for (let x = 0; x < arrskenario.length; x++) {
          var searchAvg = await avgSkenario(
            skenario[i].id_region,
            typesql,
            arrskenario[x]
          );
          total = total + searchAvg;
        }
        var average = total;
        jsonres.push({
          nama: skenario[i].region.replace("KANWIL ", ""),
          label: "KANWIL",
          achievement: average,
        });
      } else if (typesql == "area") {
        var total = 0;
        for (let x = 0; x < arrskenario.length; x++) {
          var searchAvg = await avgSkenario(
            skenario[i].id_area,
            typesql,
            arrskenario[x]
          );
          total = total + searchAvg;
        }
        var average = total;
        jsonres.push({
          nama: skenario[i].area_name.replace("AREA ", ""),
          label: "AREA",
          achievement: average,
        });
      } else if (typesql == "subbranch") {
        var total = 0;
        for (let x = 0; x < arrskenario.length; x++) {
          var searchAvg = await avgSkenario(
            skenario[i].id_sub_branch,
            typesql,
            arrskenario[x]
          );
          total = total + searchAvg;
        }
        var average = total;
        jsonres.push({
          nama: skenario[i].sub_branch_name,
          label: "BRANCH",
          achievement: average,
        });
      } else if (typesql == "year") {
        var searchAvg = await avgSkenario(skenario[i].id_region, typesql, date);
        var average = searchAvg;
        jsonres.push({
          nama: skenario[i].region,
          label: "YEAR",
          achievement: average,
        });
      }
    }
  } else {
    var arraspek = [
      ["total_satpam"],
      ["total_penaksir"],
      ["total_kasir"],
      ["total_pengelola_agunan"],
      ["total_ro"],
      ["total_prokes"],
      ["total_kebersihan"],
      ["total_frontliner"],
    ];
    for (let a = 0; a < skenario.length; a++) {
      if (typesql == "region") {
        var total = 0;
        for (var i = 0; i < arraspek[aspek - 1].length; i++) {
          var searchAvg = await avgSkenario(
            skenario[a].id_region,
            typesql,
            arraspek[aspek - 1][i]
          );
          total = total + searchAvg;
        }
        var average = total / arraspek[aspek - 1].length;
        jsonres.push({
          nama: skenario[a].region.replace("KANWIL ", ""),
          label: "KANWIL",
          achievement: average,
        });
      } else if (typesql == "area") {
        var total = 0;
        for (var i = 0; i < arraspek[aspek - 1].length; i++) {
          var searchAvg = await avgSkenario(
            skenario[a].id_area,
            typesql,
            arraspek[aspek - 1][i]
          );
          total = total + searchAvg;
        }
        var average = total / arraspek[aspek - 1].length;
        jsonres.push({
          nama: skenario[a].area_name.replace("AREA ", ""),
          label: "AREA",
          achievement: average,
        });
      } else if (typesql == "subbranch") {
        var total = 0;
        for (var i = 0; i < arraspek[aspek - 1].length; i++) {
          var searchAvg = await avgSkenario(
            skenario[a].id_sub_branch,
            typesql,
            arraspek[aspek - 1][i]
          );
          total = total + searchAvg;
        }
        var average = total / arraspek[aspek - 1].length;
        jsonres.push({
          nama: skenario[a].sub_branch_name,
          label: "BRANCH",
          achievement: average,
        });
      }
    }
  }
  res.send(jsonres);
};

exports.getAreaByKanwil = (req, res) => {
  if (req.params.kanwil != "all") {
    var sql = `SELECT * FROM area WHERE id_region=${req.params.kanwil}`;
  } else {
    var sql = "SELECT * FROM area";
  }
  db.query(sql, (err, results) => {
    if (err) {
      res.send("error");
    } else {
      res.render("partials/areabykanwil", {
        result: results,
      });
    }
  });
};

exports.getBranchByArea = (req, res) => {
  const kategori = req.params.kategori
  var splitKategori = kategori.split(',');
  var kategoriStatus='';
  for (let i = 0; i < splitKategori.length; i++) {
    if(i === splitKategori.length - 1){
      kategoriStatus+=`'${splitKategori[i]}'`
    }else{
      kategoriStatus+=`'${splitKategori[i]}',`
    }
  }
  if (req.params.area != "all") {
    if(req.params.wave === 'undefined'){
      if(req.params.kategori === 'all' || req.params.kategori === 'undefined'){
        var sql = `SELECT * FROM sub_branch WHERE id_area=${req.params.area}`;
      }else{
        var sql = `SELECT * FROM sub_branch WHERE id_area=${req.params.area} AND status IN(${kategoriStatus})`;
      }
    }else{
      if(req.params.kategori === 'all' || req.params.kategori === 'undefined'){
        var sql = `SELECT * FROM sub_branch WHERE id_area=${req.params.area} AND wave=${req.params.wave}`;
      }else{
        var sql = `SELECT * FROM sub_branch WHERE id_area=${req.params.area} AND wave=${req.params.wave} AND status IN(${kategoriStatus})`;
      }
    }
  } else {
    if(req.params.kategori === 'all' || req.params.kategori === 'undefined'){
      var sql = `SELECT * FROM sub_branch WHERE status IN(${kategoriStatus})`;
    }else{
      var sql = `SELECT * FROM sub_branch`;
    }
  }
  db.query(sql, (err, results) => {
    if (err) {
      res.send("error");
    } else {
      res.render("partials/branchbyarea", {
        result: results,
      });
    }
  });
};

exports.getTop = async function (req, res) {
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
    var area = await getArea();
    var aspek = await getAspek();
    res.render("top", {
      login: login,
      moment: moment,
      kanwil: kanwil,
      area: area,
      aspek: aspek,
    });
  }
};

exports.getTopPegadaian = async function (req, res) {
  if (req.session.email == undefined) {
    res.redirect("../../login");
  } else {
    var login = {
      idses: req.session.id,
      nameses: req.session.name,
      emailses: req.session.email,
      subbranch: req.session.subbranch,
    };
    var kanwil = await getKanwil();
    var area = await getArea();
    var aspek = await getAspek();
    res.render("topPegadaian", {
      login: login,
      moment: moment,
      kanwil: kanwil,
      area: area,
      aspek: aspek,
    });
  }
};

exports.getBottom = async function (req, res) {
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
    var area = await getArea();
    var aspek = await getAspek();
    res.render("bottom", {
      login: login,
      moment: moment,
      kanwil: kanwil,
      area: area,
      aspek: aspek,
    });
  }
};
exports.getBottomPegadaian = async function (req, res) {
  if (req.session.email == undefined) {
    res.redirect("../../login");
  } else {
    var login = {
      idses: req.session.id,
      nameses: req.session.name,
      emailses: req.session.email,
      subbranch: req.session.subbranch,
    };
    var kanwil = await getKanwil();
    var area = await getArea();
    var aspek = await getAspek();
    res.render("bottomPegadaian", {
      login: login,
      moment: moment,
      kanwil: kanwil,
      area: area,
      aspek: aspek,
    });
  }
};

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
    }
    db.query(sql, async function (err, result) {
      resolve(result);
    });
  });
}

function getTopSkenarioByArray(array, aspek, sort) {
  return new Promise((resolve) => {
    var sql =
      "SELECT sub_branch_name AS cabang, " +
      aspek +
      " AS total FROM newskenario WHERE id_sub_branch IN(" +
      array +
      ") AND " +
      aspek +
      " IS NOT NULL ORDER BY " +
      aspek +
      " " +
      sort +
      ", id_skenario ASC LIMIT 10";
    db.query(sql, async function (err, result) {
      resolve(result);
    });
  });
}

exports.getTopContent = async function (req, res) {
  var kanwil = req.query.kanwil;
  var area = req.query.area;
  var aspek = req.query.aspek;
  var element = req.query.element;
  var sort = req.query.sortby;
  if (kanwil == "all" && area == "all") {
    var typesql = "kanwil";
    var selectBranch = await getBranchByKanwil(kanwil, typesql);
  } else if (kanwil != "all" && area == "all") {
    var typesql = "kanwil";
    var selectBranch = await getBranchByKanwil(kanwil, typesql);
  } else if (kanwil != "all" && area != "all") {
    var typesql = "area";
    var selectBranch = await getBranchByKanwil(area, typesql);
  }
  var jsonres = [];
  var arrbranch = "";
  for (let i = 0; i < selectBranch.length; i++) {
    if (i == selectBranch.length - 1) {
      arrbranch += selectBranch[i].id_sub_branch;
    } else {
      arrbranch += selectBranch[i].id_sub_branch + ",";
    }
  }
  if (aspek == "all") {
    var typeaspek = "ASPEK";
    var getAspek = "total_skor";
  } else if (aspek != "all" && element == "all") {
    var typeaspek = "ELEMENT";
    var arraspek = [
      "total_satpam",
      "total_penaksir",
      "total_kasir",
      "total_pengelola_agunan",
      "total_ro",
      "total_prokes",
      "total_kebersihan",
      "total_frontliner",
    ];
    var getAspek = arraspek[aspek - 1];
  } else if (aspek != "all" && element != "all") {
    var typeaspek = "ELEMENT";
    var arrelement = [
      "total_satpam",
      "keberadaan_satpam",
      "sikap_satpam_menyambut",
      "sikap_satpam_melayani",
      "sikap_satpam_saat_nasabah_keluar",
      "penampilan_satpam",
      "total_penaksir",
      "sikap_penaksir_menyambut",
      "penampilan_penaksir",
      "sikap_penaksir_melayani",
      "skill_penaksir",
      "sikap_penaksir_mengakhiri_pelayanan",
      "total_kasir",
      "sikap_kasir_menyambut",
      "penampilan_kasir",
      "sikap_kasir_melayani",
      "skill_kasir",
      "sikap_kasir_mengakhiri_pelayanan",
      "total_pengelola_agunan",
      "sikap_pa_menyambut_nasabah",
      "penampilan_pa",
      "sikap_pa_Melayani_nasabah",
      "skill_pa",
      "sikap_pa_mengakhiri_pelayanan",
      "total_ro",
      "sikap_ro_menyambut_nasabah",
      "penampilan_ro",
      "sikap_ro",
      "skill_ro",
      "sikap_ro_mengakhiri_pelayanan",
      "total_prokes",
      "prokes_satpam",
      "fasilitas_prokes",
      "prokes_karyawan",
      "total_kebersihan",
      "eksterior",
      "interior",
      "total_telpon",
      "total_frontliner",
      "sikap_frontliner_menerima_telepon",
      "sikap_frontliner_handling_complaint",
      "sikap_frontliner_mengakhiri_telepon",
    ];
    var getAspek = arrelement[element - 1];
  }
  var skenario = await getTopSkenarioByArray(arrbranch, getAspek, sort);
  if (sort == "DESC") {
    for (let x = 0; x < skenario.length; x++) {
      jsonres.push({
        nama: skenario[x].cabang,
        label: typesql,
        achievement: skenario[x].total,
      });
    }
  } else {
    for (let x = skenario.length - 1; x >= 0; x--) {
      jsonres.push({
        nama: skenario[x].cabang,
        label: typesql,
        achievement: skenario[x].total,
      });
    }
  }
  res.send(jsonres);
};


exports.getTopPegadaianContent = async function (req, res) {
  var kanwil = req.query.kanwil;
  var area = req.query.area;
  var aspek = req.query.aspek;
  var element = req.query.element;
  var sort = req.query.sortby;
  if (kanwil == "all" && area == "all") {
    var typesql = "kanwil";
    var selectBranch = await getBranchByKanwil(kanwil, typesql);
  } else if (kanwil != "all" && area == "all") {
    var typesql = "kanwil";
    var selectBranch = await getBranchByKanwil(kanwil, typesql);
  } else if (kanwil != "all" && area != "all") {
    var typesql = "area";
    var selectBranch = await getBranchByKanwil(area, typesql);
  }
  var jsonres = [];
  var arrbranch = "";
  for (let i = 0; i < selectBranch.length; i++) {
    if (i == selectBranch.length - 1) {
      arrbranch += selectBranch[i].id_sub_branch;
    } else {
      arrbranch += selectBranch[i].id_sub_branch + ",";
    }
  }
  if (aspek == "all") {
    var typeaspek = "ASPEK";
    var getAspek = "Total_Skor_";
  } else if (aspek != "all" && element == "all") {
    var typeaspek = "ELEMENT";
    var arraspek = [
      "Total_Frontliner",
      "Total_Kasir_KONDISI_1",
      "Total_Kebersihan_KONDISI_1",
      "Total_New_Normal_KONDISI_1",
      "Total_Penaksir_KONDISI_1",
      "Total_Pengelola_Agunan_KONDISI_1",
      "Total_RO_KONDISI_1",
      "Total_Satpam_KONDISI_1",
    ];
    var getAspek = arraspek[aspek - 1];
  } else if (aspek != "all" && element != "all") {
    var typeaspek = "ELEMENT";
    var arrelement = [
      "Total_Frontliner",
      "Kegiatan_Frontliner_Lainnya",
      "Sikap_Frontliner_Dalam_Menerima_Panggilan_Telepon",
      "Sikap_Frontliner_Dalam_Mengakhiri_Panggilan_Telepon",
      "Total_Kasir_KONDISI_1",
      "Kegiatan_Kasir_Lainnya",
      "Penampilan_Kasir",
      "Sikap_Kasir_dalam_Melayani_Nasabah",
      "Sikap_Kasir_Saat_Mengakhiri_Pelayanan",
      "Sikap_Kasir_Saat_Menyambut_Nasabah_Datang",
      "Skill_Kasir",
      "total_kebersihan",
      "eksterior",
      "interior",
      "total_prokes",
      "prokes_satpam",
      "fasilitas_prokes",
      "prokes_karyawan",
      "total_penaksir",
      "sikap_penaksir_menyambut",
      "penampilan_penaksir",
      "sikap_penaksir_melayani",
      "skill_penaksir",
      "sikap_penaksir_mengakhiri_pelayanan",
      "total_pengelola_agunan",
      "sikap_pa_menyambut_nasabah",
      "penampilan_pa",
      "sikap_pa_Melayani_nasabah",
      "skill_pa",
      "sikap_pa_mengakhiri_pelayanan",
      "total_ro",
      "sikap_ro_menyambut_nasabah",
      "penampilan_ro",
      "sikap_ro",
      "skill_ro",
      "sikap_ro_mengakhiri_pelayanan",
      "total_satpam",
      "keberadaan_satpam",
      "sikap_satpam_menyambut",
      "sikap_satpam_melayani",
      "sikap_satpam_saat_nasabah_keluar",
      "penampilan_satpam",
    ];
    var getAspek = arrelement[element - 1];
  }
  var skenario = await getTopSkenarioByArray(arrbranch, getAspek, sort);
  if (sort == "DESC") {
    for (let x = 0; x < skenario.length; x++) {
      jsonres.push({
        nama: skenario[x].cabang,
        label: typesql,
        achievement: skenario[x].total,
      });
    }
  } else {
    for (let x = skenario.length - 1; x >= 0; x--) {
      jsonres.push({
        nama: skenario[x].cabang,
        label: typesql,
        achievement: skenario[x].total,
      });
    }
  }
  res.send(jsonres);
};
