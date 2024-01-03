var { businx, pageSize, reviewx, photox } = require('./global');

// express
var express = require('express');
var app = express();
const port = process.env.PORT

app.listen(port, function () {
    console.log("== Server is listening on port", port);
});

const businessJsonFile = require('./businessJsonFile.json')
businx = businessJsonFile;

/*
 * GET /lodgings – fetch a list of all lodgings
 * POST /lodgings – create a new lodging
 * GET /lodgings/{lodgingID} – fetch data about a single lodging
 * PUT /lodgings/{lodgingID} – modify a single lodging
 * DELETE /lodgings/{lodgingID} – delete a single lodging
 */

app.use(express.json());

app.use(function (req, res, next) {
    console.log("== Request received")
    console.log("  - METHOD:", req.method)
    console.log("  - URL:", req.url)
    console.log("  - HEADERS:", req.headers)
    next()
})

// ----------
// Businesses
// ----------

/*
 * Business name
 * Business street address
 * Business city
 * Business state
 * Business ZIP code
 * Business phone number
 * Business category and subcategories (e.g. category "Restaurant" and subcategory "Pizza")
 The following information may also optionally be included when a new business is added:
   * Business website
   * Business email
 */
// POST: /business/{name:aaa, address:bbb, ...}   (CREATE A NEW BUSINESS)
app.post('/business', function (req, res) {
    // verify items in given json
    console.assert(req.body['name'] != undefined, 'name is undefined');
    console.assert(req.body['street address'] != undefined, 'street address is undefined');
    console.assert(req.body['city'] != undefined, 'city is undefined');
    console.assert(req.body['state'] != undefined, 'state is undefined');
    console.assert(req.body['zip code'] != undefined, 'zip code is undefined');
    console.assert(req.body['phone number'] != undefined, 'phone number is undefined');
    console.assert(req.body['category'] != undefined, 'category is undefined');
    // console.assert(req.body['website'] != undefined, 'website is undefined');
    // console.assert(req.body['email'] != undefined, 'email is undefined');

    businx.push(req.body);
    res.status(200).json({
        'index': businx.length,
        'body': req.body
    });
    // res.status(200).send(`business created: ${req.body}`);
});

app.post('/testRequest', function (req, res) {
    // verify items in given json
    console.assert(req.body['test1'] != undefined, 'test1 is undefined');
    console.assert(req.body['test2'] != undefined, 'test2 is undefined');
    console.assert(req.body['test3'] != undefined, 'test3 is undefined');
    //console.assert(req.body['test4'] != undefined, 'test4 is undefined');


    businx.push(req.body);
    res.status(200).json({
        'index': businx.length,
        'body': req.body
    });
    // res.status(200).send(`business created: ${req.body}`);
});

app.post("/query", function (req, res) {
    res.status(200).send(businessJsonFile)
})

/*
 * Business owners may modify any of the information listed above for an already-existing business they own.
 */
// PUT: /business/2     (MODIFY A SINGLE BUSINESS)
app.put('/business/:businessID', (req, res) => {
    // console.log(req.body);
    businx[`${req.params.businessID}`]['name'] = req.body['name'];
    businx[`${req.params.businessID}`]['street address'] = req.body['street address'];
    businx[`${req.params.businessID}`]['city'] = req.body['city'];
    businx[`${req.params.businessID}`]['state'] = req.body['state'];
    // res.status(200).json(`${businx[`${req.params.businessID}`]}`)
    var id = `${req.params.businessID}`;
    var aaa = businx[id]
    // res.status(200).json(`${businx[id]}`);
    res.status(200).json(aaa);
});

/*
 * Business owners may remove a business listing from the application.
 */
// DELETE: /business/2      (DELETE A SINGLE BUSINESS)
app.delete(
    '/business/:businessID',
    function (req, res, next) {
        var businessID = req.params.businessID;
        if (businx[businessID]) {
            businx[businessID] = null;
            res.status(204).end();
        } else {
            console.log(`can't find id: ${req.params.businessID}`)
            next();
        }
    }
);

/*
 * Users may get a list of businesses.  The representations of businesses in the returned list should include all of the information described above.  In a later assignment, we will implement functionality to allow the user to list only a subset of the businesses based on some filtering criteria, but for now, assume that users will only want to fetch a list of all businesses.
 */
// GET: /business       (FETCH A LIST OF ALL BUSINESS)
// GET: /business?page=2
app.get('/business', function (req, res) {
    // console.log(req.query.page)
    if (req.query.page == undefined) {
        var obj = {};
        obj["pageNumber"] = 1;
        obj["totalPages"] = Math.ceil(businx.length / pageSize);
        obj["pageSize"] = pageSize;
        obj["totalCount"] = businx.length;
        var jsonData = {};
        var end = Math.min(pageSize, businx.length);
        for (let index = 0; index < end; ++index) {
            // console.log(`index: ${index}, businx[index]:${buisinx[index]}`);
            jsonData[index] = businx[index];
        }
        obj["business"] = jsonData;
    } else {
        var obj = {};
        obj["pageNumber"] = req.query.page;
        obj["totalPages"] = Math.ceil(businx.length / pageSize);
        obj["pageSize"] = pageSize;
        obj["totalCount"] = businx.length;
        var jsonData = {};
        var begin = (req.query.page - 1) * pageSize;
        for (let index = begin; index < begin + pageSize; ++index) {
            // console.log(`index: ${index}, businx[index]:${buisinx[index]}`);
            jsonData[index] = businx[index];
        }
        obj["business"] = jsonData;
    }
    res.status(200).json(obj);
    // res.status(200).send(`businx created: ${req.body}`);
});

