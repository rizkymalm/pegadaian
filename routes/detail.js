const express = require("express");
const detailController = require("../controllers/detail");
const Router = express.Router();
Router.get("/", detailController.getDetail)
Router.get("/export", detailController.getDetailExport)
Router.get("/pegadaian-internal", detailController.getDetailInternalPegadaian)
Router.get("/pegadaian-internal/export", detailController.getDetailExportPegadaian)
Router.get("/content/", detailController.getDetailContent)
Router.get("/:tipe/:idcabang", detailController.getDetailVideo)
Router.get("/content-internal", detailController.getDetailContentInternal)

module.exports = Router;