const db = require("../models/db");
global.randomIntFromInterval = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
global.getKanwil = function () {
  return new Promise((resolve) => {
    db.query("SELECT * FROM region", function (err, result) {
      resolve(result);
    });
  });
};
global.getArea = function () {
  return new Promise((resolve) => {
    db.query("SELECT * FROM area GROUP BY id_area", function (err, result) {
      resolve(result);
    });
  });
};
global.getAspek = function () {
  return new Promise((resolve) => {
    db.query(
      "SELECT * FROM aspek WHERE id_aspek NOT IN(9)",
      function (err, result) {
        resolve(result);
      }
    );
  });
};

global.getKanwilById = async function (id) {
  return new Promise((resolve) => {
    db.query(
      "SELECT * FROM region WHERE id_region=?",
      id,
      function (err, result) {
        resolve(result);
      }
    );
  });
};
global.getAreaById = async function (id) {
  return new Promise((resolve) => {
    db.query("SELECT * FROM area WHERE id_area=?", id, function (err, result) {
      resolve(result);
    });
  });
};

global.getCabang = async function () {
  return new Promise((resolve) => {
    db.query(
      "SELECT * FROM sub_branch GROUP BY id_sub_branch",
      function (err, result) {
        resolve(result);
      }
    );
  });
}

global.getBranchByKanwil = async function (id, type) {
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
};


global.getTopSkenarioByArray = async function (array) {
  return new Promise(resolve =>{ 
      var sql = "SELECT * FROM skenario WHERE id_sub_branch IN("+array+")"
      db.query(sql, async function(err,result){
          resolve(result)
      })
  })
}

global.getTouchpointByArray = async function (array) {
  return new Promise(resolve =>{ 
      var sql = "SELECT * FROM touchpoint WHERE id_sub_branch IN("+array+")"
      db.query(sql, async function(err,result){
          resolve(result)
      })
  })
}

global.getSkenarioByArray = async function (array) {
  return new Promise(resolve =>{ 
      var sql = "SELECT * FROM skenario2 WHERE id_sub_branch IN("+array+")"
      db.query(sql, async function(err,result){
          resolve(result)
      })
  })
}
