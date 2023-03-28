const joi =  require('joi')

const task_id = joi.number().required()
const task_name = joi.string().required()
const task_desc = joi.string().required()
const start_time = joi.number().required()
const end_time = joi.number().required()
const project_id = joi.number().required()
const column = joi.number().required()
const actor_id = joi.number().required()
const creator = joi.string().required()

exports.creatr_task_schema = {
    body: {
        task_name,
        task_desc,
        start_time,
        end_time,
        project_id,
        column,
        actor_id,
        creator
    }
}

exports.edit_task_schema = {
    body: {
        task_id,
        task_name,
        task_desc,
        start_time,
        end_time,
        project_id,
        column,
        actor_id,
        creator
    }
}