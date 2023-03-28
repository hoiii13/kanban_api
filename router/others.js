const express = require('express')

const router = express.Router()

const othersHandler = require('../router_handler/others')

const expressjoi = require('@escook/express-joi')

const {add_others_schema, del_others_schema} = require('../schema/others')

router.post('/add', expressjoi(add_others_schema), othersHandler.addOthers)

router.post('/delete', expressjoi(del_others_schema), othersHandler.delOthers)

module.exports = router