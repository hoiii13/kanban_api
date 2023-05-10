const express = require('express')

const router = express.Router()

const inviteHandler = require('../router_handler/invite')

const expressjoi = require('@escook/express-joi')


router.post('/generate',inviteHandler.getInviteCode)

router.post('/verify',inviteHandler.parseInviteCode)

module.exports = router