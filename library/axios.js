const axios = require("axios");

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