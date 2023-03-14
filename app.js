const express = require('express')

const app = express()

//配置cors跨域
const cors = require('cors')
app.use(cors())  

//用于raw
app.use(express.json())  
//配置解析表单数据的中间件application/x-www-form-urlencoded
app.use(express.urlencoded()) 

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

app.use((err, req, res, next) => {
    if(err instanceof joi.ValidationError) return res.cc(err)
    if(err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
    res.cc(err)
})

app.listen(8082,function() {
    console.log('This is http://127.0.0.1:8082');
}) 