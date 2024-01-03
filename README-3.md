# Assignment 3

**Assignment due at 11:59pm on Monday 5/16/2022**<br/>
**Demo due by 11:59pm on Monday 5/30/2022**

The goal of this assignment is to incorporate authorization and authentication into our businesses API.  There are a few parts to this assignment, as described below.

You are provided some starter code in this repository that implements a MySQL/Sequelize-based solution to assignment 2.  The starter code contains the following components:
  * An API server is implemented in `server.js`.
  * Individual API routes are modularized within the `api/` directory.
  * Sequelize models are implemented in the `models/` directory.
  * Tests and a testing environment for the API are included in the `tests/` directory. You can import these tests into either Postman or Insomnia and build on them if you like. Note that, depending on where you're running your API server, you may need to update the `baseUrl` variable in the included testing environment to reflect the URL for your own server.
  * A script in `initDb.js` that populates the database with initial data from the `data/` directory.  You can run this script by running `npm run initdb`.
  * A Docker Compose specification in `compose.yml`.  This specification will launch the entire application from scratch, including populating the database using `initDb.js`.  Note that if you use this specification to launch the app, the `db-init` service and the `api` service will fail with an error (`ECONNREFUSED`) and be restarted continually until the database service is running and the database server itself is ready to accept connections.  Note that the Docker Compose specification relies on some environment variables being set in the included `.env` file.

Feel free to use this code as your starting point for this assignment.  You may also use your own solution to assignment 2 as your starting point if you like, or you may convert the existing solution to use MongoDB.  If you do either of those things, you must ensure that your API implementation matches the one from the starter code (i.e. it has all the same endpoints, etc.).

## 1. Implement an API endpoint for creating new users

Your first task for this assignment is to implement an API endpoint to enable the creation and storage of application users.  Specifically, you should create a `POST /users` API endpoint through which new users can register.  When a user registers, they should provide their name, email address, and password, and you should salt and hash the password on the server before storing it.

If you work with the starter code for this assignment, you'll need to create a Sequelize `User` model to represent users.  If you work with another version of the code, you'll have to model users in an appropriate way.  However you do it, you should store the following information for each user:
  * `id` - The primary key for the user (if you're using MongoDB, it's fine to stick with the default primary key name `_id`)
  * `name` - User's full name
  * `email` - User's email address (which must be unique among all users)
  * `password` - User's hashed/salted password
  * `admin` - A boolean flag indicating whether the user has administrative permissions (`false` by default)

Importantly, you'll need to make sure you hash and salt users passwords before storing them in your database.  If you stick with the Sequelize implementation from the starter code, the easiest way to do this is to use a [Sequelize setter](https://sequelize.org/docs/v6/core-concepts/getters-setters-virtuals/#setters) for your password field.

Also, note that the starter code contains some user data in `data/users.json`, which you can use to populate some initial users into your database.  If you're using the starter code's Sequelize implementation and populate your database using `initDb.js`, you can add additional code there to populate the users table in a manner similar to the way business, review, and photo data is populated using `bulkCreate()`.  If you do this, the values of the `ownerId` field in the initial business data should map to the correct users from the initial user data.

Finally, note that you may have to manually connect to the database (e.g. using the MySQL terminal monitor) to insert at least one user with administrative permissions (i.e. for whom the `admin` flag is `true`).  If you do this, you can use the following pre-salted/hashed version of the password "hunter2":
```
$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike
```

## 2. Enable JWT-based user logins and implement a user data access endpoint

Once you have enabled user registration for your application, implement a new `POST /users/login` API endpoint that allows a registered user to log in by sending their email address and password.  If the email/password combination is valid, you should respond with a JWT token, which the user can then send with future requests to authenticate themselves.  The JWT token payload should contain the user's ID (with which you should be able to fetch details about the user from the database) and any other information needed to implement the features described in this assignment, and it should expire after 24 hours.

If a user attempts to log in with an invalid username or password, you should respond with a 401 error.

In addition, you should create a `GET /users/{userId}` API endpoint that returns information about the specified user (excluding their password).

## 3. Require authorization to perform certain API actions

Once users can log in, modify your API to implement the following authorization scheme:
  * Only an authorized user can see their own user data and their own lists of businesses, reviews, and photos.  In other words, the following API endpoints should verify that the `userId` specified in the URL path matches the ID of the logged-in user (as indicated by a valid JWT provided by the client):
    * `GET /users/{userId}`
    * `GET /users/{userId}/businesses`
    * `GET /users/{userId}/photos`
    * `GET /users/{userId}/reviews`

  * Only an authorized user can create new businesses, reviews, and photos.  In other words, the following API endpoints must ensure that a user is logged in and that the user ID specified in the POST request body matches the ID of the logged-in user:
    * `POST /businesses`
    * `POST /photos`
    * `POST /reviews`

  * Only an authorized user can modify or delete their own businesses, reviews, and photos.  In other words, the following API endpoints must ensure that a user is logged in and that the user ID for the entity being modified/deleted matches the ID of the logged-in user:
    * `PUT /businesses`, `DELETE /businesses`
    * `PUT /photos`, `DELETE /photos`
    * `PUT /reviews`, `DELETE /reviews`

  * A user with `admin` permissions may perform any action, including creating content or fetching/modifying/deleting the content of any user.

  * Only a user with `admin` permissions may create other `admin` users, i.e. the creation of `admin` users must be accompanied by a valid JWT for a logged-in `admin` user.

All authorized endpoints should respond with an error if the logged-in user is not authorized or if no user is logged in (i.e. no JWT is provided).

## Extra credit: rate limiting

For 10 points of extra credit, you can implement a rate-limiting scheme that works as follows:

  * Requests that do not come from an authenticated user are rate-limited on a per-IP address basis.  These unauthenticated requests can be made at a rate of 5 requests per minute.

  * Requests that come from an authenticated user are rate-limited on a per-user basis.  These authenticated requests can be made at a rate of 10 requests per minute.

This rate-limiting scheme should be backed by a Redis cache that runs in a Docker container.  A full specification for the Redis cache should be added to `compose.yml` so the entire application can still be launched from scratch using Docker Compose.

## Submission

We'll be using GitHub Classroom for this assignment, and you will submit your assignment via GitHub.  Just make sure your completed files are committed and pushed by the assignment's deadline to the main branch of the GitHub repo that was created for you by GitHub Classroom.  A good way to check whether your files are safely submitted is to look at the main branch your assignment repo on the github.com website (i.e. https://github.com/osu-cs493-sp22/assignment-3-YourGitHubUsername/). If your changes show up there, you can consider your files submitted.

## Grading criteria

This assignment is worth 100 total points, broken down as follows:

  * 30 points: API allows the creation of new users via a `POST /users` endpoint

  * 25 points: API allows users to log in via a `POST /users/login` endpoint

  * 5 points: API has a `GET /users/{userId}` endpoint that returns appropriate data

  * 40 points: API endpoints are authenticated as described above

In addition, you can earn 10 points of extra credit as described above.
