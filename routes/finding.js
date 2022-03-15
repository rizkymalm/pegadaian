const express = require("express");
const findingController = require("../controllers/findings");
const Router = express.Router();

Router.get("/", findingController.getIndex);


module.exports = Router;