exports.getIndex = (req,res) =>{
    if(req.session.email==undefined){
        res.redirect("./login")
    }else{
        res.render("index")
    }
}