const express=require('express')
//创建路由对象
const router=express.Router()

const projectHandler=require('../service/project_handler')

router.get('/',projectHandler.getBanner);

module.exports = router