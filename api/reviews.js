const utils = require('../utils.js');
const { generateAuthToken, requireAuthentication } = require('../lib/auth')

const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

exports.router = router;

//
// fetch all reviews
//
router.get('/', requireAuthentication, async function (req, res, next) {
  var reviewslist = await utils.reviewsCollect.find({})
  var allreviews = []
  await reviewslist.forEach(doc => {
      // console.log(doc);
      allreviews.push(doc);
  });
  res.status(200).send(allreviews)
})

/*
 * Route to create a new review.
 */
router.post('/', requireAuthentication,  async function (req, res, next) {
  if (validateAgainstSchema(req.body, utils.reviewSchema)) {
    const newreview = extractValidFields(req.body, utils.reviewSchema);
    var count = await utils.reviewsCollect.countDocuments();
    newreview.id = count;
    await utils.reviewsCollect.insertOne(newreview, function(err, res) {
        if (err) {
          console.log('insertOne failed: ' + err);
          throw err;
        }
        console.log("insertOne successful");
    });
    res.status(201).json({
      id: newreview.id,
      links: {
        review: '/reviews/' + newreview.id,
        business: '/businesses/' + newreview.businessId,
      }
    });
  } else {
    res.status(400).json({
      error: "Request body is not a valid business object"
    });
  }
});

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewID', requireAuthentication,  async function (req, res, next) {
  const reviewid = parseInt(req.params.reviewID);
  // find photo with reviewid
  const reviewlist = await utils.reviewsCollect.find({
    id: reviewid
  });
  // create currentlist (this is to find length of reviewlist)
  var currentlist = [];
  await reviewlist.forEach(doc => {
    currentlist.push(doc);
    console.log(doc);
  });
  if (currentlist.length == 0) {
    console.log('id (' + reviewid + ') not found');
    next();
  } else {
    res.status(200).json({
      reviews: currentlist
    });
  } 
});

/*
 * Route to update a review.
 */
router.put('/:reviewID', requireAuthentication, async function (req, res, next) {
  const reviewid = parseInt(req.params.reviewID);
  // find businesses with reviewid
  const reviewlist = await utils.reviewsCollect.find({
    id: reviewid
  });
  // create currentlist (this is to find length of reviewlist)
  var currentlist = [];
  await reviewlist.forEach(doc => {
    currentlist.push(doc);
    console.log(doc);
  });
  if (currentlist.length == 0) {
    console.log('id (' + reviewid + ') not found');
    next();
  } else {
    if (validateAgainstSchema(req.body, utils.reviewSchema)) {
      const newreview = extractValidFields(req.body, utils.reviewSchema);
      newreview.id = reviewid;
      const result = await utils.reviewsCollect.replaceOne(
        { id: reviewid },
        newreview
      );
      res.status(200).json({
        links: {
          review: '/reviews/' + reviewid,
          business: '/businesses/' + newreview.businessid,
        }
      });
    } else {
      res.status(400).json({
        error: "Request body is not a valid review object"
      });
    }
  }
});

/*
 * Route to delete a review.
 */
router.delete('/:reviewID', requireAuthentication, async function (req, res, next) {
  const reviewid = parseInt(req.params.reviewID);
  // find businesses with reviewid
  const reviewlist = await utils.reviewsCollect.find({
    id: reviewid
  });
  // create currentlist (this is to find length of reviewlist)
  var currentlist = [];
  await reviewlist.forEach(doc => {
    currentlist.push(doc);
    console.log(doc);
  });
  if (currentlist.length == 0) {
    console.log('id (' + reviewid + ') not found');

    next();
  } else {
    const result = await utils.reviewsCollect.deleteOne(
      { id: reviewid },
    );
    res.status(204).end();
  }
});
