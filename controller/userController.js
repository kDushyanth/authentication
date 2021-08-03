const db_info = require('../model/users');
const UserModel = db_info.UserModel;
const crypto = require('crypto');

 const getLogin = (req,res)=>{
    res.render('login',{title:"login",err:[]});
}
 const postLogin = (err,req,res,next)=>{
    if(err)next(err);
}
 const getRegister = (req,res)=>{
    res.render('register',{title:"register",err:[]});
}
 const postRegister = async (req,res)=>{
        
    const userName = typeof(req.body.username)==undefined? "":req.body.username.trim();
    const password1 =typeof(req.body.password1)==undefined? "": req.body.password1.trim();
    const password2 =typeof(req.body.password2)==undefined? "": req.body.password2.trim();
    //validation
    var err=[];
    if(userName==""||password1=="" || password2==""){
        err.push("Please enter all entries")
    }
    if(password2!=password1){
        err.push("Please enter matching passwords for confirmation");
    }
    if(password1.length<8){
        err.push("Please enter a password of length atleast 8");
    }
    if(userName.length!=0){
        try {
            const found = await UserModel.find({username:userName});
            if(found.length!=0){
                err.push("Username already exists");
            }
        } catch (error) {
            console.log(error);
        }
       
    }
    if(err.length==0){
                
                const saltHash = genPassword(password1);
                const salt = saltHash.salt;
                const hash = saltHash.hash;
                const newUser = new UserModel({
                    username: userName,
                    hash: hash,
                    salt: salt
                });
            
                try {
                    const user = await newUser.save();
                    req.flash('success','Registered successfully and can Log in');
                    res.redirect('/users/login');

                } catch (error) {
                    console.log(error);
                }
     }else{
        res.render('register',{title:"register",info:{username:userName,password1:password1,password2:password2},err:err});
     }
}
 const logout = (req, res, next) => {
    req.logout();
    req.flash('success','Logged out successfully!');
    res.redirect('/users/login');
}
function genPassword(password) {
    var salt = crypto.randomBytes(32).toString('hex');
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return {
      salt: salt,
      hash: genHash
    };
}
module.exports = {logout,getLogin,getRegister,postLogin,postRegister};