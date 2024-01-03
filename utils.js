let mydb = null;    // my mongodb databases
let busisCollect = null;    // businesses collection
let photosCollect = null;   // photos collection
let reviewsCollect = null;  // reviews collection
let usersCollect = null;    // users collection

var printstr = function (obj) {
    console.log(JSON.stringify(obj, null, 4));
}

var jsonstr = function (obj) {
    return JSON.stringify(obj, null, 4);
}

/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
    ownerId: { required: true },
    name: { required: true },
    address: { required: true },
    city: { required: true },
    state: { required: true },
    zip: { required: true },
    phone: { required: true },
    category: { required: true },
    subcategory: { required: true },
    website: { required: false },
    email: { required: false }
};

/*
* Schema describing required/optional fields of a photo object.
*/
const photoSchema = {
    userId: { required: true },
    businessId: { required: true },
    caption: { required: false }
};

/*
 * Schema describing required/optional fields of a review object.
 */
const reviewSchema = {
    userId: { required: true },
    businessId: { required: true },
    dollars: { required: true },
    stars: { required: true },
    review: { required: false }
};

/*
 * Schema for a User.
 */
const UserSchema = {
    name: { required: true },
    email: { required: true },
    password: { required: true }
}

module.exports = {
    printstr,
    jsonstr,

    mydb,
    busisCollect,
    photosCollect,
    reviewsCollect,
    usersCollect,

    businessSchema,
    photoSchema,
    reviewSchema,
    UserSchema,
}
