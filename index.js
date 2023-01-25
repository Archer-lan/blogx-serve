//引入express
const express = require('express')
//创建服务器实例对象
const app=express()
const fs=require("fs")

const cors=require('cors')

const headerRouter=require('./router/header')
const projectRouter=require("./router/project")
const path = require("path");

//暴露静态资源
let index=express.Router();
index.get('/',(req,res)=>{
    let htmlCont=fs.readFileSync('./dist/index.html');
    res.write(htmlCont);
    res.end();
})
app.use(express.static('./public'));
app.use(express.static(path.join(__dirname,"dist")));
app.use(cors())

app.use("/",index);
app.use("home",index);
app.use('/articles',headerRouter);
app.use('/project',projectRouter),

app.listen(3000,function (){
    console.log('api server running on http://127.0.0.1');
})