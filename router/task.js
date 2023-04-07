const express = require('express')

const router = express.Router()

const taskHandler = require('../router_handler/task')

const expressjoi = require('@escook/express-joi')

const { creatr_task_schema, edit_task_schema } = require('../schema/task')

router.post('/create', expressjoi(creatr_task_schema), taskHandler.createTask)

router.post('/edit', expressjoi(edit_task_schema), taskHandler.editTask)

router.post('/info', taskHandler.getTaskInfo)

router.post('/delete', taskHandler.delTask)

router.post('/list', taskHandler.getTasks)

module.exports = router