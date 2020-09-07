const moment = require("moment")
const db = require("../models/db");
const dbkepo = require("../models/db_kepo");
function countrecord(sql){
    return new Promise(resolve => {
        dbkepo.query(sql, function(err,result){
            resolve(result)
        })
    })
}
exports.getEvidence = async function(req,res){
    if(req.session.email==undefined){
        res.redirect("../login")
    }else{
        var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, subbranch: req.session.subbranch})
        var limit = 20
        if(!req.query.page){
            var page = 0;
        }else{
            var page = req.query.page
        }
        var sqlcount = "SELECT COUNT(*) AS countrec FROM task WHERE project=6 AND filename IS NOT NULL"

        var count = await countrecord(sqlcount)
        console.log(count)
        var math = Math.ceil(count[0].countrec/limit)
        if(page > 1){
            var start = page * limit - limit
        }else{
            var start = 0;
        }
        var arrpage = []
        var pageint = parseInt(page)
        if(page>2){
            if(page>=math-2){
                var startarr = page-5
            }else{
                var startarr = page-3
            }
        }else{
            var startarr = 1
        }
        if(page<=3){
            var endarr = 7
        }else{
            var endarr = pageint+3
        }
        for(var i=startarr;i<=endarr;i++){
            if(i>0 && i<math){
                arrpage.push(i)
            }
        }
        db.query("SELECT * FROM sub_branch WHERE id_sub_branch=?", login.subbranch, async function (err,sub_branch){
            dbkepo.query("SELECT * FROM task WHERE project=6 AND filename IS NOT NULL ORDER BY uploadtime DESC LIMIT ?,?",[start, limit], async function (errtask, task) {
                res.render("evidence", {
                    login: login,
                    moment: moment,
                    subBranch: sub_branch,
                    task: task,
                    count: math,
                    page: page,
                    arrpage: arrpage
                })
            })
        })
    }
}


exports.getDetailEvidence = (req,res) => {
    var id = req.params.id;
    var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, subbranch: req.session.subbranch})
    dbkepo.query("SELECT * FROM task WHERE id=?", id, (err,task)=>{
        res.render("detailevidence",{
            task: task,
            moment: moment,
            login: login
        })
    })
}