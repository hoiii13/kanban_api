const express = require('express')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const OSS = require('ali-oss');
const multer = require('multer');
const path = require("path")
const app = express()

const client = new OSS({
    region: 'oss-cn-guangzhou',
    accessKeyId: 'LTAI5tRqgwupKDSVd3kzDn8D',
    accessKeySecret: '7RUZeBJorvzMTj0SQ54jZOZRyzs7sf',
    bucket: 'thekanban'
});

//配置cors跨域
const cors = require('cors')
app.use(cors())  

//用于raw
app.use(express.json())  
//配置解析表单数据的中间件application/x-www-form-urlencoded
app.use(express.urlencoded()) 

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload())

const joi = require('joi')


app.use((req, res, next) => {
    res.cc = (err, status = 1) =>{
        res.send({
            status,
            message: err instanceof Error ? err.message : err
        })
    }
    next()
})

//配置解析token的中间件
const {expressjwt: expressJWT} = require('express-jwt')
const config = require('./config')
//表示除了以/api为路径的才可以不用这个身份验证
app.use(expressJWT({secret: config.jwtSecretKey, algorithms: ["HS256"]}).unless({path: [/^\/api/]}))

const userRouter = require('./router/user')
app.use('/api', userRouter)

const userinfoRouter = require('./router/userinfo')
app.use('/my', userinfoRouter)

const projectRouter = require('./router/project')
app.use('/project', projectRouter)

const taskRouter = require('./router/task')
app.use('/task', taskRouter)

const memberRouter = require('./router/member')
app.use('/member', memberRouter)

const othersRouter = require('./router/others')
app.use('/others', othersRouter)

const commentRouter = require('./router/comment')
app.use('/comment', commentRouter)

const inviteRouter = require('./router/invite')
app.use('/invite', inviteRouter)

const upload = multer();
app.post('/upload', upload.single('image'), async(req, res) => {
    console.log('test',req.file.path);
    //console.log('req,', req.files.file, req.files.file.path);
    try {
        const file = req.files.file;
        //const result = await client.put(file.name, path.normalize('C:\\Users\\lenovo\\Pictures\\cumeixiong.png'));
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

app.use((err, req, res, next) => {
    if(err instanceof joi.ValidationError) return res.cc(err)
    if(err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
    res.cc(err)
})

app.listen(8081,function() {
    console.log('This is http://127.0.0.1:8081');
}) 