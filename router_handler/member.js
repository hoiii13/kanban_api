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

//移除项目成员
exports.delMember = (req, res) => {
    const sqlProject = `select * from projects where project_id=?`
    db.query(sqlProject, req.body.project_id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('该项目不存在')

        //根据项目创建者的id和token解析出的用户id进行比较判断是否有移除成员的权限
        //当两者不相等时，表示没有移除用的权限，设置状态码为1，提示没有权限
        if(results[0].creator_id != req.auth.id) return res.cc('没有移除成员的权限')
        //使用SQL中的delete删除数据语句，删除以project_id为传入的project_id和user_id为传入的user_id的这条数据
        const sql = `delete from members where project_id=? and user_id=?`
        db.query(sql, [req.body.project_id, req.body.user_id], (err, results) => {
            if(err) return res.cc(err)
            //操作条数不等于1，表示操作失败，设置状态码为1，提示失败
            if(results.affectedRows !== 1) return res.cc('移除失败')

            let count = 0;
            const sqlTask = `select * from tasks where project_id=?`
            db.query(sqlTask, req.body.project_id, async (err, taskResults) => {
                if(err) return res.cc(err)
                for(var i = 0; i < taskResults.length; i++) {
                    await delOthers(taskResults[i].task_id, req.body.user_id)
                    count++
                    if(count == taskResults.length) {
                         //操作条数等于1，表示操作成功，设置状态码为0，提示成功
                        res.send({
                            status: 0,
                            message: '移除成功'
                        })
                    }
                }
                if(taskResults.length == 0) {
                    res.send({
                        status: 0,
                        message: '移除成功'
                    })
                }
            })
        })
    })
}

function delOthers (task_id, user_id) {
    return new Promise((resolve, reject) => {
        const sqlOther = `select * from others where task_id =? and user_id=?`
        db.query(sqlOther, [task_id, user_id], (err, otherResults) => {
        if(err) return res.cc(err)
    
        if(otherResults.length > 0) {
            const sqlDel = `delete from others where task_id=? and user_id=?`
            db.query(sqlDel, [task_id, user_id], (err, delResults) => {
                if(err) return res.cc(err)
                if(delResults.affectedRows != 1) return res.cc('移除失败')
                resolve('del')
            })
        } else {
            resolve('del')
        }
    })
    })
}

//获得项目成员
exports.getMembers = (req, res) => {
    const sqlProject = `select * from projects where project_id=?`
    db.query(sqlProject, req.body.project_id, (err, resultsProject) => {
        if(err) return res.cc(err)
        if(resultsProject.length == 0 ) return res.cc('该项目不存在')

        const sql = `select * from members where project_id=?`
        db.query(sql, req.body.project_id, async(err, results) => {
            if(err) return res.cc(err)

            let memberList = [];
            for(var i = 0; i < results.length; i++) {
                let userInfo = await getUserInfo(results[i].user_id)
                memberList.push({
                    user_id: results[i].user_id,
                    username: results[i].username,
                    avatar: userInfo[0]["avatar"]
                })
                
                if(results.length == memberList.length) {
                    res.send({
                        status: 0,
                        message: memberList
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
    })
}

//查询用户信息
function getUserInfo(id) {
    return new Promise((resolve, reject) => {
         const sqlUser = `select * from users where id=?`
         db.query(sqlUser, id, (err, results) => {
            if(err) resolve(err)
             /* if (err) return res.send({
                 status: 1,
                 message: '查询失败'
             }) */
             resolve(results)
         })
     })
     
 }