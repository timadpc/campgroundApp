const express = require('express');
const router = express.Router({ mergeParams: true });//enables use :id
const passport = require('passport');// for passwords

const catchAsync = require('../utils/catchAsync')
const { renderLoginForm, login, renderRegisterForm, register, logout } = require('../controlers/users');


router.get('/register', renderRegisterForm)

router.post('/register', catchAsync(register))

router.get('/login', renderLoginForm)

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), login)

router.get('/logout', logout)


module.exports = router;  