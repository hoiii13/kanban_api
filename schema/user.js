const joi = require('joi')

//alphanum表示数字为0到9，min为最小长度，max为最大
const username = joi.string().alphanum().min(1).max(46).required()
const password = joi.string().pattern(/^[\S]{8,16}$/).required()

//登录和注册表单数据的对着对象
exports.reg_login_schema = {
    body: {
        username,
        password
    }
}

const id = joi.number().integer().min(1).required()
const nickname = joi.string().required()
const email = joi.string().email().required()

//更新用户基本信息的规则对象
exports.update_userinfo_schema = {
    body: {
        id,
        nickname,
        email
    }
}

//重置密码规则
exports.update_password_schema = {
    body: {
        oldPwd: password,
        newPwd: joi.not(joi.ref('oldPwd')).concat(password)
    }
}

const avatar = joi.string().required()

//验证头像的规则
exports.update_avatar_schema = {
    body: {
        avatar
    }
}