const crypto = require('crypto');
const moment = require('moment');
const db = require('../db');
const secret = 'invite_code';

/**
 * 
 * {
 * project_id: 37
 * }
 */
//生成邀请码
exports.getInviteCode = (req, res) =>{
    const projectId = req.body.project_id.toString()
    //使用SQL中的select查询语句，查询以传入的project_id的值的这条数据的信息
    const sqlProject = `select * from projects where project_id=?`
    db.query(sqlProject, req.body.project_id, (err, projectResults) => {
        if(err) return res.cc(err)
        //根据查询到的数据中的项目创建者id和token解析出的用户id进行比较判断是否有生成邀请码权限
        //当两者不相等时，表示没有移除用的权限，设置状态码为1，提示没有权限
        if(projectResults[0]["creator_id"] != req.auth.id) {
            return res.cc('没有生成邀请码权限')
        } else {
            const now = moment().unix(); // 获取当前时间戳
            // 拼接需要加密的字符串
            const plaintext = `${projectId}&${now}`;
            const hmac = crypto.createHmac('sha256', secret); // 创建一个使用SHA-256算法和指定密钥的HMAC对象
            hmac.update(plaintext); // 加密
            const code = `${hmac.digest('hex')}${now.toString(36)}`; // 拼接成最终的邀请码
            const inviteItem = {
                code: code.slice(0, 8),
                create_time: now,
                project_id: projectId
            }
            //使用SQL中的insert进行插入新数据
            const sqlCode = `insert into invite_code set ?`
            db.query(sqlCode, inviteItem, (err, results) => {
                if(err) return res.cc(err)
                 //操作条数不等于1，表示操作失败，设置状态码为1，提示失败
                if(results.affectedRows !== 1) return res.cc('生成邀请码失败')
                //操作条数等于1，表示操作成功，设置状态码为0，提示成功
                res.send({
                    status: 0,
                    message: code.slice(0, 8)
                })
            })
        }
    })
}

/**
 * 
 * {
 * code: 'test'
 * }
 */
//用户根据邀请码进入项目
exports.parseInviteCode = (req, res) => {
    const sqlCode = `select * from invite_code where code=?`
    db.query(sqlCode, req.body.code, (err, codeResults) => {
        if(err) return res.cc(err)

        let nowTime = moment().unix()
        if(codeResults.length == 0) {
            return res.send({
                status: 1,
                message: '验证码无效'
            })
        } else {
            const expireAt = 1000 * 24 * 60 * 60;
            if(expireAt + codeResults[0].create_time < nowTime) {
                return res.send({
                    status: 1,
                    message: '验证码已过期'
                })
            }
            else { 
                const sqlProject = `select * from projects where project_id=?`
            db.query(sqlProject,codeResults[0].project_id, (err, results) => {
                if(err) return res.cc(err)
                if(results.length !== 1) return res.cc('该项目不存在')
        
                const sqlExist = `select * from members where project_id=? and user_id=?`
                    db.query(sqlExist, [codeResults[0].project_id, req.auth.id], (err, existResults) => {
                        if(err) return res.cc(err)
                        if(existResults.length == 1) return res.cc('你已是该项目成员')
        
                        const info = {
                            project_id: codeResults[0].project_id,
                            user_id: req.auth.id,
                            username: req.auth.username
                        }
        
                        const sql = `insert into members set ?`
                        db.query(sql, info, (err, results) => {
                            if(err) return res.cc(err)
                            if(results.affectedRows !== 1) return res.cc('进入项目失败')
                
                            res.send({
                                status: 0,
                                message: '添加成功'
                            })
                        })
                    })
            })
            }
        }
    })
}