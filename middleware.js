module.exports.isLoggedIn = (req, res, next) =>{
    //CREATING A VARIABLE TO STORE THE VALUE OF THE PATH if user is not logged in
    req.session.redirectUrl = req.originalUrl;

    if(!req.isAuthenticated()){
        req.flash("error", "You must be logged in to create new transaction.");
        return res.redirect("/login");
    }
    next();
}

//SAVING THE redirectURL 
module.exports.saveRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};