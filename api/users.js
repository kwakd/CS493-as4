const utils = require('../utils.js');
const router = require('express').Router();
exports.router = router;

const { generateAuthToken, requireAuthentication } = require('../lib/auth')

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', requireAuthentication, async function (req, res) {
    const userid = parseInt(req.params.userid);
    var busis = [];
    var busislist = await utils.busisCollect.find({
        ownerid: userid
    });
    await busislist.forEach(doc => {
        // console.log(doc);
        busis.push(doc);
    });
    res.status(200).json({
        businesses: busis,
    });
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userid/reviews', requireAuthentication,  async function (req, res) {
    const userid = parseInt(req.params.userid);
    var rvws = [];
    var rvwslist = await utils.reviewsCollect.find({
        userid: userid
    });
    await rvwslist.forEach(doc => {
        // console.log(doc);
        rvws.push(doc);
    });
    res.status(200).json({
        reviews: rvws,
    });
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:userid/photos', requireAuthentication,  async function (req, res) {
    const userid = parseInt(req.params.userid);
    var phts = [];
    var phtslist = await utils.photosCollect.find({
        userid: userid
    });
    await phtslist.forEach(doc => {
        // console.log(doc);
        phts.push(doc);
    });
    res.status(200).json({
        photos: phts,
    });
});


//
// user login
//

const bcrypt = require('bcryptjs')

const { validateAgainstSchema } = require('../lib/validation')

// POST users (insert user)
router.post('/',  async function (req, res) {
    if (validateAgainstSchema(req.body, utils.UserSchema)) {
        const newUser = extractValidFields(req.body, utils.UserSchema);
        var count = await utils.usersCollect.countDocuments();
        newUser.id = count;

        const _id = await insertNewUser(req.body)
        res.status(201).send({
            _id: _id,
            id: newUser.id,
        })
    } else {
        res.status(400).send({
            error: "Request body does not contain a valid User."
        })
    }

    // TODO for debugging, remove
    var cursor = await utils.usersCollect.find({});
    console.log('after new user added');
    await cursor.forEach(doc => console.log(doc));
    // ^^^^^^^^^^^^^
})

// POST users/login (login)
router.post('/login',  async function (req, res) {
    if (req.body && req.body.id && req.body.password) {
        const user = await getUserById(req.body.id, true)
        const authenticated = user && await bcrypt.compare(
            req.body.password,
            user.password
        )
        if (authenticated) {
            const token = generateAuthToken(req.body.userID);
            res.status(200).send({ token: token });
        } else {
            res.status(401).send({
                error: "Invalid credentials"
            })
        }
    } else {
        res.status(400).send({
            error: "Request needs user ID and password."
        })
    }
})


//
// fetch all users
//
router.get('/', requireAuthentication, async function (req, res, next) {
    var userslist = await utils.usersCollect.find({})
    var allusers = []
    await userslist.forEach(doc => {
        // console.log(doc);
        allusers.push(doc);
    });
    res.status(200).send(allusers)
})

//
//
//
router.get('/:userid', requireAuthentication, async function (req, res, next) {
    const userid = parseInt(req.params.userid);

    // reviews with userid
    const rvwslist = await utils.reviewsCollect.find({
        userId: userid
    });
    var rvws = [];
    await rvwslist.forEach(doc => {
        rvws.push(doc);
        console.log(doc);
    });

    // photos with userid
    const phtslist = await utils.photosCollect.find({
        userId: userid
    });
    var phts = [];
    await phtslist.forEach(doc => {
        phts.push(doc);
        console.log(doc);
    });

    // get user with userid
    const userlist = await utils.usersCollect.find({
        id: userid
    })

    // create userinfo
    const userinfo = {
        reviews: rvws,
        photos: phts,
    };

    var oneuser = []
    await userlist.forEach(doc => {
            oneuser.push(doc)
    });
    Object.assign(userinfo, oneuser);

    res.status(200).json(userinfo);
})


// ========================================================
/*
 * User schema and data accessor methods.
 */

const { ObjectId } = require('mongodb')
const { extractValidFields } = require('../lib/validation')
const { getDBReference } = require('../mymongodb');
const res = require('express/lib/response');

/*
 * Insert a new User into the DB.
 */
var insertNewUser = async function (user) {
    const userToInsert = extractValidFields(user, utils.UserSchema)
    userToInsert.password = await bcrypt.hash(userToInsert.password, 8)
    console.log("== Hashed, salted password:", userToInsert.password)
    // const db = getDBReference()     // db == utils.mydb
    // const collection = db.collection('users')
    // const result = await collection.insertOne(userToInsert)
    userToInsert.id = await utils.usersCollect.countDocuments();
    const result = await utils.usersCollect.insertOne(userToInsert)
    userToInsert._id = result.insertedId
    // utils.printstr('userToInsert._id: ' + userToInsert._id)
    return result.insertedId
}


/*
 * Fetch a user from the DB based on user ID.
 */
var getUserById = async function (id, includePassword) {
    // const db = getDBReference()     // db == utils.mydb
    // const collection = db.collection('users')
    if (!ObjectId.isValid(id)) {
        return null
    } else {
        // const results = await collection
        const results = await utils.usersCollect
            .find({ _id: new ObjectId(id) })
            .project(includePassword ? {} : { password: 0 })
            .toArray()
        return results[0]
    }
}

