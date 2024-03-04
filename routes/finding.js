const express = require("express");
const findingController = require("../controllers/findings");
const Router = express.Router();

Router.get("/", findingController.getIndex);
Router.get("/performance/", findingController.getScorePerformance);
Router.get("/branch/", findingController.getDetailBranchScore);

module.exports = Router;
