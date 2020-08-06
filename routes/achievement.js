const express = require("express");
const acvController = require("../controllers/achievement");
const Router = express.Router();
const db = require("../models/db");
Router.get("/", acvController.getAcv)
Router.get("/areabykanwil/:kanwil", acvController.getAreaByKanwil)
Router.get("/content", acvController.getAcvAjax)

module.exports = Router;