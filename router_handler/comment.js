const db = require('../db/index')

//新增评论
exports.addComment = (req, res) => {
    const sqlTask = `select * from tasks where task_id=? and status=?`
    db.query(sqlTask, [req.body.task_id, 0], (err, results) => {
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('该任务不存在')

        const info = {...req.body, user_id: req.auth.id, username: req.auth.username, avatar: req.auth.avatar}
        const sql = `insert into comments set ?`
        //console.log('info', info);
        db.query(sql, info, (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows !== 1) return res.cc('评论失败')

            res.send({
                status:0,
                message: '评论成功'
            })
        })
    })
}

//查询任务中的评论列表
exports.getTaskComment = (req, res) => {
    const sqlTask = `select * from tasks where task_id=? and status=0`
    db.query(sqlTask, req.body.task_id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('该任务不存在')

        const sql = `select * from comments where task_id=?`
        db.query(sql, req.body.task_id, (err, results) => {
            if(err) return res.cc(err)

            res.send({
                status: 0,
                message: results
            })
        })
       
    })
}