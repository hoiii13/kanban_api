const express = require('express')

const router = express.Router()

const memberHandler = require('../router_handler/member')

const expressjoi = require('@escook/express-joi')

const {add_member_schema, del_member_schema} = require('../schema/member')

router.post('/add', expressjoi(add_member_schema),memberHandler.addMembers)

router.post('/delete',expressjoi(del_member_schema), memberHandler.delMember)

module.exports = router