const express = require("express");
const acvController = require("../controllers/achievement");
const Router = express.Router();
Router.get("/", acvController.getAchievement);
Router.get("/detail", acvController.getAchievementDetail);
Router.get("/detail/content", acvController.getAchievementDetailConent);
Router.get("/content", acvController.getAchievementAjax);

module.exports = Router;