const db = require("../models/db");
const moment = require("moment");
const fs = require("fs");
const { type, setPriority } = require("os");
const { resolve } = require("path");
const { json } = require("body-parser");
require("../library");

exports.getFilterKanwil = async (req, res) => {
  var kanwil = await getKanwil();
  console.log(kanwil);

  res.status(200).json({
    statusCode: 200,
    message: "Success get filter area bykanwil",
    data: kanwil,
  });
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
      res.status(200).json({
        statusCode: 200,
        message: "Success get filter area bykanwil",
        data: results,
      });
    }
  });
};

exports.getBranchByArea = (req, res) => {
  if (req.params.area != "all") {
    if (req.params.wave === "undefined") {
      var sql = `SELECT * FROM sub_branch WHERE id_area=${req.params.area} AND status IN('cabang','upc', 'collocation')`;
    } else {
      var sql = `SELECT * FROM sub_branch WHERE id_area=${req.params.area} AND wave=${req.params.wave} AND status IN('cabang','upc', 'collocation')`;
    }
  } else {
    var sql = `SELECT * FROM sub_branch WHERE status IN('cabang','upc', 'collocation')`;
  }
  db.query(sql, (err, results) => {
    if (err) {
      res.send("error");
    } else {
      res.status(200).json({
        statusCode: 200,
        message: "Success get filter area bykanwil",
        data: results,
      });
    }
  });
};
