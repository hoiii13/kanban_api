const db = require('../db/index')
const bcrypt = require('bcryptjs')
const save = require('../utils/saveImg')

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
         //根据SQL语句查询用户不存在，使用封装好的结果集返回结果
        if(results.length !== 1) return res.cc('用户不存在！')

       //将传入的参数与查询到的数据中的password进行判断密码是否正确
        const compareResult =  bcrypt.compareSync(req.body.oldPwd, results[0].password)
        if(!compareResult) return res.cc('旧密码错误！')

        const sql_update =  `update users set password=? where id=?`

        //对新密码进行加密
        const newPwd = bcrypt.hashSync(req.body.newPwd, 10)
        //使用SQL语句根据头部解析出的用户id，修改该条数据的密码password
        db.query(sql_update, [newPwd, req.auth.id], (err, results) => {
            if(err) return res.cc(err)
            //使用SQL更新数据失败，返回结果集
            if(results.affectedRows !== 1) return res.cc('更新密码失败！')
            //使用SQL更新数据成功，返回状态码为0的结果集
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

const fs = require('fs')
function saveImage(base64Image) {
    const matches = base64Image.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/)
    if(matches && matches.length === 3) {
        const extension = matches[1]
        const imageData = Buffer.from(matches[2], 'base64')
        const fileName = `image-${Date.now()}.${extension}`;
        const filePath = `../public/images/${fileName}`;
        fs.writeFile(filePath, imageData, (error) => {
            if(error) {
                console.log(error);
            } else {
                console.log(`Image saved to ${filePath}`);
            }
        })

        return `http://192.168.56.1:8081/images/${fileName}`
    }
    return null
}