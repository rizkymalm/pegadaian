const express = require("express");
const updateController = require("../controllers/update");
const Router = express.Router();
Router.get("/skenario/task", updateController.updateSkenarioByTask);


module.exports = Router;