const express=require('express')
//创建路由对象
const router=express.Router()

const headerHandler=require('../service/header_handler')

router.get('/header',headerHandler.getHeader)
router.get('/text',headerHandler.getText)
router.get('/content',headerHandler.getContent)

module.exports = router