const axios = require("axios");
const fs = require("fs");
const path = require("path");
const xslx = require("xlsx");

global.getAxios = async function(url){
    return new Promise((resolve) => {
        axios.get(url)
        .then(function(response){
            resolve(response)
        })
        .catch(function(error){
            resolve(error)
        })
    })
}

global.excelData = function (pid) {
    return new Promise((resolve) => {
      var directoryPath = path.join(process.env.DIRNAME + pid);
      fs.readdir(directoryPath, function (err, files) {
        var dataxls = [];
        var data = [];
        for (var f = 0; f < files.length; f++) {
          var workbook = xslx.readFile(directoryPath + "/" + files[f]);
          var sheetname_list = workbook.SheetNames;
          sheetname_list.forEach(async function (y) {
            var worksheet = workbook.Sheets[y];
            var headers = {};
            for (z in worksheet) {
              if (z[0] === "|") continue;
              var tt = 0;
              for (let i = 0; i < z.length; i++) {
                if (!isNaN(z[i])) {
                  tt = i;
                  break;
                }
              }
              var col = z.substring(0, tt);
              var row = parseInt(z.substring(tt));
              var value = worksheet[z].v;
              if (row == 1 && value) {
                headers[col] = value;
                continue;
              }
              if (!data[row]) data[row] = {};
              data[row][headers[col]] = value;
            }
            data.shift();
            data.shift();
            for (var d = 0; d < data.length; d++) {
              dataxls.push(data[d]);
            }
          });
        }
        resolve(dataxls);
      });
    });
  };