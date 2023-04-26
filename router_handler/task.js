const db = require('../db/index')

//创建任务
exports.createTask = (req, res) => {

    const taskInfo = {
        task_name: req.body.task_name,
        task_desc: req.body.task_desc,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        project_id: req.body.project_id,
        column: req.body.column,
        actor_id: req.body.actor_id,
        creator: req.auth.username,
        status: 0
    }

    const sqlUser = `select * from users where id=?`
    db.query(sqlUser, taskInfo["actor_id"], (err, userResults) => {
        if(err) return res.cc(err)
        if(userResults.length !== 1) return res.cc('被指派人员不存在')
        const info = {...taskInfo, actor: userResults[0].username}

        const sql = `insert into tasks set ?`
        db.query(sql, info, (err, results) => {
            if(err) res.cc(err)
            if(results.affectedRows !== 1) return res.cc('创建失败')
    
            const taskId = results.insertId
    
            const othersList = [...req.body.others]
    
            var len = othersList.length
            const addList = []
            othersList.forEach((e) => {
                const otherInfo = {...e, task_id: taskId}
                const sqlOthers = `insert into others set ?`
                db.query(sqlOthers, otherInfo, (err, addOthersResults) => {
                    if(err) return res.cc(err)
                    if(addOthersResults.affectedRows !== 1) return res.cc('添加失败')
    
                    addList.push(addOthersResults)
    
                    if(addList.length == len) {
                        res.send({
                            status: 0,
                            message: '创建成功'
                        })
                    }
    
                })
            })
            if(len == 0) {
                res.send({
                    status: 0,
                    message: '创建成功'
                })
            }
    
            
        })
    })

   
}

//编辑任务
exports.editTask = (req, res) => {
    const sqlTask = `select * from tasks where task_id=?`
    db.query(sqlTask, req.body.task_id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('该任务不存在')

        const sqlOthers = `select * from others where task_id=?`
        db.query(sqlOthers, req.body.task_id, (err, oldResults) => {
            if(err) return res.cc(err)
           
        //判断others是向表中增加还是减少数据 
        const oldOthersList = oldResults
        const newOthersList = req.body.others
        var lenOld = oldOthersList.length
        var lenNew = newOthersList.length
        
        if(lenOld > lenNew) {
            oldOthersList.forEach((item) => {
                var count = 0
                newOthersList.forEach((value) => {
                    if(item["user_id"] != value["user_id"] || item["username"] != value["username"]) {
                        count++
                    }
                })
                if(count == lenNew) {
                    const sqlRemove = `delete from others where task_id=? and user_id=?`
                    db.query(sqlRemove, [req.body.task_id, item.user_id], (err, removeResults) => {
                        if(err) return res.cc(err)
                        if(removeResults.affectedRows !== 1) return res.cc('修改失败')
                    })
    
                }
            })
        } else if(lenOld < lenNew) {
            newOthersList.forEach((item) => {
                
                var count = 0
                oldOthersList.forEach((value) => {
                    if(item["user_id"] != value["user_id"] || item["username"] != value["username"]) {
                        count++
                    }
                })
               
                if(count == lenOld) {
                    const sqlAdd = `insert into others set ?`
                    const info = {
                        "task_id": req.body.task_id,
                        "user_id": item.user_id,
                        "username": item.username
                    }
                    db.query(sqlAdd, info, (err, addResults) => {
                        if(err) return res.cc(err)
                        if(addResults.affectedRows !== 1) return res.cc('修改失败')
                    })
    
                }
            })
        }
        const taskInfo = {
            task_name: req.body.task_name,
            task_desc: req.body.task_desc,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            project_id: req.body.project_id,
            column: req.body.column,
            actor_id: req.body.actor_id,
            creator: req.auth.username,
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
        
    })
}

//任务详情
exports.getTaskInfo = (req, res) => {
    const id = req.body.task_id
    const sqlTask = `select * from tasks where task_id=?`
    db.query(sqlTask, id, (err, taskResults) => {
        if (err) return res.cc(err)
        if (taskResults.length !== 1) return res.cc('该任务不存在')

        const info = taskResults[0]
        const sqlOthers = `select * from others where task_id=?`
        db.query(sqlOthers, id, (err, results) => {
            if (err) return res.cc(err)
           
            const othersList = results
            const taskInfo = { ...info, others: othersList}
            res.send({
                status: 0,
                message: taskInfo
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
        const sql = `delete from tasks where task_id=?`
        db.query(sql, id, (err, results) => {
            if(err) return res.cc(err)
            if (results.affectedRows !== 1) return res.cc('删除失败')
            
            const sqlOthers = `delete from others where task_id=?`
            db.query(sqlOthers, id, (err, othersResult) => {
                if (err) return res.cc(err)
                
                res.send({
                    status: 0,
                    message: '删除成功'
                })
            })

            
        })
    })
}

//降序排序
function sortId(a, b) {
    return b.task_id - a.task_id
}

//任务列表
exports.getTasks = (req, res) => {
    const sql = `select * from tasks where project_id=? order by task_id desc`
    db.query(sql, req.body.project_id, (err, results) => {
        if(err) return res.cc(err)

         //将该任务的成员的数据加入列表信息中
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
                if(taskList.length == len) {
                    var list = taskList.sort(sortId)
                    return res.send({
                        status: 0,
                        message: list
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




//任务搜索
exports.searchTasks = (req, res) => {
    const sql = "select * from tasks where project_id=" +req.body.project_id + " and task_name like '%" + req.body.name + "%' order by task_id desc";
    db.query(sql, (err, results) => {
        if(err) return res.cc(err)
        res.send({ 
            status:0,
            message: results
        })
    })
}