const fs = require('fs');
const utils = require('./utils.js');

// connect mongodb
const { MongoClient } = require('mongodb');

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDBName = process.env.MONGO_DB_NAME;
const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`; // mongodb://root:hunter2@localhost:27017/admin

console.log(mongoURL);

getDBReference = function () {
    return utils.mydb
}

//
// let's connect to mongodb
//
MongoClient.connect(mongoURL, function (err, client) {
    if (err) {
        console.log("== Mongodb connection failed:\n", err);
        throw err;
    }
    // database created successfully
    console.log('mongodb database created! ' + mongoURL + ' ' + mongoDBName);
    // create mydb
    utils.mydb = client.db(mongoDBName);

    convertJsonToMongoDB();
});

const { validateAgainstSchema, extractValidFields } = require('./lib/validation');

//
// read json file and convert json to mongodb
//
convertJsonToMongoDB = async function () {
    // read businesses.json
    let busisData = fs.readFileSync('./data/businesses.json');
    let busisJson = JSON.parse(busisData);
    // let's add id to db
    var i = 0
    busisJson.forEach(doc => {
        doc.id = i
        i++
    });
    var valid = busisJson.every(j => validateAgainstSchema(j, utils.businessSchema));
    if (valid) {
        console.log('businesses.json');
        console.log(busisJson);
    }
    else {
        console.log('businesses.json NOT valid');
    }

    // read photos.json
    let photosData = fs.readFileSync('./data/photos.json');
    let photosJson = JSON.parse(photosData);
    // let's add id to db
    var i = 0
    photosJson.forEach(doc => {
        doc.id = i
        i++
    });
    var valid = photosJson.every(j => validateAgainstSchema(j, utils.photoSchema));
    if (valid) {
        console.log('photos.json');
        console.log(photosJson);
    }
    else {
        console.log('photos.json NOT valid');
    }

    // read reviews.json
    let reviewsData = fs.readFileSync('./data/reviews.json');
    let reviewsJson = JSON.parse(reviewsData);
    // let's add id to db
    var i = 0
    reviewsJson.forEach(doc => {
        doc.id = i
        i++
    });
    var valid = reviewsJson.every(j => validateAgainstSchema(j, utils.reviewSchema));
    if (valid) {
        console.log('reviews.json');
        console.log(reviewsJson);
    }
    else {
        console.log('reviews.json NOT valid');
    }

    // read users.json
    let usersData = fs.readFileSync('./data/users.json');
    let usersJson = JSON.parse(usersData);
    // let's add id to db
    var i = 0
    usersJson.forEach(doc => {
        doc.id = i
        i++
    });
    var valid = usersJson.every(j => validateAgainstSchema(j, utils.UserSchema));
    if (valid) {
        console.log('users.json');
        console.log(usersJson);
    }
    else {
        console.log('users.json NOT valid');
    }

    //
    // get collections
    //
    utils.busisCollect = utils.mydb.collection('businesses');
    utils.photosCollect = utils.mydb.collection('photos');
    utils.reviewsCollect = utils.mydb.collection('reviews');
    utils.usersCollect = utils.mydb.collection('users');

    //
    // reset collections
    //
    await utils.busisCollect.deleteMany();
    await utils.photosCollect.deleteMany();
    await utils.reviewsCollect.deleteMany();
    await utils.usersCollect.deleteMany();

    // -------------------------
    // create businesses collection
    // -------------------------
    var result = await utils.busisCollect.insertMany(busisJson);
    var cursor = await utils.busisCollect.find({});
    console.log('busisCollect');
    await cursor.forEach(doc => console.log(doc));

    // get number of business
    var count = await utils.busisCollect.countDocuments();

    // -------------------------
    // create photos collection
    // -------------------------
    var result = await utils.photosCollect.insertMany(photosJson);
    var cursor = await utils.photosCollect.find({});
    console.log('photosCollect');
    await cursor.forEach(doc => console.log(doc));

    // get number of photos
    var count = await utils.photosCollect.countDocuments();

    // -------------------------
    // create reviews collection
    // -------------------------
    var result = await utils.reviewsCollect.insertMany(reviewsJson);
    var cursor = await utils.reviewsCollect.find({});
    console.log('reviewsCollect');
    await cursor.forEach(doc => console.log(doc));

    // get number of reviews
    var count = await utils.reviewsCollect.countDocuments();

    // -------------------------
    // create users collection
    // -------------------------
    var result = await utils.usersCollect.insertMany(usersJson);
    // utils.printstr(result);
    // utils.printstr(result.insertedIds[0]);
    var cursor = await utils.usersCollect.find({});
    console.log('usersCollect');
    await cursor.forEach(doc => console.log(doc));

    // get number of users
    var count = await utils.usersCollect.countDocuments();
};

module.exports = {
    MongoClient,
    mongoHost,
    mongoPort,
    mongoUser,
    mongoPassword,
    mongoDBName,
    mongoURL,

    // connectToDB,
    getDBReference,
};
