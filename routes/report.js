const express = require("express");
const reportController = require("../controllers/report");
const Router = express.Router();

Router.get("/", reportController.getReport);
Router.get("/content/", reportController.getReportAjax);
Router.get("/elementbyaspek/:aspek", reportController.getElementByAspek)

Router.get("/pegadaian-internal", reportController.getReportInternalPegadaian);
module.exports = Router;