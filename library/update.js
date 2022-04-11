const db = require("../models/db");

global.selectAllSkenario = async function (array) {
    return new Promise((resolve) => {
      var sql =
        "SELECT * FROM skenario2";
      db.query(sql, async function (err, result) {
        resolve(result);
      });
    });
  };

  global.checkStatus = async function (task) {
    return new Promise((resolve) => {
      var sql =
        `SELECT * FROM taskstatus WHERE task = ${task} AND state=200`;
      db.query(sql, async function (err, result) {
        resolve(result);
      });
    });
  };

  global.updateSkenarioByidCabang = async function (id, skenario) {
    return new Promise((resolve) => {
      var sql =
        `UPDATE skenario2 SET ${skenario}=1 WHERE id_sub_branch=${id}`;
      db.query(sql, async function (err, result) {
        resolve(result);
      });
    });
  };