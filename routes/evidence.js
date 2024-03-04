const express = require("express");
const evidenceController = require("../controllers/evidence");
const Router = express.Router();
const db = require("../models/db");
Router.get("/", evidenceController.getEvidence);
Router.get("/detail/:id", evidenceController.getDetailEvidence);
Router.get("/list/branch", evidenceController.getListBranchEvidence);

module.exports = Router;
