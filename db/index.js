//导入mysql模块
const mysql=require('mysql2')

//创建数据库链接对象
const db=mysql.createPool({
    host:'127.0.0.1',
    user:"root",
    password:'password',
    database:'my_db_01',
})

module.exports=db