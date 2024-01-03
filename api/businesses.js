const utils = require('../utils.js');
const { ObjectID } = require('mongodb');

const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

exports.router = router;

const { generateAuthToken, requireAuthentication } = require('../lib/auth')

/*
 * Route to return a list of businesses.
 */
router.get('/', requireAuthentication, async function (req, res) {
    /*
     * Compute page number based on optional query string parameter `page`.
     * Make sure page is within allowed bounds.
     */
    var count = await utils.busisCollect.countDocuments();
    let page = parseInt(req.query.page) || 1;
    const numPerPage = 10;
    const lastPage = Math.ceil(count / numPerPage);
    page = page > lastPage ? lastPage : page;
    page = page < 1 ? 1 : page;

    /*
     * Calculate starting and ending indices of businesses on requested page and
     * slice out the corresponsing sub-array of busibesses.
     */
    const start = (page - 1) * numPerPage;
    const end = start + numPerPage;

    // get all list of businesses
    // await utils.busisCollect.find({}).forEach(doc => console.log(doc));
    var onepage = [];
    var busislist = await utils.busisCollect.find({});
    // var i = 0;
    await busislist.forEach(doc => {
        // doc.id = i
        // i++
        // console.log(doc);
        onepage.push(doc);
    });
    const pageBusinesses = onepage.slice(start, end);

    /*
     * Generate HATEOAS links for surrounding pages.
     */
    const links = {};
    if (page < lastPage) {
        links.nextPage = `/businesses?page=${page + 1}`;
        links.lastPage = `/businesses?page=${lastPage}`;
    }
    if (page > 1) {
        links.prevPage = `/businesses?page=${page - 1}`;
        links.firstPage = '/businesses?page=1';
    }

    /*
     * Construct and send response.
     */
    res.status(200).json({
        businesses: pageBusinesses,
        pageNumber: page,
        totalPages: lastPage,
        pageSize: numPerPage,
        totalCount: count,
        links: links
    });
});

//
// fetch all businesses
//
router.get('/all', requireAuthentication, async function (req, res) {
    var count = await utils.busisCollect.countDocuments();
    var allbusiness = [];
    var busislist = await utils.busisCollect.find({});
    await busislist.forEach(doc => {
        allbusiness.push(doc);
    });
    res.status(200).send({
       businesses: allbusiness
    });
});


/*
 * Route to create a new business.
 */
router.post('/', requireAuthentication, async function (req, res, next) {
    if (validateAgainstSchema(req.body, utils.businessSchema)) {
        const newbusi = extractValidFields(req.body, utils.businessSchema);
        var count = await utils.busisCollect.countDocuments();
        newbusi.id = count;
        await utils.busisCollect.insertOne(newbusi, function (err, res) {
            if (err) {
                console.log(`insertOne failed: ${err}`);
                throw err;
            }
            console.log("insertOne successful");
        });
        res.status(201).json({
            id: newbusi.id,
            links: {
                business: `/businesses/${newbusi.id}`
            }
        });
    } else {
        res.status(400).json({
            error: "Request body is not a valid business object"
        });
    }
});

/*
 * Route to fetch info about a specific business.
 */
router.get('/:businessid', requireAuthentication, async function (req, res, next) {
    const businessid = parseInt(req.params.businessid);
    // find businesses with businessid
    const busislist = await utils.busisCollect.find({
        id: businessid
    });
    // create currentlist (this is to find length of busislist)
    var currentlist = [];
    await busislist.forEach(doc => {
        currentlist.push(doc);
        console.log(doc);
    });

    if (currentlist.length == 0) {
        console.log(`id (${businessid}) not found`);
        next();
    } else {
        /*
        * Find all reviews and photos for the specified business and create a
        * new object containing all of the business data, including reviews and
        * photos.
        */

        // reviews with businessid
        const rvwslist = await utils.reviewsCollect.find({
            businessId: businessid
        });
        var rvws = [];
        await rvwslist.forEach(doc => {
            rvws.push(doc);
            console.log(doc);
        });

        // photos with buisnessid
        const phtslist = await utils.photosCollect.find({
            businessId: businessid
        });
        var phts = [];
        await phtslist.forEach(doc => {
            phts.push(doc);
            console.log(doc);
        });

        const business = {
            reviews: rvws,
            photos: phts,
        };
        Object.assign(business, currentlist[0]);
        res.status(200).json(business);
    }
});

/*
 * Route to replace data for a business.
 */
router.put('/:businessid', requireAuthentication, async function (req, res, next) {
    const businessid = parseInt(req.params.businessid);
    // find businesses with businessid
    const busislist = await utils.busisCollect.find({
        id: businessid
    });
    // create currentlist (this is to find length of busislist)
    var currentlist = [];
    await busislist.forEach(doc => {
        currentlist.push(doc);
        console.log(doc);
    });
    if (currentlist.length == 0) {
        console.log(`id (${businessid}) not found`);
        next();
    } else {
        if (validateAgainstSchema(req.body, utils.businessSchema)) {
            const newbusi = extractValidFields(req.body, utils.businessSchema);
            newbusi.id = businessid;
            const result = await utils.busisCollect.replaceOne(
                { id: businessid },
                newbusi
            );
            res.status(200).json({
                links: {
                    business: `/businesses/${businessid}`
                }
            });
        } else {
            res.status(400).json({
                error: "Request body is not a valid business object"
            });
        }
    }
});

/*
 * Route to delete a business.
 */
router.delete('/:businessid', requireAuthentication, async function (req, res, next) {
    const businessid = parseInt(req.params.businessid);
    // find businesses with businessid
    const busislist = await utils.busisCollect.find({
        id: businessid
    });
    // create currentlist (this is to find length of busislist)
    var currentlist = [];
    await busislist.forEach(doc => {
        currentlist.push(doc);
        console.log(doc);
    });
    if (currentlist.length == 0) {
        console.log(`id (${businessid}) not found`);
        next();
    } else {
        const result = await utils.busisCollect.deleteOne(
            { id: businessid },
        );
        res.status(204).end();
    }
});
