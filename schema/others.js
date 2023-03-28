const joi = require('joi')

const task_id = joi.number().required()
const user_id = joi.number().required()
const username = joi.string().required()

exports.add_others_schema = {
    body: {
        task_id,
        user_id,
        username
    }
}

exports.del_others_schema = {
    body: {
        task_id,
        user_id
    }
}