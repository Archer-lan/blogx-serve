//引入express
const express = require('express')
//创建服务器实例对象
const app=express()

const cors=require('cors')

const headerRouter=require('./router/header')
const path = require("path");

//暴露静态资源
app.use(express.static('./public'));
app.use(cors())
app.use('/articles',headerRouter);

app.listen(3000,function (){
    console.log('api server running on http://127.0.0.1');
})