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
        var sqlcount = "SELECT COUNT(*) AS countrec FROM task JOIN taskstatus ON task.id=taskstatus.task WHERE task.project=6 AND task.filename IS NOT NULL AND taskstatus.state=200"

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
        if(req.query.search){
            var search = " AND task.deskripsi LIKE '%"+req.query.search+"%'"
        }else{
            var search = ""
        }
        if(req.query.region){
            var qregion = req.query.region
        }else{
            var qregion = ""
        }
        db.query("SELECT * FROM sub_branch WHERE id_sub_branch=?", login.subbranch, async function (err,sub_branch){
            dbkepo.query("SELECT *, task.id AS idtask, taskstatus.id AS idtaskstatus FROM task JOIN taskstatus ON task.id=taskstatus.task WHERE task.project=6 AND task.filename IS NOT NULL AND taskstatus.state=200 "+search+" ORDER BY task.uploadtime DESC LIMIT ?,?",[start, limit], async function (errtask, task) {
                db.query("SELECT * FROM region", login.subbranch, async function (errregion,region){
                    res.render("evidence", {
                        login: login,
                        moment: moment,
                        subBranch: sub_branch,
                        task: task,
                        count: math,
                        page: page,
                        arrpage: arrpage,
                        region: region,
                        qregion: qregion
                    })
                })
            })
        })
    }
}


exports.getDetailEvidence = (req,res) => {
    var id = req.params.id;
    var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, subbranch: req.session.subbranch})
    dbkepo.query("SELECT *, task.id AS idtask, taskstatus.id FROM task JOIN taskstatus ON task.id=taskstatus.task WHERE task.id=?", id, (err,task)=>{
        dbkepo.query("SELECT * FROM note WHERE task=?", id, (errnote,notess) => {
            console.log(errnote)
            res.render("detailevidence",{
                task: task,
                moment: moment,
                login: login,
                notes: notess
            })
        })
    })
}