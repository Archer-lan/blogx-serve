const path=require('path')
const fs=require('fs')
const util=require('util')
const {response} = require("express");
//获取项目信息
exports.getBanner=(req,res)=>{
    fs.readFile(path.join(__dirname,"project.json"),"utf8",(err,data)=>{
        if(err){
            return res.send({
                status:0,
                message:err,
            })
        }
        else{
            return res.send({
                status:1,
                message:JSON.parse(data),
            })
        }
    })
}