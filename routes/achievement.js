const express = require("express");
const acvController = require("../controllers/achievement");
const Router = express.Router();
Router.get("/", acvController.getAchievement);
Router.get("/pegadaian-internal", acvController.getAchievementPegadaian);
Router.get("/detail", acvController.getAchievementDetail);
Router.get("/detail/pegadaian-internal", acvController.getAchievementDetailPegadaian);
Router.get("/detail/content", acvController.getAchievementDetailConent);
Router.get("/detail/content-internal", acvController.getAchievementDetailConentInternal);
Router.get("/content", acvController.getAchievementAjax);
Router.get("/content-internal", acvController.getAchievementInternalAjax);

module.exports = Router;