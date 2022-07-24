const express = require("express");
const updateController = require("../controllers/update");
const Router = express.Router();
Router.get("/skenario/task", updateController.updateSkenarioByTask);
Router.get("/excel", updateController.updateExcelData);
Router.get("/check", updateController.updateCheck);


module.exports = Router;