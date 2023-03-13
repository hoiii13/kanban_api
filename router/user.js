const express = require('express')

const router = express.Router()

const userHandler = require('../router_handler/user')

const expressjoi = require('@escook/express-joi')

const {reg_login_schema} = require('../schema/user')

router.post('/register',expressjoi(reg_login_schema), userHandler.register)

router.post('/login',expressjoi(reg_login_schema), userHandler.login)


module.exports = router