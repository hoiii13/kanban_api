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
        status: 0,
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
    const projectInfo = {
        project_id:req.body.project_id,
        project_name: req.body.project_name,
        project_desc: req.body.project_desc ? req.body.project_desc : '',
        start_time: req.body.start_time ? req.body.start_time : 0,
        end_time: req.body.end_time ? req.body.end_time : 0,
        creator_id: req.auth.id,
        creator: req.auth.username
    }
    const sqlProject = `select * from projects where project_id=?`
    db.query(sqlProject, [projectInfo.project_id, 0], (err, results) => {
        if(err)  return res.cc(err)
        if(results.length !== 1) return res.cc('该项目不存在!')
  
        if(results[0].creator_id != req.auth.id) return res.cc('没有编辑权限')

        const info = {
            project_name: projectInfo.project_name,
            project_desc: projectInfo.project_desc,
            start_time: projectInfo.start_time,
            end_time: projectInfo.end_time,
            creator_id: req.auth.id,
            creator: req.auth.username,
            status: 0,
        }
        const sql = `update projects set ? where project_id=?`
        db.query(sql, [info, projectInfo.project_id ], (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows !== 1) return res.cc('更新失败')

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
                            membersResults.forEach((e) => {
                                members.push({
                                    user_id: e.user_id,
                                    username: e.username
                                })
                            })
                            let columnList = await getColumnStatusNum(projectResults[0].project_id)
                            console.log('test', columnList);
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


//项目搜索
exports.searchProjects = (req, res) => {
    const sql = "select * from projects where project_name like '%" + req.body.name + "%' order by project_id desc";
    db.query(sql, (err, results) => {
        if(err) return res.cc(err)
        res.send({ 
            status:0,
            message: results
        })
    })
}

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