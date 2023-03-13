const express = require('express')

const router = express.Router()

const userInfo_handler = require('../router_handler/userinfo')

const expressjoi = require('@escook/express-joi')

//规则
const {update_userinfo_schema, update_password_schema, update_avatar_schema} = require('../schema/user')

//获取用户基本信息
router.get('/userinfo', userInfo_handler.getUserInfo)
// 更新用户基本信息
router.post('/update_user', expressjoi(update_userinfo_schema), userInfo_handler.updateUserInfo)
//更新密码 
router.post('/updatepwd',expressjoi(update_password_schema), userInfo_handler.updatePassword)
//更换头像
router.post('/update_avatar', expressjoi(update_avatar_schema), userInfo_handler.updateAvatar)

module.exports = router