const db = require("../models/db");
const moment = require("moment");
require("../library");
require("../library/axios");
exports.getAchievement = async function (req, res) {
  // if (req.session.email == undefined) {
  //   res.redirect("../login");
  // } else {
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
  // }
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
  var wave = req.query.wave;
  var kanwil = req.query.kanwil;
  var area = req.query.area;
  var cabang = req.query.cabang;
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
  var skenario = await getSkenarioByArray(arrbranch);
  var arrYN = ["N", "Y"]; // nanti hapus
  for (let i = 0; i < skenario.length; i++) {
    var linkGadai = 0;
    var getTaskGadai = await getTaskByIdCabang(skenario[i].id_sub_branch, 'gadai', skenario[i].status);
    if(getTaskGadai.length > 0){
      linkGadai = getTaskGadai[0].id;
    }
    var linkLunas = 0;
    var getTaskLunas = await getTaskByIdCabang(skenario[i].id_sub_branch, 'lunas', skenario[i].status);
    if(getTaskLunas.length > 0){
      linkLunas = getTaskLunas[0].id;
    }
    var linkPhone = 0

    var getTaskPhone = await getTaskByIdCabang(skenario[i].id_sub_branch, 'phone', skenario[i].status);
    if(getTaskPhone.length > 0){
      linkPhone = getTaskPhone[0].id;
    }
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
      linkGadai: linkGadai,
      linkLunas: linkLunas,
      linkPhone: linkPhone
    });
  }
  res.render("partials/DetailContentAchievement", {
    jsonres: jsonres,
  });
};

