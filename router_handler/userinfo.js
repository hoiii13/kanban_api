const db = require('../db/index')
const bcrypt = require('bcryptjs')

//获取用户基本信息
exports.getUserInfo = (req, res) => {
    const sql = 'select id, username, nickname, email, avatar from users where id=?'
    //req.auth可以解析token
    db.query(sql, req.auth.id, (err, results) => {
    if(err) return res.cc(err)
    if(results.length !== 1) return res.cc('获取用户信息失败！')

    res.send({
        status: 0,
        message: '获取用户信息成功',
        data: results[0]
    })
})
}

//获取其他用户信息
exports.getOtherUserInfo = (req, res) => {
    const sql = 'select id, username, nickname, email, avatar from users where id=?'
    //req.auth可以解析token
    db.query(sql, req.body.id, (err, results) => {
    if(err) return res.cc(err)
    if(results.length !== 1) return res.cc('获取用户信息失败！')

    res.send({
        status: 0,
        message: '获取用户信息成功',
        data: results[0]
    })
})
}

// 更新用户基本信息
exports.updateUserInfo = (req, res) => {
    const sql = 'update users set ? where id=?'
    db.query(sql,[req.body, req.body.id], (err, results) => {
        if(err) return res.cc(err)
        if(results.affectedRows !== 1) return res.cc('更新用户基本信息失败！')

        res.send({
            status: 0,
            message: '更新用户信息成功！'
        })
    })
}

//更新密码 
exports.updatePassword = (req, res) => {
    const sql = 'select * from users where id=?'
    db.query(sql, req.auth.id, (err, results) => {
        if(err) return res.cc(err)

        if(results.length !== 1) return res.cc('用户不存在！')

        //判断旧密码的正确性
        const compareResult =  bcrypt.compareSync(req.body.oldPwd, results[0].password)
        if(!compareResult) return res.cc('旧密码错误！')

        const sql_update =  `update users set password=? where id=?`

        //对新密码进行加密
        const newPwd = bcrypt.hashSync(req.body.newPwd, 10)

        db.query(sql_update, [newPwd, req.auth.id], (err, results) => {
            if(err) return res.cc(err)

            if(results.affectedRows !== 1) return res.cc('更新密码失败！')
            
            res.send({
                status: 0,
                message: '修改密码成功'
            })
        })
    })
}

//更换头像
exports.updateAvatar = (req, res) => {
    const sql = `update users set avatar=? where id=?`

    db.query(sql, [req.body.avatar, req.auth.id], (err, results) => {
        if(err) return res.cc(err)

        if(results.affectedRows !==1 ) return res.cc('更换头像失败！')

        res.send({
            status: 0,
            message: '更新头像成功！'
        })
    })
}