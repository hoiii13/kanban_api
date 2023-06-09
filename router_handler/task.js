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
        db.query(sqlOthers, req.body.task_id, async(err, oldResults) => {
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
        } else if(lenOld == lenNew) {
            var oldCount = 0
            var newCount = 0
            for(var i = 0; i < lenOld; i++) {
                await delOthers(oldOthersList[i].user_id, oldOthersList[i].task_id)
                oldCount++
            }
            for(var j = 0; j <lenNew; j++) {
                await insertOther(newOthersList[j].user_id, req.body.task_id, newOthersList[j].username)
            }
        }

        const userInfo = await getUserInfo(req.body.actor_id)
        const taskInfo = {
            task_name: req.body.task_name,
            task_desc: req.body.task_desc,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            project_id: req.body.project_id,
            column: req.body.column,
            actor_id: req.body.actor_id,
            actor:userInfo[0]["username"],
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

function delOthers (user_id, task_id) {
    return new Promise((resolve, reject) => {
        const sqlRemove = `delete from others where task_id=? and user_id=?`
        db.query(sqlRemove, [task_id, user_id], (err, removeResults) => {
            if(err) resolve('error')
            if(removeResults.affectedRows !== 1) resolve('error')
            resolve('ok')
        })
    })
}

function insertOther (user_id, task_id, username) {
    return new Promise((resolve, reject) => {
        const sqlAdd = `insert into others set ?`
        const info = {
            "task_id": task_id,
            "user_id": user_id,
            "username": username
        }
        db.query(sqlAdd, info, (err, addResults) => {
            if(err) resolve('error')
            if(addResults.affectedRows !== 1) resolve('error')
            resolve('ok')
        })
    })
}

//任务详情
exports.getTaskInfo = (req, res) => {
    const id = req.body.task_id
    const sqlTask = `select * from tasks where task_id=?`
    db.query(sqlTask, id, async (err, taskResults) => {
        if (err) return res.cc(err)
        if (taskResults.length !== 1) return res.cc('该任务不存在')

        const user_id = taskResults[0]["actor_id"]
        const userInfo = await getUserInfo(user_id)
        const info = taskResults[0]
        const sqlOthers = `select * from others where task_id=?`
        db.query(sqlOthers, id, async (err, results) => {
            if (err) return res.cc(err)
           
            const othersList = results
            const otherItems = []
            for(var i = 0 ; i < othersList.length; i++) {
                const userInfo = await getUserInfo(othersList[i]["user_id"])
                otherItems.push({
                    user_id: userInfo.length == 0 ? null : userInfo[0]["id"],
                    username: userInfo.length == 0 ? null : userInfo[0]["username"],
                    avatar: userInfo.length == 0 ? null : userInfo[0]["avatar"],
                })
            }
            const taskInfo = { ...info, others: otherItems, avatar: userInfo.length == 0 ? '': userInfo[0]["avatar"]}
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
            db.query(sqlOthers, value.task_id, async (err, results) => {
                if(err) return res.cc(err)
                const othersPeople = []
                results.forEach(async (e) => {
                    const userInfo = await getUserInfo(e.user_id)
                    othersPeople.push({
                    user_id: userInfo.length == 0 ? null : userInfo[0]["id"],
                    username: userInfo.length == 0 ? null : userInfo[0]["username"],
                    avatar: userInfo.length == 0 ? null : userInfo[0]["avatar"],
                })
                })
                let userInfo = await getUserInfo(value.actor_id)
                const taskItem = {...value, others: othersPeople,  avatar: userInfo.length == 0 ? '': userInfo[0]["avatar"]}
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

//查询用户信息
function getUserInfo(id) {

   return new Promise((resolve, reject) => {
        const sqlUser = `select * from users where id=?`
        db.query(sqlUser, id, (err, results) => {
            /* if (err) return res.send({
                status: 1,
                message: '查询失败'
            }) */
            resolve(results)
        })
    })
    
}


//任务搜索
exports.searchTasks = (req, res) => {
    const sql = "select * from tasks where project_id=" +req.body.project_id + " and task_name like '%" + req.body.name + "%' order by task_id desc";
    db.query(sql, async (err, results) => {
        if(err) return res.cc(err)

        let count = 0
        let taskItems = []
        for(var i = 0; i < results.length; i++) {
            const user_id = results[i]["actor_id"]
            const userInfo = await getUserInfo(user_id)
            let others = [];
            const othersList = await getOthers(results[i].task_id)
            othersList.forEach((value) => {
                others.push({
                    user_id: value.user_id,
                    username: value.username
                })
            })
            
            const taskItem = {...results[i], avatar: userInfo.length == 0 ? '' : userInfo[0]["avatar"], others: others}
            taskItems.push(taskItem)
            count++
            if(count == results.length) {
                res.send({ 
                    status:0,
                    message: taskItems
                })
            }
        }
    })
}

//获取用户相关的任务列表
exports.getMyTasks = (req, res) => {
    const sql = `select * from tasks where actor_id=?`
    db.query(sql, req.auth.id, async (err, results) => {
        if(err) return res.cc(err)

        let taskList = [];

        for(var i = 0; i < results.length; i++) {
            const user_id = results[i]["actor_id"]
            const userInfo = await getUserInfo(user_id)
            let others = [];
            const othersList = await getOthers(results[i].task_id)
            othersList.forEach((value) => {
                others.push({
                    user_id: value.user_id,
                    username: value.username
                })
            })
            if(others.length == othersList.length) {
                let taskItem = {...results[i], others: others,avatar: userInfo.length == 0 ? '' : userInfo[0]["avatar"]}
                taskList.push(taskItem)
            }
            if(taskList.length == results.length) {
                res.send({
                    status: 0,
                    message: taskList
                })
            }
        }
        if(results.length == 0) {
            res.send({
                status: 0,
                message: []
            })
        }
        
    })
}

function getOthers (task_id) {
    return new Promise((resolve, reject) => {
        const sql = `select * from others where task_id=?`
        db.query(sql, task_id, (err, results) => {
            if(err) resolve('error')
            else resolve(results)
        })
    })
}