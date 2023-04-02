const express = require('express')

const router = express.Router()

const projectHandler = require('../router_handler/project')

const expressjoi = require('@escook/express-joi')

const {create_project_schema, edit_project_schema } = require('../schema/project')

router.post('/create', expressjoi(create_project_schema), projectHandler.createProject)

router.post('/edit',expressjoi(edit_project_schema), projectHandler.editProject)

router.post('/delete', projectHandler.delProject)

router.post('/list', projectHandler.getProjects)

router.post('/info', projectHandler.getProject)

module.exports = router