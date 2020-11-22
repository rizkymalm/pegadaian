const express = require("express");
const acvController = require("../controllers/achievement");
const Router = express.Router();
const db = require("../models/db");
Router.get("/", acvController.getAcv)
Router.get("/areabykanwil/:kanwil", acvController.getAreaByKanwil)
Router.get("/branchbyarea/:area", acvController.getBranchByArea)
Router.get("/content", acvController.getAcvAjax)
Router.get("/top/content/", acvController.getTopContent)
Router.get("/top", acvController.getTop)

module.exports = Router;