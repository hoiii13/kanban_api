const db = require('../db/index')

//创建项目
exports.createProject = (req, res) => {

    if(!req.body?.project_name) {
        return res.cc('项目名是必填项!')
    }

    const projectInfo = {
        project_name: req.body.project_name,
        project_desc: req.body.project_desc ? req.body.project_desc : '',
        start_time: req.body.start_time ? req.body.start_time : 0,
        end_time: req.body.end_time ? req.body.end_time : 0,
        creator_id: req.auth.id,
        creator: req.auth.username,
    }

    const sqlCreate = `insert into projects set ?`
        db.query(sqlCreate, projectInfo, (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows !== 1) {
                return res.cc('创建新项目失败!')
            }

            //新建的项目，先把创建者加入项目
            const sqlAddMe = `insert into members set ?`
            const member = {
                project_id: results.insertId,
                user_id: req.auth.id,
                username: req.auth.username
            }
            db.query(sqlAddMe, member, (err, reuslts) => {
                if(err) return res.cc(err)
                res.send({
                    status: 0,
                    message:'创建新项目成功！'
                })
            })
            
        })
}


//编辑项目
exports.editProject = (req, res) => {
    if(!req.body?.project_name) {
        return res.cc('项目名是必填项!')
    }
    const projectId = req.body.project_id
    //使用SQL中的select查询语句，查询以传入的project_id的值的这条数据的信息
    const sqlProject = `select * from projects where project_id=?`
    db.query(sqlProject, projectId, (err, results) => {
        if(err)  return res.cc(err)
        //操作条数不等于1，表示操作失败，设置状态码为1，提示失败
        if(results.length !== 1) return res.cc('该项目不存在!')
        //根据项目创建者的id和token解析出的用户id进行比较判断
        if(results[0].creator_id != req.auth.id) return res.cc('没有编辑权限')

        //创建一个用于更新数据的Map对象
        const info = {
            project_name: req.body.project_name,
            project_desc: req.body.project_desc ? req.body.project_desc : '',
            start_time: req.body.start_time ? req.body.start_time : 0,
            end_time: req.body.end_time ? req.body.end_time : 0,
            creator_id: req.auth.id,
            creator: req.auth.username,
        }
        //使用SQL中的update进行数据更新
        const sql = `update projects set ? where project_id=?`
        db.query(sql, [info, projectId ], (err, results) => {
            if(err) return res.cc(err)
            //操作条数不等于1，表示操作失败，设置状态码为1，提示失败
            if(results.affectedRows !== 1) return res.cc('更新失败')

            //否则操作条数等于1，表示操作成功，设置状态码为0，提示成功
            res.send({
                status: 0,
                message: '更新成功'
            })
        })
    })
}


//删除项目
exports.delProject = (req, res) => {
    const id = req.body.project_id
    const sqlProject = `select * from projects where project_id=?`
    db.query(sqlProject, req.body.project_id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('该项目不存在!')

        if (results[0].creator_id != req.auth.id) return res.cc('没有删除权限')

        const sql = `delete from projects where project_id=?`
            db.query(sql, id, (err, results) => {
                if(err) return res.cc(err)
                if(results.affectedRows !== 1) return res.cc('删除失败')
    
                const sqlMembers = `delete from members where project_id=?`
                db.query(sqlMembers, req.body.project_id, (err, memberResult) => { 
                    if(err) return res.cc(err)
                   
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
    return b.project_id - a.project_id
}

//每条项目的数据
exports.getProject = (req, res) => {
    const sqlProject = `select * from projects where project_id=?`
    db.query(sqlProject, req.body.project_id, (err, infoResults) => {
        if(err) return res.cc(err)
        if(infoResults.length !== 1) return res.cc('该项目不存在');

        const sqlMembers = `select * from members where project_id=?`
        db.query(sqlMembers, req.body.project_id, (err, reuslts) => {
            if(err) return res.cc(err)

            const members = []
            reuslts.forEach((e) => {
                members.push({
                    user_id: e.user_id,
                    username: e.username
                })
            })

            const projectItem = {...infoResults[0], members: members}

            res.send({
                status: 0,
                message: projectItem
            })

        })
    })
}

//查询用户相关的项目列表
exports.getProjects = (req, res) => {
    const sql = `select * from members where user_id=?`
    db.query(sql, req.auth.id, (err, results) => {
        if (err) return res.cc(err)
        
        //将该项目的成员的数据加入列表信息中
        var projectList = []
        var len = results.length
        

        results.forEach((value, index) => {
            
            const sqlProject = `select * from projects where project_id=?`
            db.query(sqlProject, value.project_id, (err, projectResults) => {
                if(err){
                    return res.cc(err)
                } else {
                   
                        const sqlMembers = `select * from members where project_id=?`
                        db.query(sqlMembers, projectResults[0].project_id, async (err, membersResults) => {
                           
                        if (err) {
                            return res.cc(err)
                        } else {
                            
                            const members = []
                            membersResults.forEach( async (e) => {
                                const userInfo = await getUserInfo(e.user_id)
                                members.push({
                                    user_id: e.user_id,
                                    username: e.username,
                                    avatar: userInfo[0].avatar
                                })
                            })
                            let columnList = await getColumnStatusNum(projectResults[0].project_id)
                            //console.log('test', columnList);
                            const projectItem = { ...projectResults[0], members: members, column: columnList }
                            projectList.push(projectItem)
                            if(projectList.length == len) {
                                var list = projectList.sort(sortId)
                                
                                return res.send({
                                    status: 0,
                                    message: list
                                })
                            }
                        }
                    })         
                }
                
            })
        })
        if(len == 0) {
            res.send({
                status: 0,
                message: projectList})
        }
         
        
    })
    
}

//查询用户信息
function getUserInfo(id) {

    return new Promise((resolve, reject) => {
         const sqlUser = `select * from users where id=?`
         db.query(sqlUser, id, (err, results) => {
             resolve(results)
         })
     })
     
 }

//项目搜索
exports.searchProjects = (req, res) => {
    const sql = "select * from projects where project_name like '%" + req.body.name + "%' order by project_id desc";
    db.query(sql, async (err, results) => {
        if (err) return res.cc(err)
        let projectList = []
        const len = results.length
        for (let i = 0; i < results.length; i++) {
            let columnList = await getColumnStatusNum(results[i].project_id)
            const projectItem = { ...results[i], column: columnList }
            projectList.push(projectItem)
            if (projectList.length == len) {
                res.send({ 
                    status:0,
                    message: projectList
                })
            }
        }
        if (len == 0) {
            res.send({ 
                status:0,
                message: []
            })
        }
       
    })
}

//项目中任务各状态数量
function getColumnStatusNum(project_id) {
    return new Promise((resolve, reject) => {
        const sql = `select * from tasks where project_id=? order by task_id desc`
        db.query(sql, project_id, (err, results) => {
       // if(err) return res.cc(err)
         //将该任务的成员的数据加入列表信息中
        var taskList = []
        var len = results.length
        let columnList = [{name: '预备', count: 0},{name: '开发', count: 0},{name: '测试', count: 0},{name: '完成', count: 0}]

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
                    for (var i = 0; i < list.length; i++) {
                        columnList[list[i]["column"]]["count"]++
                    }
                    resolve(columnList)
                } 
            })
        })

        if(len == 0) {
            resolve(columnList)
        }
         
    })
    })
}