/*
 * Users may fetch detailed information about a business.  Detailed business information will include all of the information described above as well as reviews of the business and photos of the business (which we discuss below).
 */
// GET: /business/123       (FETCH DATA ABOUT A SINGLE BUSINESS)
app.get('/business/:businessID', function (req, res, next) {
    // res.status(200).send(`Business(${req.params.businessID})`);
    res.status(200).json(businx[req.params.businessID]);
});


// -------
// Reviews
// -------

/*
 * Users may write a review of an existing business. A review will include the following information:
    * A "star" rating between 0 and 5 (e.g. 4 stars)
    * An "dollar sign" rating between 1 and 4, indicating how expensive the business is (e.g. 2 dollar signs)
    * An optional written review
  Note that a user may write at most one review of any business.
 */
// POST: /review/1   (CREATE A NEW REVIEW)
app.post('/review/:businessID', function (req, res) {
    // verify items in given json
    console.assert(req.body['star'] != undefined, 'star is undefined');
    console.assert(req.body['dollar sign'] != undefined, 'dollar sign is undefined');
    console.assert(req.body['written review'] != undefined, 'written review is undefined');

    var starString = req.body['star'];
    if (starString.length > 5 || starString.length == 0)
    {
        res.status(200).send("ERROR WITH STARS");
    }

    var dollarString = req.body['dollar sign']
    if (dollarString.length > 4 || dollarString.length == 1)
    {
        res.status(200).send("ERROR WITH DOLLAR SIGN");
    }

    reviewx[`${req.params.businessID}`] = req.body;
    res.status(200).json(req.body);
    // res.status(200).send(`business created: ${req.body}`);
});

/*
 * Users may modify or delete any review they've written.
 */
// PUT: /review/2     (MODIFY A SINGLE REVIEW)
app.put('/review/:businessID', (req, res) => {
    console.log(req.body);

    // verify items in given json
    console.assert(req.body['star'] != undefined, 'star is undefined');
    console.assert(req.body['dollar sign'] != undefined, 'dollar sign is undefined');

    var id = `${req.params.businessID}`;
    reviewx[id] = req.body;
    // res.status(200).json(`${reviewx[id]}`);
    res.status(200).json(reviewx[id]);
});

// DELETE: /review/2      (DELETE A SINGLE review)
app.delete(
    '/review/:businessID',
    function (req, res, next) {
        var businessID = parseInt(req.params.businessID);
        if (reviewx[businessID]) {
            reviewx[businessID] = null;
            res.status(204).end();
        } else {
            console.log(`can't find id: ${req.params.businessID}`)
            next();
        }
    }
);


app.get('/review', function (req, res) {
    res.status(200).json(reviewx);
});


// -------
// Photos
// -------


// POST: /photos/1   (CREATE A NEW photos)
app.post('/photos/:businessID', function (req, res) {
    // verify items in given json
    console.assert(req.body['photo source'] != undefined, 'photo source is undefined');
    console.assert(req.body['photo caption'] != undefined, 'photo caption  is undefined');


    photox[`${req.params.businessID}`] = req.body;
    res.status(200).json(req.body);
    // res.status(200).send(`business created: ${req.body}`);
});

/*
 * Users may modify or delete any photos they've written.
 */
// PUT: /photos/2     (MODIFY A SINGLE photos)
app.put('/photos/:businessID', (req, res) => {
    console.log(req.body);

    // verify items in given json
    console.assert(req.body['photo source'] != undefined, 'photo source is undefined');
    console.assert(req.body['photo caption'] != undefined, 'photo caption is undefined');

    var id = `${req.params.businessID}`;
    photox[id] = req.body;
    res.status(200).json(photox[id]);
});

// DELETE: /photos/2      (DELETE A SINGLE review)
app.delete(
    '/photos/:businessID',
    function (req, res, next) {
        var businessID = parseInt(req.params.businessID);
        if (photox[businessID]) {
            photox[businessID] = null;
            res.status(204).end();
        } else {
            console.log(`can't find id: ${req.params.businessID}`)
            next();
        }
    }
);


app.get('/photos', function (req, res) {
    res.status(200).json(photox);
});

/* 
 * Users may list all of the businesses they own.
 */

/*
 * Users may list all of the reviews they've written.
 */

/*
 * Users may list all of the photos they've uploaded.
 */


app.use('*', function (req, res) {
    res.status(404).send({
        err: "The requested resource doesn't exist"
    });
});

app.use(function (err, req, res, next) {
    console.log("  - err:", err)
    res.status(500).send()
})
