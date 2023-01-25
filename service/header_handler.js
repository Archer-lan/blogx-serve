//导入数据库配置
const db=require('../db/index')
const path=require('path')
const marked=require('marked')
const fs=require('fs')
const util=require('util')
const {response} = require("express");

//设置marked配置
const rendererMD= new marked.Renderer()
marked.setOptions({
    renderer:rendererMD,
    gfm:true,
    tables:true,
    breaks:false,
    pedantic:false,
    sanitize:false,
    smartLists:true,
    smartypants:false,
})

//存放读取到的所有文章内容
let text=[];
//存放marked编译后的html内容
let textHtml=[]

//获取header标题
exports.getHeader=(req,res)=>{
    let fileName=[];
    //取出此路径下的文件夹
    // const filepath=path.resolve('/Users/a666/project/WebstormProject/JS/blog/blogx-serve/markdown')
    const filepath=path.join(__dirname,"markdown");
    const readdir=util.promisify(fs.readdir)
    //读取文件夹拿到所有文件名称
    readdir(filepath).then(file=>{
        file.forEach((filename)=>{
            const filedir=path.join(filepath,filename);
            fileName.push(filedir);
        })
    }).then(e=>{
        //返回给header的内容
        let id=0;
        let resData=[];
        //计数判断回调是否到最后一个
        let count=1;
        for(let fname of fileName){
            fs.readFile(fname,"utf-8",function (err,data){
                //匹配header中的内容
                const reg_head=/(---[\S\s]*?---)/
                //拿到所有title：等对应的后续字段
                const reg_headText=/(:.*?\n)/g

                let headText;
                let head;
                let headArr=[];
                let resd;

                let ctime=getTime(fname);
                head=reg_head.exec(data);

                // console.log(head)
                if(head){
                    text.push(data.substring(head[0].length));

                    //将拿到的head字符串拆分
                    while((headText=reg_headText.exec(head[0]))!==null){
                        headArr.push(headText[0].substring(1,headText[0].length-1).trim());
                    }
                    //返回resdata
                    resd={
                        id:id++,
                        title:headArr[0],
                        name:headArr[1],
                        email:headArr[2],
                        readMore:headArr[3],
                        categories:headArr[4],
                        describe:headArr[5],
                        time:ctime,
                    }
                    //返回值
                    resData.push(resd);
                }else {
                    text.push(data);
                }
                if(count===fileName.length){
                    return res.send({
                        status: 1,
                        message: resData,
                    })
                }
                count++;
            })
        }
    }).catch(e=>{
        if(e){
            return res.send({
                status: 0,
                message: e
            })
        }
    })
}

function getTime(filename){
    let stat=fs.statSync(filename);
    return stat.ctime.toDateString();
}

//获取文章目录结构
exports.getContent=(req,res)=>{
    //使用marked heading 获取所有head，将所有head创建树状结构
    class heading{
        constructor(anchor,text,level) {
            this.id=anchor;
            this.text=text;
            this.level=level;
            this.children=[];
        }
    }
    //所有文件目录
    let resdata=[]
    //单个文件目录
    let toc=[]
    //id
    let anchor=0;
    //上级目录栈
    let lastHead=[];
    rendererMD.heading=function (text,level,raw) {
        let head=new heading(anchor,text,level);
        if(anchor===0){
            lastHead.push(head);
        }
        else if(lastHead[lastHead.length-1].level<level){
            lastHead[lastHead.length-1].children.push(head);
            lastHead.push(head);
        }
        else if(lastHead[lastHead.length-1].level===level){
            let k=lastHead.pop();
            if(lastHead.length===0){
                toc.push(k)
            }else{
                lastHead[lastHead.length-1].children.push(head);
            }
            lastHead.push(head);
        }
        else if(lastHead[lastHead.length-1].level>level){
            let len=Number(lastHead[lastHead.length-1].level)
            let k;
            for(let i=Number(level);i<=len;i++){
                k=lastHead.pop();
            }
            if(lastHead.length!==0){
                lastHead[lastHead.length-1].children.push(head);
                lastHead.push(head);
            }else{
                toc.push(k);
                lastHead.push(head);
            }
        }
        return `<h${level-2} id="toc-nav${anchor++}">${text}</h${level}>`
    }
    replaceImg();
    textHtml[req.query.id]=marked.parse(text[req.query.id])
    if(lastHead.length!==0){
        toc.push(lastHead[0]);
    }
    return res.send({
        status:1,
        message:toc,
    })

}

//获取文章内容
exports.getText=(req,res)=>{
    return res.send({
        status:1,
        message:textHtml[req.query.id],
    })
}

//替换文章内容中的图片路径
function replaceImg(){
    //匹配文档内容中的CDFG盘路径下对应的png、jpg结尾的图片路径
    const reg_img=/([C|D|F|G]:[\S\s]*?(.png|.jpg))/g;
    //对应图片应该设置的请求路径
    const requestPath="http:\//localhost:3000/images/"
    let imgText;
    for(let i=0;i<text.length;i++){
        while((imgText=reg_img.exec(text[i]))){
            //匹配后图片名
            let imgName=imgText[0].split("\\");
            //将图片名与请求路径拼接
            // let imgPath=path.join(requestPath,imgName[imgName.length-1]);
            let imgPath=requestPath+imgName[imgName.length-1];
            text[i]=text[i].replace(imgText[0],imgPath);
        }
    }
}