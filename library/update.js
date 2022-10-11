const db = require("../models/db");

global.selectAllSkenario = async function () {
    return new Promise((resolve) => {
      var sql =
        "SELECT * FROM skenario2";
      db.query(sql, async function (err, result) {
        resolve(result);
      });
    });
  };

  global.selectAllTask = async function () {
    return new Promise((resolve) => {
      var sql =
        "SELECT * FROM task";
      db.query(sql, async function (err, result) {
        resolve(result);
      });
    });
  };

  global.selectAllTaskNotNull = async function () {
    return new Promise((resolve) => {
      var sql =
        "SELECT * FROM task WHERE wave=2 AND filename NOT IN('NULL')";
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

  global.checkStatusByTask = async function (task) {
    return new Promise((resolve) => {
      var sql =
        `SELECT * FROM taskstatus WHERE task = ${task}`;
      db.query(sql, async function (err, result) {
        resolve(result);
      });
    });
  };

  global.updateSkenarioByidCabang = async function (id, skenario, status) {
    return new Promise((resolve) => {
      var sql =
        `UPDATE skenario2 SET ${skenario}=1 WHERE id_sub_branch=${id} AND status='${status}'`;
      db.query(sql, async function (err, result) {
        resolve(result);
      });
    });
  };

  global.updateTouchpont = async function (id, skenario) {
    return new Promise((resolve) => {
      var sql =
        `UPDATE touchpoint SET ${skenario}=1 WHERE id_sub_branch=${id}`;
      db.query(sql, async function (err, result) {
        resolve(result);
      });
    });
  };