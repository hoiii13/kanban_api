const db = require('../db/index')
exports.createProject = (req, res) => {

    if(!req.body?.project_name) {
        return res.cc('项目名是必填项!')
    }
    if(!req.body?.creator_id) {
        return res.cc('创建项目失败!')
    }

    const projectInfo = {
        project_name: req.body.project_name,
        project_desc: req.body.project_desc ? req.body.project_desc : '',
        start_time: req.body.start_time ? req.body.start_time : 0,
        end_time: req.body.end_time ? req.body.end_time : 0,
        creator_id: req.body.creator_id,
        creator: '',
        status: 0,
    }
    
    const sqlCreator = `select * from users where id=?`
    db.query(sqlCreator, projectInfo.creator_id,(err, results) => {
        if(err)  return res.cc(err)
        if(results.length !== 1) return res.cc('用户不存在!')
        projectInfo.creator = results[0].username
        console.log('sql',projectInfo);

        const sqlCreate = `insert into projects set ?`
        db.query(sqlCreate, projectInfo, (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows !== 1) {
                return res.cc('创建新项目失败!')
            }
            res.send({
                status: 0,
                message:'创建新项目成功！'
            })
        })
    } )  
}