const db = require('../db/index')

//向任务中添加其他相关成员
exports.addOthers = (req, res) => {
    const sqlTask = `select * from tasks where task_id=?`
    db.query(sqlTask,req.body.task_id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('该任务不存在')

        const sqlUser = `select * from users where id=?`
        db.query(sqlUser, req.body.user_id, (err, results) => {
            if(err) return res.cc(err)
            if(results.length !== 1) return res.cc('该用户不存在')
            if(results[0].username != req.body.username) return res.cc('用户名不正确')

            const sql = `insert into others set ?`
            db.query(sql, req.body, (err, results) => {
                if(err) return res.cc(err)
                if(results.affectedRows !== 1) return res.cc('添加失败')

                res.send({
                    status: 0,
                    message: '添加成功'
                })
            })
        })
    })
}

exports.delOthers = (req, res) => {
    const sqlTask = `select * from tasks where task_id=?`
    db.query(sqlTask, req.body.task_id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('该任务不存在')

        const sql = `delete from others where task_id=? and user_id=?`
        db.query(sql, [req.body.task_id, req.body.user_id], (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows !== 1) return res.cc('移除失败')

            res.send({
                status: 0,
                message: '移除成功'
            })
        })
    })
}