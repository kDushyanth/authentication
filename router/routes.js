const express = require('express');
const router = express.Router();
const passport = require('passport');
const {getLogin,postLogin,getRegister,postRegister,logout} = require('../controller/userController');

router.route('/login')
        .post(passport.authenticate('local',{successRedirect:'/login-success',failureRedirect:'/users/login',failureFlash:true}),postLogin)
        .get(getLogin);
router.route('/register')
        .get(getRegister)
        .post(postRegister);
router.route('/logout').get(logout);

module.exports = router;