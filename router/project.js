const express = require('express')

const router = express.Router()

const projectHandler = require('../router_handler/project')

const expressjoi = require('@escook/express-joi')

const {create_project_schema } = require('../schema/project')

router.post('/create', projectHandler.createProject)

module.exports = router