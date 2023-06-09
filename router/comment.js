const express = require('express')

const router = express.Router()

const commentHandler = require('../router_handler/comment')

const expressjoi = require('@escook/express-joi')

const {add_comment_schema} = require('../schema/comment')

router.post('/add', expressjoi(add_comment_schema), commentHandler.addComment)

router.post('/list', commentHandler.getTaskComment)

router.post('/content_query', commentHandler.getUserComment)

router.post('/status', commentHandler.readComment)

module.exports = router