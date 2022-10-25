const express = require("express");
const acvController = require("../controllers/acv");
const Router = express.Router();
const db = require("../models/db");
Router.get("/", acvController.getAcv);
Router.get("/pegadaian-internal", acvController.getAcvPegadaian);
Router.get("/areabykanwil/:kanwil", acvController.getAreaByKanwil);
Router.get("/branchbyarea/:area/:wave/:kategori", acvController.getBranchByArea);
Router.get("/content", acvController.getAcvAjax);
Router.get("/top/content/", acvController.getTopContent);
Router.get("/top", acvController.getTop);
Router.get("/top/pegadaian-internal", acvController.getTopPegadaian);
Router.get("/top/pegadaian-internal/content", acvController.getTopPegadaianContent);
Router.get("/bottom", acvController.getBottom);
Router.get("/bottom/pegadaian-internal", acvController.getBottomPegadaian);

module.exports = Router;
