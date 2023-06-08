const OSS = require('ali-oss');

const client = new OSS({
    region: 'oss-cn-guangzhou',
    accessKeyId: 'LTAI5tRqgwupKDSVd3kzDn8D',
    accessKeySecret: '7RUZeBJorvzMTj0SQ54jZOZRyzs7sf',
    bucket: 'thekanban'
});

exports.uploadImage = (req, res) => {
    try {
        const file = req.files.file;
        const result = await client.put(file.name, file.path);
        res.send({
            status: 0,
            message: result
        })
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}