const joi =  require('joi')

const project_name = joi.string().required()
const project_desc = joi.string().required()
const start_time = joi.number().integer().required()
const end_time = joi.number().integer().required()
const creator_id = joi.number().integer().min(1).required()


exports.create_project_schema = {
    body: {
        project_name,
        creator_id
    }
}