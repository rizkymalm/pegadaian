const express = require("express");
const indexController = require("../controllers/index");
const Router = express.Router();

Router.get("/", indexController.getIndex);
Router.get("/landingpage", indexController.getLandingPage);


module.exports = Router;