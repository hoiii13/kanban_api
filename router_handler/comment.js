const db = require('../db/index')

//新增评论
exports.addComment = (req, res) => {
    const sqlUser = `select * from users where id=?`
    db.query(sqlUser, req.auth.id, (err, userResult) => {
        if (err) return res.cc(err)
        if (userResult.length !== 1) return res.cc('用户不存在')
        
        const sqlTask = `select * from tasks where task_id=?`
        db.query(sqlTask, req.body.task_id, (err, results) => {
            if(err) return res.cc(err)
            if (results.length !== 1) return res.cc('该任务不存在')
    
            const info = {...req.body, user_id: req.auth.id, username: req.auth.username, avatar: userResult[0].avatar}
            const sql = `insert into comments set ?`
            db.query(sql, info, (err, results) => {
                if(err) return res.cc(err)
                if(results.affectedRows !== 1) return res.cc('评论失败')
    
                res.send({
                    status:0,
                    message: '评论成功'
                })
            })
        })
    })
   
}

//降序排序
function sortId(a, b) {
    return b.create_time - a.create_time
}

//查询任务中的评论列表
exports.getTaskComment = (req, res) => {
    const sqlTask = `select * from tasks where task_id=?`
    db.query(sqlTask, req.body.task_id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('该任务不存在')

        const sql = `select * from comments where task_id=?`
        db.query(sql, req.body.task_id, (err, results) => {
            if (err) return res.cc(err)
            var list = results.sort(sortId)
            res.send({
                status: 0,
                message: list
            })
        })
       
    })
}

exports.getUserComment = (req, res) => {
    const commentsList = {}
    const sqlProject = `select * from members where user_id=?`
    db.query(sqlProject, req.auth.id, (err, projectResult) => {
        if (err) return res.cc(err)
       
        projectResult.forEach((project) => {
            const sqlTask = `select * from tasks where project_id=?`
            db.query(sqlTask, project.project_id, (err, taskResults) => {
               
                if (err) return res.cc(err)

                taskResults.forEach((taskItem) => {
                    
                    const sqlComments = `select * from comments where task_id=?`
                    db.query(sqlComments, taskItem.task_id, (err, commentResults) => {
                        if (err) return res.cc(err)
                        
                        commentResults.forEach((comments) => {
                            commentsList['a'].push(comments)
                            console.log('@@', comments);
                        })
                      
                        
                    })
                })
                
            })
        })
    })
}