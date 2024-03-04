const db = require("../models/db");
const moment = require("moment");
const fs = require("fs");
const { type, setPriority } = require("os");
const { resolve } = require("path");
const { json } = require("body-parser");
require("../library");

function getBranchByKanwil(id, type, kategori) {
  return new Promise((resolve) => {
    if (type == "kanwil") {
      if (id == "all") {
        if (kategori !== "all") {
          var sql = `SELECT * FROM sub_branch WHERE status='${kategori}'`;
        } else {
          var sql = `SELECT * FROM sub_branch`;
        }
      } else {
        if (kategori !== "all") {
          var sql = `SELECT * FROM sub_branch WHERE id_region=${id} AND status='${kategori}'`;
        } else {
          var sql = `SELECT * FROM sub_branch WHERE id_region=${id}`;
        }
      }
    } else if (type == "area") {
      if (kategori !== "all") {
        var sql = `SELECT * FROM sub_branch WHERE id_area=${id} AND status='${kategori}'`;
      } else {
        var sql = `SELECT * FROM sub_branch WHERE id_area=${id}`;
      }
    }
    console.log(sql);
    db.query(sql, async function (err, result) {
      resolve(result);
    });
  });
}

function getBranchByKanwil2(id, type) {
  return new Promise((resolve) => {
    if (type == "kanwil") {
      if (id == "all") {
        var sql = "SELECT * FROM sub_branch";
      } else {
        var sql = `SELECT * FROM sub_branch WHERE id_region=${id}`;
      }
    } else if (type == "area") {
      var sql = `SELECT * FROM sub_branch WHERE id_area=${id}`;
    } else if (type == "cabang") {
      var sql = `SELECT * FROM sub_branch WHERE id_sub_branch=${id}`;
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

function getTopSkenarioByArrayDetail(array, page, perPage) {
  return new Promise((resolve) => {
    var sql = `SELECT * FROM newskenario WHERE id_sub_branch IN(${array}) LIMIT  ${
      page * perPage
    },${perPage}`;
    db.query(sql, async function (err, result) {
      resolve(result);
    });
  });
}

exports.getIndex = (req, res) => {
  if (req.session.email == undefined) {
    res.redirect("./login");
  } else {
    var login = {
      idses: req.session.id,
      nameses: req.session.name,
      emailses: req.session.email,
      subbranch: req.session.subbranch,
    };
    db.query(
      "SELECT * FROM sub_branch WHERE id_sub_branch=?",
      login.subbranch,
      (err, sub_branch) => {
        res.render("index", {
          login: login,
          moment: moment,
        });
      }
    );
  }
};

exports.getScorePerformance = async (req, res) => {
  var kategori = req.query.kategori;
  var kanwil = req.query.kanwil;
  var area = req.query.area;
  var aspek = req.query.aspek;
  var element = req.query.element;
  var sort = req.query.sortby;
  console.log(kategori, kanwil, area, element, aspek);
  if (kanwil == "all" && area == "all") {
    var typesql = "kanwil";
    var selectBranch = await getBranchByKanwil(kanwil, typesql, kategori);
    console.log(selectBranch);
  } else if (kanwil != "all" && area == "all") {
    var typesql = "kanwil";
    var selectBranch = await getBranchByKanwil(kanwil, typesql, kategori);
  } else if (kanwil != "all" && area != "all") {
    var typesql = "area";
    var selectBranch = await getBranchByKanwil(area, typesql, kategori);
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
  var categories = [];
  var result = [];
  if (sort == "DESC") {
    for (let x = 0; x < skenario.length; x++) {
      categories.push(skenario[x].cabang);
      result.push(skenario[x].total);
      //   jsonres.push({
      //     nama: skenario[x].cabang,
      //     label: typesql,
      //     achievement: skenario[x].total,
      //   });
    }
  } else {
    for (let x = skenario.length - 1; x >= 0; x--) {
      categories.push(skenario[x].cabang);
      result.push(skenario[x].total);
      //   jsonres.push({
      //     nama: skenario[x].cabang,
      //     label: typesql,
      //     achievement: skenario[x].total,
      //   });
    }
  }
  res.status(200).json({
    statusCode: 200,
    message: "Success get performance score",
    categories: categories,
    data: result,
  });
};

exports.getDetailBranchScore = async (req, res) => {
  var login = {
    idses: req.session.id,
    nameses: req.session.name,
    emailses: req.session.email,
    subbranch: req.session.subbranch,
  };
  var kanwil = req.query.kanwil;
  var area = req.query.area;
  var cabang = req.query.cabang;
  var page = req.query.page;
  var perPage = req.query.perPage;
  // var aspek = req.query.aspek;
  if (kanwil == "all" && area == "all") {
    var typesql = "kanwil";
    var selectBranch = await getBranchByKanwil2(kanwil, typesql);
  } else if (kanwil != "all" && area == "all") {
    var typesql = "kanwil";
    var selectBranch = await getBranchByKanwil2(kanwil, typesql);
  } else if (kanwil != "all" && area != "all" && cabang == "all") {
    var typesql = "area";
    var selectBranch = await getBranchByKanwil2(area, typesql);
  } else if (kanwil != "all" && area != "all" && cabang != "all") {
    var typesql = "cabang";
    var selectBranch = await getBranchByKanwil2(cabang, typesql);
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
  var skenario = await getTopSkenarioByArrayDetail(arrbranch, page, perPage);
  for (let i = 0; i < skenario.length; i++) {
    var kanwilbyid = await getKanwilById(skenario[i].id_region);
    var areabyid = await getAreaById(skenario[i].id_area);
    var cabangbyid = await getCabangByID(skenario[i].id_sub_branch);
    if (skenario[i].total_kebersihan != null) {
      var kebersihan = skenario[i].total_kebersihan.toFixed(2);
    } else {
      var kebersihan = "N/A";
    }
    if (skenario[i].total_ro != null && skenario[i].total_ro != 0) {
      var total_RO = skenario[i].total_ro.toFixed(2);
    } else {
      var total_RO = "N/A";
    }
    var arrStatus = ["UPC", "CABANG", "COLLOCATION"];
    var getTaskGadai = await getTaskByIdCabang(
      skenario[i].id_sub_branch,
      "gadai",
      skenario[i].status
    );
    if (getTaskGadai.length > 0) {
      var linkGadai = getTaskGadai[0].id;
    }
    var getTaskLunas = await getTaskByIdCabang(
      skenario[i].id_sub_branch,
      "lunas",
      skenario[i].status
    );
    if (getTaskLunas.length > 0) {
      var linkLunas = getTaskLunas[0].id;
    }
    var getTaskPhone = await getTaskByIdCabang(
      skenario[i].id_sub_branch,
      "phone",
      skenario[i].status
    );
    if (getTaskPhone.length > 0) {
      var linkPhone = getTaskPhone[0].id;
    }
    jsonres.push({
      id_skenario: skenario[i].id_skenario,
      id_cabang: skenario[i].id_sub_branch,
      outlet: cabangbyid[0].code_outlet,
      region: kanwilbyid[0].region.replace("KANWIL ", ""),
      area: areabyid[0].area_name.replace("AREA ", ""),
      cabang: skenario[i].sub_branch_name,
      status: skenario[i].status,
      total_skor: skenario[i].total_skor,
      totalSatpam: Math.round(skenario[i].total_satpam * 100) / 100,
      totalPenaksir: Math.round(skenario[i].total_penaksir * 100) / 100,
      totalKasir: Math.round(skenario[i].total_kasir * 100) / 100,
      totalKebersihan: kebersihan,
      totalNewNormal: Math.round(skenario[i].total_prokes * 100) / 100,
      totalPengelolaAgunan:
        Math.round(skenario[i].total_pengelola_agunan * 100) / 100,
      totalFrontliner: Math.round(skenario[i].total_frontliner * 100) / 100,
      totalRO: total_RO,
      kategori:
        skenario[i].total_skor <= 60
          ? "Copper"
          : skenario[i].total_skor > 60 && skenario[i].total_skor <= 70
          ? "Bronze"
          : skenario[i].total_skor > 70 && skenario[i].total_skor <= 80
          ? "Silver"
          : skenario[i].total_skor > 80 && skenario[i].total_skor <= 90
          ? "Gold"
          : skenario[i].total_skor > 90
          ? "Diamond"
          : "",
      linkGadai: linkGadai,
      linkLunas: linkLunas,
      linkPhone: linkPhone,
    });
  }
  res.status(200).json({
    statusCode: 200,
    message: "Success get performance score",
    data: jsonres,
  });
};
