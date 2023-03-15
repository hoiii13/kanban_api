const db = require('../db/index')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

//注册
exports.register = (req, res) => {
    const userInfo = req.body

    const sqlStr = 'select * from users where username=?'
    db.query(sqlStr, userInfo.username, (err, results) => {
        console.log('user', results);
        if(err) {
            return res.cc(err)
        }

        if(results.length > 0) {
            return res.cc('用户名被占用，请更换其他用户名!')
        }

        //调用bcrypt.hashSync()对密码加密
        userInfo.password = bcrypt.hashSync(userInfo.password, 10)
        console.log('user',userInfo)
        const sql = 'insert into users set ?'
        db.query(sql, {username: userInfo.username, password: userInfo.password},(err, results) => {
            if(err) {
                return res.cc(err)
            }
            if(results.affectedRows !== 1) {
                return res.cc('注册用户失败，请稍后再试!')
            }
            const sqlUser = `select * from users where username=?`
            db.query(sqlUser, userInfo.username, (err, results) => {
                const user = { ...results[0], password: '', avatar: '' }
                const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
                res.send({
                    status: 0,
                    message: '注册成功',
                    token: tokenStr
                })
            })
           
        })
    })
}

//登录
exports.login = (req, res) => {

    const userInfo = req.body
    const sql = `select * from users where username=?`
    db.query(sql, userInfo.username, (err, results) => {
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('登录失败！')

        //判断密码是否正确
        const compareResult =  bcrypt.compareSync(userInfo.password, results[0].password)
        if(!compareResult) return res.cc('登录失败，密码错误！')

        //清除用户敏感信息
        const user = {...results[0], password: '', avatar: ''}

        const tokenStr = jwt.sign(user, config.jwtSecretKey, {expiresIn: config.expiresIn})
        console.log('result', results)
        res.send({
            status: 0,
            message: '登录成功！',
            token:  tokenStr
        })
    })

}