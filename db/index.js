const mysql = require('mysql')

const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    //password: '123456yds',
    database: 'kanban_api'
})

module.exports = db