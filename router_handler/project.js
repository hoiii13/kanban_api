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
    db.query(sqlProject, projectInfo.project_id, (err, results) => {
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

        if(results[0].creator_id != req.auth.id) return res.cc('没有删除权限')

        const sql = `update projects set status=? where project_id=?`
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

//查询项目列表
exports.getProjects = (req, res) => {
    const sql = `select * from projects where creator_id=? and status=?`
    db.query(sql, [req.auth.id, 0], (err, results) => {
        if(err) return res.cc(err)
        
        //将该项目的成员的数据加入列表信息中
        var projectList = []
        var len = results.length

        results.forEach((value, index) => {
            const sqlMembers = `select * from members where project_id=?`
            db.query(sqlMembers, value.project_id, (err, results) => {
                if(err) return res.cc(err)
                const members = []
                results.forEach((e) => {
                    members.push({
                        user_id: e.user_id,
                        username: e.username
                    })
                })
                const projectItem = {...value, members: members}
                projectList.push(projectItem)

                if(len == index + 1) {
                    return res.send({
                        status: 0,
                        message: projectList
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