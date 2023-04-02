const joi = require('joi')

const task_id = joi.number().required()
const create_time = joi.number().required()
const comment = joi.string().required()

exports.add_comment_schema = {
    body: {
        task_id,
        create_time,
        comment,
    }
}