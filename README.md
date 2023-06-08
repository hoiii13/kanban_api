## 规则

- 所有列表数据用降序

## 使用的包

- 对密码进行加密 ： 用 bcryptjs
- 为表单中携带的每个数据项，定义验证规则： joi
- 实现自动对表单数据进行验证的功能：@escook/express-joi
- 生成 token 字符串的包：josonwebtoken
- 解析 token 的中间件：express-jwt
- 异步：async
- 加密算法处理: crypto
- 日期时间：moment
- base64: base64url
- 生成唯一标识符：uuid
- 阿里云OSS： ali-oss  
- 处理 multipart/form-data 类型的表单数据: multer