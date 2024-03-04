const express = require("express");
const filterController = require("../controllers/filter");
const Router = express.Router();

Router.get("/kanwil", filterController.getFilterKanwil);
Router.get("/areabykanwil/:kanwil", filterController.getAreaByKanwil);
Router.get("/branchbyarea/:area/:wave", filterController.getBranchByArea);


module.exports = Router;