exports.getAchievementAjax = async function (req, res) {
  // var date = req.query.date;
  // var aspek = req.query.aspek;
  var wave = req.query.wave;
  var kanwil = req.query.kanwil;
  var area = req.query.area;
  var cabang = req.query.cabang;
  console.log(wave, kanwil, area, cabang)
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
  var splitarrbranch = arrbranch.split(',');
  const skenarioData = await getTaskByArray(arrbranch);
  for (let a = 0; a < splitarrbranch.length; a++) {
    const skenarioData2 = await getTaskByArray(splitarrbranch[a]);
    // console.log(skenarioData2)
  }
  // var codeverified = [];
  var gadai = 0;
  var telepon = 0;
  var lunas = 0;
  var cabang = 0; //randomIntFromInterval(0, 321);
  var upc = 0; //randomIntFromInterval(0, 61);
  var collocation = 0; //randomIntFromInterval(0, 25);
  for (let i = 0; i < skenarioData.length; i++) {
    const taskStatus = await getTaskStatusByArray(skenarioData[i].id);
    for (let x = 0; x < taskStatus.length; x++) {
      if(taskStatus[x].state === 200){
        if (skenarioData[i].skenario === "gadai") {
          gadai++;
        }
        if (skenarioData[i].skenario === "phone") {
          telepon++;
        }
        if (skenarioData[i].skenario === "lunas") {
          lunas++;
        }
        if (skenarioData[i].status === "cabang") {
          cabang++;
        }
        if (skenarioData[i].status === "collocation") {
          collocation++;
        }
        if (skenarioData[i].status === "upc") {
          upc++;
        }
        break;
      }
    }
  }
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
  var category = [
    {
      label: "CABANG",
      y: (cabang * 100) / 963,
      count: cabang,
    },
    {
      label: "UPC",
      y: (upc * 100) / 183,
      count: upc,
    },
    {
      label: "COLLOCATION",
      y: (collocation * 100) / 75,
      count: collocation,
    },
  ];
  var achievement = gadai + lunas + telepon;
  var shortfall = 1221 - achievement;
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

exports.getAchievementInternalAjax = async function (req, res) {
  var kanwil = req.query.kanwil !== "all" ? req.query.kanwil : "";
  var area = req.query.area !== "all" ? req.query.area : "";
  var branch = req.query.cabang !== "all" ? req.query.cabang : "";
  var date = req.query.date;
  var gadai = randomIntFromInterval(0, 407);
  var telepon = randomIntFromInterval(0, 407);
  var lunas = randomIntFromInterval(0, 407);
  // var skenario = [
  //   {
  //     label: "GADAI",
  //     y: (gadai * 100) / 407,
  //     count: gadai,
  //   },
  //   {
  //     label: "TELEPON",
  //     y: (telepon * 100) / 407,
  //     count: telepon,
  //   },
  //   {
  //     label: "LUNAS",
  //     y: (lunas * 100) / 407,
  //     count: lunas,
  //   },
  // ];
  var cabang = randomIntFromInterval(0, 321);
  var upc = randomIntFromInterval(0, 61);
  var collocation = randomIntFromInterval(0, 25);
  // var category = [
  //   {
  //     label: "CABANG",
  //     y: (cabang * 100) / 321,
  //     count: cabang,
  //   },
  //   {
  //     label: "UPC",
  //     y: (upc * 100) / 61,
  //     count: upc,
  //   },
  //   {
  //     label: "COLLOCATION",
  //     y: (collocation * 100) / 25,
  //     count: collocation,
  //   },
  // ];
  var achievement = await getAxios(
    `http://survey.kadence.co.id:9999/api/achievement/break/IDD3039?break1=REGION&break2=AREA&break3=NAMA_CABANG&code1=${kanwil}&code2=${area}&code3=${branch}`
  );
  // var shortfall = 1221 - achievement;
  var overview = [
    // {
    //   label: "TARGET",
    //   y: 0,
    //   count: 1221,
    // },
    {
      label: "TOTAL ACHIEVEMENT",
      y: achievement.data.total,
      count: achievement.data.total,
    },
    // {
    //   label: "SHORTFALL",
    //   y: ((shortfall * 100) / 1221).toFixed(2),
    //   count: shortfall,
    // },
  ];
  const skenario = await getAxios(
    `http://survey.kadence.co.id:9999/api/achievement/IDD3039/S0C/?break1=REGION&break2=AREA&break3=NAMA_CABANG&code1=${kanwil}&code2=${area}&code3=${branch}`
  );
  const category = await getAxios(
    `http://survey.kadence.co.id:9999/api/achievement/IDD3039/KATEGORI_OUTLET/?break1=REGION&break2=AREA&break3=NAMA_CABANG&code1=${kanwil}&code2=${area}&code3=${branch}`
  );
  const aspek = await getAxios(
    `http://survey.kadence.co.id:9999/api/achievement/IDD3039/S0B/?break1=REGION&break2=AREA&break3=NAMA_CABANG&code1=${kanwil}&code2=${area}&code3=${branch}`
  );
  // var dataSkenario = [];
  // var totalSkenario = 0;
  // for (let i = 0; i < skenario.data.length; i++) {
  //   totalSkenario = skenario.data[i].y + totalSkenario;
  // }
  // for (let i = 0; i < skenario.data.length; i++) {
  //   dataSkenario.push({
  //     label: skenario.data[i].label,
  //     count: skenario.data[i].y,
  //     y: (skenario.data[i].y * 100) / totalSkenario,
  //   })
  // }
  res.send([skenario.data, category.data, overview, aspek.data]);
};

exports.getAchievementPegadaian = async function (req, res) {
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
    db.query(
      "SELECT * FROM sub_branch WHERE id_sub_branch=?",
      login.subbranch,
      (err, sub_branch) => {
        res.render("achievementPegadaian", {
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

exports.getAchievementDetailPegadaian = async function (req, res) {
  var login = {
    idses: req.session.id,
    nameses: req.session.name,
    emailses: req.session.email,
    subbranch: req.session.subbranch,
  };
  var kanwil = await getKanwil();
  var aspek = await getAspek();
  res.render("achievementdetailPegadaian", {
    moment: moment,
    login: login,
    kanwil: kanwil,
    aspek: aspek,
  });
};

exports.getAchievementDetailConentInternal = async function (req, res) {
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
  var touchpoint = await getTouchpointByArray(arrbranch);
  var arrYN = ["N", "Y"]; // nanti hapus
  for (let i = 0; i < touchpoint.length; i++) {
    var kanwilbyid = await getKanwilById(touchpoint[i].id_region);
    var areabyid = await getAreaById(touchpoint[i].id_area);

    jsonres.push({
      id_skenario: touchpoint[i].id_skenario,
      id_cabang: touchpoint[i].id_sub_branch,
      region: kanwilbyid[0].region.replace("KANWIL ", ""),
      area: areabyid[0].area_name.replace("AREA ", ""),
      cabang: touchpoint[i].sub_branch_name,
      gadai: touchpoint[i].satpam > 0 ? "Y" : "N",
      pelunasan: touchpoint[i].satpam > 0 ? "Y" : "N",
      telepon: touchpoint[i].satpam > 0 ? "Y" : "N",
      satpam: touchpoint[i].satpam > 0 ? "Y" : "N",
      penaksir: touchpoint[i].penaksir > 0 ? "Y" : "N",
      kasir: touchpoint[i].kasir > 0 ? "Y" : "N",
      pengelolaagunan: touchpoint[i].pengelolaagunan > 0 ? "Y" : "N",
      ro: touchpoint[i].ro > 0 ? "Y" : "N",
      protokolkesehatan: touchpoint[i].protokolkesehatan > 0 ? "Y" : "N",
      kebersihan: touchpoint[i].kebersihan > 0 ? "Y" : "N",
    });
  }
  res.render("partials/DetailContentAchievementInternal", {
    jsonres: jsonres,
  });
};
