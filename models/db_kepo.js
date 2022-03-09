const mysql = require("mysql");
const con = mysql.createConnection({
    host: "localhost",
    user: "adminqdt",
    password: "QDTadmin@537",
    database: "kepo",
    multipleStatements: true
})

con.connect(err => {
    if (err){
        throw err;
    }
})
module.exports = con;