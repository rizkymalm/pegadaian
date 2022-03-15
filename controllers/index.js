const moment = require("moment");
const db = require("../models/db");
exports.getIndex = (req, res) => {
  if (req.session.email == undefined) {
    res.redirect("./login");
  } else {
    var login = {
      idses: req.session.id,
      nameses: req.session.name,
      emailses: req.session.email,
      subbranch: req.session.subbranch,
    };
    db.query(
      "SELECT * FROM sub_branch WHERE id_sub_branch=?",
      login.subbranch,
      (err, sub_branch) => {
        res.render("index", {
          login: login,
          moment: moment,
        });
      }
    );
  }
};

exports.getLandingPage = async function (req, res) {
  if (req.session.email == undefined) {
    res.redirect("./login");
  } else {
    var login = {
      idses: req.session.id,
      nameses: req.session.name,
      emailses: req.session.email,
      subbranch: req.session.subbranch,
    };
    res.render("landingpage", {
      login: login,
      moment: moment,
    });
  }
};
