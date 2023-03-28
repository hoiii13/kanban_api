const joi = require('joi')

const project_id = joi.number().required()
const user_id = joi.number().required()
const username = joi.string().required()

exports.add_member_schema = {
    body: {
        project_id,
        user_id,
        username
    }
}

exports.del_member_schema = {
    body: {
        project_id,
        user_id,
    }
}