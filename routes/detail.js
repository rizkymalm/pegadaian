const express = require("express");
const detailController = require("../controllers/detail");
const Router = express.Router();
Router.get("/", detailController.getDetail)
Router.get("/pegadaian-internal", detailController.getDetailInternalPegadaian)
Router.get("/content/", detailController.getDetailContent)
Router.get("/:tipe/:idcabang", detailController.getDetailVideo)
Router.get("/content-internal", detailController.getDetailContentInternal)

module.exports = Router;