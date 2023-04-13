const db = require('../db/index')

//项目中添加成员
exports.addMembers = (req, res) => {
    const sqlProject = `select * from projects where project_id=?`
    db.query(sqlProject, req.body.project_id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('该项目不存在')
        if(results[0].creator_id != req.auth.id) return res.cc('没有添加成员的权限')

        const sqlUser = `select * from users where username=?`
        db.query(sqlUser, req.body.username, (err, userResults) => {
            if(err) return res.cc(err)
            if(userResults.length !== 1) return res.cc('该用户不存在')

            const sqlExist = `select * from members where project_id=? and user_id=?`
            db.query(sqlExist, [req.body.project_id, userResults[0]["id"]], (err, existResults) => {
                if(err) return res.cc(err)
                if(existResults.length == 1) return res.cc('该用户已在该项目中')

                const info = {
                    project_id: req.body.project_id,
                    user_id: userResults[0]["id"],
                    username: req.body.username
                }

                const sql = `insert into members set ?`
                db.query(sql, info, (err, results) => {
                    if(err) return res.cc(err)
                    if(results.affectedRows !== 1) return res.cc('添加成员失败')
        
                    res.send({
                        status: 0,
                        message: '添加成功'
                    })
                })
            })
        })
    })
}

//项目中删除成员

exports.delMember = (req, res) => {
    const sqlProject = `select * from projects where project_id=?`
    db.query(sqlProject, req.body.project_id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('该项目不存在')
        if(results[0].creator_id != req.auth.id) return res.cc('没有移除成员的权限')

        const sql = `delete from members where project_id=? and user_id=?`
        db.query(sql, [req.body.project_id, req.body.user_id], (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows !== 1) return res.cc('移除失败')

            res.send({
                status: 0,
                message: '移除成功'
            })
        })
    })
}