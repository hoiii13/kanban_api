const db = require('../db/index')

//创建任务
exports.createTask = (req, res) => {
    console.log('req', req.body);

    const taskInfo = {
        task_name: req.body.task_name,
        task_desc: req.body.task_desc,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        project_id: req.body.project_id,
        column: req.body.column,
        actor_id: req.body.actor_id,
        creator: req.body.creator,
        status: 0
    }
    const sql = `insert into tasks set ?`
    db.query(sql, taskInfo, (err, results) => {
        if(err) res.cc(err)
        if(results.affectedRows !== 1) return res.cc('创建失败')
        res.send({
            status: 0,
            message: '创建成功'
        })
    })
}

//编辑任务
exports.editTask = (req, res) => {
    const sqlTask = `select * from tasks where task_id=?`
    db.query(sqlTask, req.body.task_id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('该任务不存在')

        const taskInfo = {
            task_name: req.body.task_name,
            task_desc: req.body.task_desc,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            project_id: req.body.project_id,
            column: req.body.column,
            actor_id: req.body.actor_id,
            creator: req.body.creator,
            status: 0
        }
        const sql = `update tasks set ? where task_id=?`
        db.query(sql, [taskInfo, req.body.task_id], (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows !== 1) return res.cc('更新失败')

            res.send({
                status: 0,
                message: '更新成功'
            })
        })
    })
}

//删除任务
exports.delTask = (req, res) => {
    const id = req.body.task_id
    const sqlTask = `select * from tasks where task_id=?`
    db.query(sqlTask, id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('该任务不存在!')
        const sql = `update tasks set status=? where task_id=?`
        db.query(sql, [1, id], (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows !== 1) return res.cc('删除失败')

            res.send({
                status: 0,
                message: '删除成功'
            })
        })
    })
}

//任务列表
exports.getTasks = (req, res) => {
    const sql = `select * from tasks where project_id=? and status=?`
    db.query(sql, [req.body.project_id, 0], (err, results) => {
        if(err) return res.cc(err)

         //将该项目的成员的数据加入列表信息中
        var taskList = []
        var len = results.length

        results.forEach((value, index) => {
            const sqlOthers = `select * from others where task_id=?`
            db.query(sqlOthers, value.task_id, (err, results) => {
                if(err) return res.cc(err)
                const othersPeople = []
                results.forEach((e) => {
                    othersPeople.push({
                        user_id: e.user_id,
                        username: e.username
                    })
                })
                const taskItem = {...value, others: othersPeople}
                taskList.push(taskItem)
                if(len == index + 1) {
                    return res.send({
                        status: 0,
                        message: taskList
                    })
                } 
            })
        })

        if(len == 0) {
            res.send({
                status: 0,
                message: taskList
            })
        }
         
    })
}