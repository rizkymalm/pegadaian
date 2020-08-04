const express = require("express");
const evidenceController = require("../controllers/evidence");
const Router = express.Router();
const db = require("../models/db");
Router.get("/", evidenceController.getEvidence)

module.exports = Router;