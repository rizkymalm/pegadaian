const db = require("../models/db");
const moment = require("moment");
require("../library");
exports.getAchievement = async function (req, res) {
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
        res.render("achievement", {
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

exports.getAchievementDetail = async function (req, res) {
  var login = {
    idses: req.session.id,
    nameses: req.session.name,
    emailses: req.session.email,
    subbranch: req.session.subbranch,
  };
  var kanwil = await getKanwil();
  var aspek = await getAspek();
  res.render("achievementdetail", {
    moment: moment,
    login: login,
    kanwil: kanwil,
    aspek: aspek,
  });
};

exports.getAchievementDetailConent = async function (req, res) {
  var login = {
    idses: req.session.id,
    nameses: req.session.name,
    emailses: req.session.email,
    subbranch: req.session.subbranch,
  };
  var kanwil = req.query.kanwil;
  var area = req.query.area;
  var cabang = req.query.cabang;
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
  var arrYN = ["N", "Y"]; // nanti hapus
  for (let i = 0; i < skenario.length; i++) {
    var kanwilbyid = await getKanwilById(skenario[i].id_region);
    var areabyid = await getAreaById(skenario[i].id_area);
    if (skenario[i].Total_Kebersihan_KONDISI_1 != null) {
      var kebersihan = skenario[i].Total_Kebersihan_KONDISI_1.toFixed(2);
    } else {
      var kebersihan = "N/A";
    }
    if (skenario[i].Total_RO_KONDISI_1 != null) {
      var total_RO = skenario[i].Total_RO_KONDISI_1.toFixed(2);
    } else {
      var total_RO = "N/A";
    }
    var acvGadai = randomIntFromInterval(0, 1);
    var acvCalling = randomIntFromInterval(0, 1);
    var acvCalling2 = randomIntFromInterval(0, 1);
    jsonres.push({
      id_skenario: skenario[i].id_skenario,
      id_cabang: skenario[i].id_sub_branch,
      region: kanwilbyid[0].region.replace("KANWIL ", ""),
      area: areabyid[0].area_name.replace("AREA ", ""),
      cabang: skenario[i].CABANG,
      status:
        acvGadai === 1 && acvCalling === 1 && acvCalling2 === 1 ? "Y" : "N",
      acvGadai: arrYN[acvGadai],
      acvCalling: arrYN[acvCalling],
      acvCalling2: arrYN[acvCalling2],
    });
  }
  res.render("partials/DetailContentAchievement", {
    jsonres: jsonres,
  });
};

exports.getAchievementAjax = async function (req, res) {
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
  var gadai = randomIntFromInterval(0, 407);
  var telepon = randomIntFromInterval(0, 407);
  var lunas = randomIntFromInterval(0, 407);
  var skenario = [
    {
      label: "GADAI",
      y: (gadai * 100) / 407,
      count: gadai,
    },
    {
      label: "TELEPON",
      y: (telepon * 100) / 407,
      count: telepon,
    },
    {
      label: "LUNAS",
      y: (lunas * 100) / 407,
      count: lunas,
    },
  ];
  var cabang = randomIntFromInterval(0, 321);
  var upc = randomIntFromInterval(0, 61);
  var collocation = randomIntFromInterval(0, 25);
  var category = [
    {
      label: "CABANG",
      y: (cabang * 100) / 321,
      count: cabang,
    },
    {
      label: "UPC",
      y: (upc * 100) / 61,
      count: upc,
    },
    {
      label: "COLLOCATION",
      y: (collocation * 100) / 25,
      count: collocation,
    },
  ];
  var achievement = gadai + lunas + telepon;
  var shortfall = 1221 - achievement
  var overview = [
    {
      label: "TARGET",
      y: 0,
      count: 1221,
    },
    {
      label: "ACHIEVEMENT",
      y: ((achievement * 100) / 1221).toFixed(2),
      count: achievement,
    },
    {
      label: "SHORTFALL",
      y: ((shortfall * 100) / 1221).toFixed(2),
      count: shortfall,
    },
  ];

  res.send([skenario, category, overview]);
};
