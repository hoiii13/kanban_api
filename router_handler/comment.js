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
    
            const info = {...req.body, user_id: req.auth.id, username: req.auth.username, is_read: 0}
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
//升序排序
function sortIdUp(a, b) {
    return a.create_time - b.create_time
}

//查询任务中的评论列表
exports.getTaskComment = (req, res) => {
    const sqlTask = `select * from tasks where task_id=?`
    db.query(sqlTask, req.body.task_id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('该任务不存在')

        const sql = `select * from comments where task_id=?`
        db.query(sql, req.body.task_id, async (err, results) => {
            if (err) return res.cc(err)
            
            var commentList = results
            for (let i = 0; i < results.length; i++) {
                let userInfo = await queryUser(results[i].user_id)
                if (userInfo) {
                    commentList[i].avatar = userInfo[0].avatar
                }
            }
          
            var list = commentList.sort(sortId)
            res.send({
                status: 0,
                message: list
            })
        })
       
    })
}

// 数组结构
/* commentListItem {
    task_id: number
    task_name: string
    comments: Array<commentItem>
}
commentItem {
    comment_id: number
    task_id: number
    user_id: number
    create_time: number
    comment: string
    username: string
    avatar: string
}
 */

//得到与用户有关的评论
exports.getUserComment = (req, res) => {
    let commentsList = []
    const sqlComments = `select * from comments order by comment_id desc`
    db.query(sqlComments, async (err, commentResult) => {
        if (err) return res.cc(err)
        
        const myName = '@' + req.auth.username + ' '
        let aboutMeList = []
        
        let allNum = 0
        
        //得到@用户的数据
        for (let z = 0; z < commentResult.length; z++) {
            if (commentResult[z].comment.indexOf(myName) != -1) {
                aboutMeList.push(commentResult[z])
            }
        }
        const len = aboutMeList.length
        let count = 0

        for (let i = 0; i < aboutMeList.length; i++){

             //遍历数组，若task_id存在，则将评论信息push进该条数据的comments中
            count = 0
            for (let j = 0; j < commentsList.length; j++) {
                 if (commentsList[j].task_id == aboutMeList[i].task_id) {
                     commentsList[j].comments.push(aboutMeList[i])
                     allNum = allNum + 1
                     break
                 } else {
                 count++
                 }
                 
             }
         
         //遍历数组结束，若commentsList中还不存在任务id为当前task_id的，则数组长度+1，存入任务信息和评论内容
            if (count == commentsList.length ) {
                let taskInfo = await queryTask(aboutMeList[i].task_id)
                let comments = []
                comments.push(aboutMeList[i])
                commentsList.push({
                    task_id: aboutMeList[i].task_id,
                    task_name: taskInfo[0].task_name,
                    project_id: taskInfo[0].project_id,
                    unread: 0,
                    comments: comments
                })
                allNum = allNum + 1
            }
            if (allNum == aboutMeList.length) {
                let all_unRead = 0;
                for(let m = 0; m < commentsList.length; m++) {
                    let unread = 0;
                    for(let n = 0; n < commentsList[m].comments.length; n++) {
                        if(commentsList[m].comments[n].is_read == 0) {
                            unread++
                            all_unRead++
                        }
                    }
                    commentsList[m].unread = unread
                }
                res.send({
                    status: 0,
                    all_unread: all_unRead,
                    message: commentsList
                })
            }
        }
        if (len == 0) {
            res.send({
                status: 0,
                all_unread: 0,
                message: commentsList
            })
        }
        
    })

}

// 请求数据库中任务的数据
function queryTask(task_id) {
    return new Promise((resolve, reject) => {
        const sqlTask = `select * from tasks where task_id=?`
        db.query(sqlTask, task_id, (err, taskResults) => { 
            if (err) return res.send({
                status: 1,
                message: '获取失败'
            })
            resolve(taskResults)
        })
    })
}

// 请求数据库中用户的数据
function queryUser(user_id) {
    return new Promise((resolve, reject) => {
        const sqlUser = `select * from users where id=?`
        db.query(sqlUser, user_id, (err, userResults) => {
            if (err) return res.send({
                status: 1,
                message: '获取失败'
            })
            resolve(userResults)
        })
    })
}

//未读消息修改状态
exports.readComment = async (req, res) => {
    const unreadList = req.body.ids
    let ids = '';
    for(var i = 0; i < unreadList.length; i++) {
        if(i == unreadList.length -1) {
            ids = ids + unreadList[i]
        } else {
            ids = ids + unreadList[i] + ','
        }
    }
    const sql = 'update comments set is_read=1 where comment_id in (' + ids + ')'
    db.query(sql, (err, results) => {
        if(err) return res.cc(err)
        if(results.affectedRows == 0) return res.cc('修改失败')
       
        res.send({
            status: 0,
            message: 'OK'
        })
    })
    if(unreadList.length == 0) {
        res.send({
            status: 1,
            message: '请输入id'
        })
    }
}
