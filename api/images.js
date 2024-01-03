/*
 * API sub-router for businesses collection endpoints.
 */

const { Router } = require('express')
const multer = require('multer')
const crypto = require('crypto')

const { connectToRabbitMQ, getChannel } = require('../lib/rabbitmq')
const { connectToDB } = require('../lib/mongo');
const {
    getImageInfoById,
    saveImageInfo,
    saveImageFile,
    getDownloadStreamByFilename
} = require('../models/image');

const router = Router()

const fileTypes = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif'
}

const upload = multer({
    storage: multer.diskStorage({
        destination: `${__dirname}/uploads`,
        filename: function (req, file, callback) {
            const ext = fileTypes[file.mimetype]
            const filename = crypto.pseudoRandomBytes(16).toString('hex')
            callback(null, `${filename}.${ext}`)
        }
    }),
    fileFilter: function (req, file, callback) {
        callback(null, !!fileTypes[file.mimetype])
    }
})

// /images
router.get('/', (req, res, next) => {
    res.status(200).sendFile(__dirname + '/index.html');
});

// /images/images
router.post('/images', upload.single('image'), async function (req, res, next) {
    console.log("== req.file:", req.file)
    console.log("== req.body:", req.body)
    if (req.file && req.body && req.body.userId) {
        const image = {
            userId: req.body.userId,
            path: req.file.path,
            filename: req.file.filename,
            mimetype: req.file.mimetype
        }
        // const id = await saveImageInfo(image)
        const id = await saveImageFile(image)

        // NOTE: act as producer
        const channel = getChannel()
        channel.sendToQueue('echo', Buffer.from(id.toString()))
        // DEBUG:
        // const sentence = "The quick brown fox jumped over the lazy dog"
        // sentence.split(' ').forEach(function (word) {
        //     channel.sendToQueue('echo', Buffer.from(word))
        // })

        res.status(200).send({ id: id })
    } else {
        res.status(400).send({
            err: 'Request body needs an "image" and a "userId"'
        })
    }
})

// /images/images/:id
router.get('/images/:id', async (req, res, next) => {
    try {
        const image = await getImageInfoById(req.params.id);
        if (image) {
            const resBody = {
                _id: image._id,
                url: `/media/images/${image.filename}`,
                // contentType: image.metadata.contentType,
                mimetype: image.metadata.mimetype,
                userId: image.metadata.userId,
                tags: image.metadata.tags
            }
            res.status(200).send(resBody);
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
});

// /images/media/images/:filename
router.get('/media/images/:filename', function (req, res, next) {
    getDownloadStreamByFilename(req.params.filename)
        .on('file', function (file) {
            res.status(200).type(file.metadata.mimetype)
        })
        .on('error', function (err) {
            if (err.code === 'ENOENT') {
                next()
            } else {
                next(err)
            }
        })
        .pipe(res)
})

module.exports = router
