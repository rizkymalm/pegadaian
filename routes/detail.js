const express = require("express");
const detailController = require("../controllers/detail");
const Router = express.Router();
Router.get("/", detailController.getDetail)
Router.get("/content/", detailController.getDetailContent)
Router.get("/:tipe/:idcabang", detailController.getDetailVideo)

module.exports = Router;