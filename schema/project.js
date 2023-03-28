const joi =  require('joi')

const project_id = joi.number().required()
const project_name = joi.string().required()
const project_desc = joi.string().required()
const start_time = joi.number().integer().required()
const end_time = joi.number().integer().required()
const creator_id = joi.number().integer().min(1).required()
const creator = joi.string().required()


exports.create_project_schema = {
    body: {
        project_name,
        project_desc,
        start_time,
        end_time,
    }
}

exports.edit_project_schema = {
    body: {
        project_id,
        project_name,
        project_desc,
        start_time,
        end_time,
    }
}