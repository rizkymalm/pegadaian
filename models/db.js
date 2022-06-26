const mysql = require("mysql");
require("dotenv").config()
const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database:'idd3039_berlin_update'
})

con.connect(err => {
    if (err){
        throw err;
    }
})
module.exports = con;