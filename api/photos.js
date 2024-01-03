// var { printstr } = require('../utils.js');
const utils = require('../utils.js');
const { generateAuthToken, requireAuthentication } = require('../lib/auth')

const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

exports.router = router;

//
// fetch all photos
//
router.get('/', requireAuthentication, async function (req, res, next) {
    var photoslist = await utils.photosCollect.find({})
    var allphotos = []
    await photoslist.forEach(doc => {
        // console.log(doc);
        allphotos.push(doc);
    });
    res.status(200).send(allphotos)
})

/*
 * Route to create a new photo.
 */
router.post('/', requireAuthentication, async function (req, res, next) {
    if (validateAgainstSchema(req.body, utils.photoSchema)) {
        const newphoto = extractValidFields(req.body, utils.photoSchema);
        var count = await utils.photosCollect.countDocuments();
        newphoto.id = count;
        await utils.photosCollect.insertOne(newphoto, function (err, res) {
            if (err) {
                console.log('insertOne failed: ' + err);
                throw err;
            }
            console.log("insertOne successful");
        });
        res.status(201).json({
            id: newphoto.id,
            links: {
                photo: '/photos/' + newphoto.id,
                business: '/businesses/' + newphoto.businessId
            }
        });
    } else {
        res.status(400).json({
            error: "Request body is not a valid business object"
        });
    }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', requireAuthentication, async function (req, res, next) {
    const photoid = parseInt(req.params.photoID);
    // find photo with photoid
    const photolist = await utils.photosCollect.find({
        id: photoid
    });
    // create currentlist (this is to find length of photolist)
    var currentlist = [];
    await photolist.forEach(doc => {
        currentlist.push(doc);
        console.log(doc);
    });
    if (currentlist.length == 0) {
        console.log('id (' + photoid + ') not found');
        next();
    } else {
        res.status(200).json({
            photos: currentlist
        });
    }
});

/*
 * Route to update a photo.
 */
router.put('/:photoID', requireAuthentication, async function (req, res, next) {
    const photoid = parseInt(req.params.photoID);
    // find businesses with photoid
    const photolist = await utils.photosCollect.find({
        id: photoid
    });
    // create currentlist (this is to find length of photolist)
    var currentlist = [];
    await photolist.forEach(doc => {
        currentlist.push(doc);
        console.log(doc);
    });
    if (currentlist.length == 0) {
        console.log('id (' + photoid + ') not found');
        next();
    } else {
        if (validateAgainstSchema(req.body, utils.photoSchema)) {
            const newphoto = extractValidFields(req.body, utils.photoSchema);
            newphoto.id = photoid;
            const result = await utils.photosCollect.replaceOne(
                { id: photoid },
                newphoto
            );
            res.status(200).json({
                links: {
                    photo: '/photos/' + photoid,
                    business: '/businesses/' + newphoto.businessid,
                }
            });
        } else {
            res.status(400).json({
                error: "Request body is not a valid photo object"
            });
        }
    }
});

/*
 * Route to delete a photo.
 */
router.delete('/:photoID', requireAuthentication,  async function (req, res, next) {
    const photoid = parseInt(req.params.photoID);
    // find businesses with photoid
    const photolist = await utils.photosCollect.find({
        id: photoid
    });
    // create currentlist (this is to find length of photolist)
    var currentlist = [];
    await photolist.forEach(doc => {
        currentlist.push(doc);
        console.log(doc);
    });
    if (currentlist.length == 0) {
        console.log('id (' + photoid + ') not found');
        next();
    } else {
        const result = await utils.photosCollect.deleteOne(
            { id: photoid },
        );
        res.status(204).end();
    }
});
