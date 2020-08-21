const moment = require("moment")
const path = require("path")
const fs = require("fs")
const directoryPath = path.join(__dirname, '../public/rawdata')
const xslx = require("xlsx")
const db = require("../models/db");
exports.getIndex = (req,res) =>{
    if(req.session.email==undefined){
        res.redirect("./login")
    }else{
        var login = ({idses: req.session.id, nameses: req.session.name, emailses: req.session.email, subbranch: req.session.subbranch})
        var ach = []
        var totalach = 0
        var percentageach = []
        fs.readdir(directoryPath, function(err,files){
            var num = []
            for(var f=0;f<files.length;f++){
                var workbook  = xslx.readFile("public/rawdata/"+files[f]);
                var sheetname_list = workbook.SheetNames;
                sheetname_list.forEach(async function(y){
                    var worksheet = workbook.Sheets[y];
                    var headers = {};
                    var data = [];
                    for(z in worksheet){
                        if(z[0] === '|')continue;
                        var tt = 0;
                        for (let i = 0; i < z.length; i++) {
                            if(!isNaN(z[i])){
                                tt = i;
                                break;
                            }
                        };
                        var col = z.substring(0,tt)
                        var row = parseInt(z.substring(tt));
                        var value = worksheet[z].v;
                        if(row == 1 && value) {
                            headers[col] = value;
                            continue;
                        }
                        if(!data[row]) data[row]={};
                        data[row][headers[col]] = value;
                    }
                    data.shift();
                    data.shift();
                    num.push(data.length)
                    totalach = totalach + data.length
                })
            }
            ach.push({"gadai": num[0], "pelunasan": num[1], "telepon": num[2]})
            percentageach.push({"gadai": num[0] * 100 / totalach, "pelunasan": num[1] * 100 / totalach, "telepon": num[2] * 100 / totalach})
            console.log(totalach)
            db.query("SELECT * FROM sub_branch WHERE id_sub_branch=?", login.subbranch, (err,sub_branch)=>{
                res.render("index", {
                    login: login,
                    moment: moment,
                    subBranch: sub_branch,
                    ach: ach,
                    percentageach: percentageach,
                    totalach: totalach
                })
            })
        })
    }
}