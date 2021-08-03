const express = require('express');
const bodpParser = require('body-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');
const session = require('express-session');
const expresslayouts = require('express-ejs-layouts');
const mongoStore = require('connect-mongo')(session);
const passport = require('passport');
const flash = require('connect-flash');
const passportlocal = require('passport-local');
const LocalStrategy = passportlocal.Strategy;
var dotenv = require('dotenv');
const router = require('./router/routes');
dotenv.config({ path:'./config/.env' });
const app = express();
const db_info = require('./model/users');
const UserModel = db_info.UserModel;

db_info.connectfunc();

app.use(expresslayouts);
app.set('view engine','ejs');
app.use(bodpParser.urlencoded({extended:true}));
app.use(bodpParser.json());
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:true,
    saveUninitialized:true,
    cookie:{
        maxAge:1000*60*60*24*5
    },
    store:new mongoStore({ mongooseConnection: mongoose.connection,collection:"sessions" })
}));
app.use(flash());
app.use((req,res,next)=>{
        res.locals.success_msg = req.flash('success');
        res.locals.error_msg = req.flash('error');
        next();
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(
    async function(username,password,done){
       
        try {
            
            const user = await UserModel.findOne({username:username});
            if(!user){
                    return done(null,false,{message:"Invalid user name or password"});
            }else{
                const validp = validPassword(password,user.hash,user.salt);
                if(!validp)
                {
                    
                    return done(null,false,{message:"Invalid user name or password"});

                }
                else{
                    return done(null,user);
                }
            }
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser(function(user,done){
    done(null,user._id);
});
passport.deserializeUser(async function(id,done){
    try {
        const User = await UserModel.findById(id);
        done(null,User);
    } catch (error) {
        done(error);
    }
});

app.use('/users',router);
app.get('/login-success', (req, res, next) => {
    console.log(req.user);
    res.send('You successfully logged in.');
});
app.get('/login-failure', (req, res, next) => {
    res.send('You entered the wrong password.');
});
app.get('/proc-route',(req,res)=>{
    if(req.isAuthenticated()){
        console.log(req.user);
        res.send("u r authenticated");
    }else{
        res.send("u r not authenticated");
    }
});
//who sets isAuthenticated and logout methods?
//req.locals or global vars
const port = process.env.PORT || 3000;


function validPassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}
app.listen(port,()=>console.log(`listening at port ${port}`));