const express = require("express")
const mysql = require("mysql")
const bodyParser = require("body-parser")
const ejs = require("ejs")

const app = express();

app.listen(4001, (req,res) => {
    console.log("start")
})