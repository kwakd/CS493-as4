# Assignment 4

**Assignment due at 11:59pm on Tuesday 5/31/2022**<br/>
**Demo due by 5:00pm on Friday 6/10/2022**

The goal of this assignment is to incorporate file storage into our API and to start using RabbitMQ to perform some basic offline data enrichment.  There are a few parts to this assignment, described below.

You are provided some starter code in this repository that uses MongoDB as a backing to implement a reduced subset of the businesses API we've been working with all term.  The starter code contains the following components:
  * An API server is implemented in `server.js`.
  * Individual API routes are modularized within the `api/` directory.
  * Sequelize models are implemented in the `models/` directory.
  * A script in `initDb.js` that populates the database with initial data from the `data/` directory.  You can run this script by running `npm run initdb`.
  * A Docker Compose specification in `compose.yml`.  This specification will launch the entire application from scratch, including populating the database using `initDb.js`.  Note that if you use this specification to launch the app, the `db-init` service and the `api` service will fail with an error (`ECONNREFUSED`) and be restarted continually until the database service is running and the database server itself is ready to accept connections.  This may take several seconds.  Note that the Docker Compose specification relies on some environment variables being set in the included `.env` file.

Feel free to use this code as your starting point for this assignment.  You may also use your own solution to assignment 2 and/or assignment 3 as your starting point if you like.

## 1. Support photo file uploads

Your first task for the assignment is to modify the `POST /photos` endpoint to support actual photo uploads.  Specifically, you should update this endpoint to expect a multipart form-data body that contains a `file` field in addition to the fields currently supported by the endpoint (`businessId` and `caption`).  In requests to this endpoint, the `file` field should specifically contain raw binary data for an image file.  The endpoint should accept images in either the JPEG (`image/jpeg`) or PNG (`image/png`) format.  Files in any other format should result in the API server returning an error response.

## 2. Store uploaded photo data in GridFS

Once your API successfully accepts image file uploads to the `POST /photos` endpoint, you should modify the API to store those image files in GridFS in the MongoDB database that's already powering the API.  Photo metadata corresponding the image files (i.e. `businessId` and `caption`) should be stored alongside the files themselves.

Once your API is storing photo data in GridFS, it should no longer use the `photos` MongoDB collection in which it currently stores photo metadata.  In other words, all data related to the `photos` collection should be stored in GridFS.  This will require you to update other API endpoints to work with the data stored in GridFS, including:
  * `GET /businesses/{id}`
  * `GET /photos/{id}`

Once a photo is saved in GridFS, you should make it available for download via a URL with the following format, where `{id}` represents the ID of the photo and the file extension (`.jpg` or `.png`) is based on the format of the uploaded image:
```
/media/photos/{id}.jpg
```
OR
```
/media/photos/{id}.png
```
Make sure to include this URL in responses from the `GET /photos/{id}` endpoint, so clients will know how to download the image.

## 3. Add an offline thumbnail generation process

Your final task in the assignment is to add an offline data enrichment process that generates a 100x100 thumbnail version of every photo uploaded to the API.  This offline data enrichment process should be facilitated using a RabbitMQ queue.  This task can be broken into a few separate steps:

  * **Start a RabbitMQ daemon running in a Docker container.**  You can do this with the [official RabbitMQ Docker image](https://hub.docker.com/_/rabbitmq/).

  * **Turn your API server into a RabbitMQ producer.**  Specifically, each time a new photo is uploaded and stored into your GridFS database, your API server should add a new task to a RabbitMQ queue corresponding to the new photo that was just uploaded.  The task should contain information (e.g. the ID of the just-uploaded photo) that will eventually allow RabbitMQ consumers (which you'll write) to fetch the original image file out of GridFS.

  * **Implement a RabbitMQ consumer that generates thumbnail images.**  Your consumer should specifically use information from each RabbitMQ message it processes to fetch a photo file from GridFS and generate a resized and/or cropped thumbnail version of that photo that is 100px wide and 100px high.  All thumbnail images should be in JPEG format (i.e. `image/jpeg`).

    Thumbnail images should be stored in GridFS in a *different* bucket than the one where original images are stored (e.g. store original photos in a bucket called `photos` and thumbnail images in a bucket called `thumbs`).

    There are multiple packages on NPM you can use to actually perform the image resizing itself, including [Jimp](https://www.npmjs.com/package/jimp) and [sharp](https://www.npmjs.com/package/sharp).  Each of these has a straightforward interface.  However, you're free to use whatever tool you like to perform the resizing.

  * **Create an association between the original photo and its thumbnail.**  After your RabbitMQ consumer generates a thumbnail image and stores it in GridFS, you'll need to represent the one-to-one association between original and thumbnail so you can "find" the thumbnail from the original image.  The easiest way to do this is, once the thumbnail is generated and stored in GridFS, to store the database ID of the thumbnail image within the metatata for the *original* photo in the database.  For example, you could add a `thumbId` field to the original photo's metatata:
    ```
    {
      "businessId": ObjectId("..."),
      "caption": "...",
      "thumbId": ObjectId("...")
    }
    ```

    Doing this will allow you to easily access the thumbnail image once you've fetched the metadata for the original photo.

  * **Make the thumbnails available for download.**  Finally, once thumbnails are generated and linked to their originals, you should make it possible for clients to download them.  Thumbnails should be downloadable through a URL with the following format, where `{id}` is the ID of the *original* photo corresponding to the thumbnail:
    ```
    /media/thumbs/{id}.jpg
    ```
    To facilitate downloading a photo's thumbnail, the thumbnail's URL should be included in the response from the `GET /photos/{id}` endpoint.

    Again, it's important that the same ID should be used to download both the original photo and its thumbnail.  This should be the same ID that's used to fetch photo information from the `GET /photos/{id}` endpoint.  For example the following requests should all fetch a different kind of information related to the original photo with ID "5ce48a2ddf60d448aed2b1c1" (metadata, original photo bytes, and thumbnail photo bytes):
    ```
    GET /photos/5ce48a2ddf60d448aed2b1c1
    GET /media/photos/5ce48a2ddf60d448aed2b1c1.jpg
    GET /media/thumbs/5ce48a2ddf60d448aed2b1c1.jpg
    ```

When your consumer is working correctly, you should be able to launch one or more instances of the consumer running alongside your API server, the RabbitMQ daemon, and the MongoDB server, and you should be able to see the consumers processing photos as they're uploaded.  Note that only the RabbitMQ daemon and the MongoDB server need to be run within Docker containers.  The API server and RabbitMQ consumer(s) can run either in Docker or directly on your host machine.

## Submission

We'll be using GitHub Classroom for this assignment, and you will submit your assignment via GitHub.  Just make sure your completed files are committed and pushed by the assignment's deadline to the master branch of the GitHub repo that was created for you by GitHub Classroom.  A good way to check whether your files are safely submitted is to look at the master branch your assignment repo on the github.com website (i.e. https://github.com/osu-cs493-sp22/assignment-4-YourGitHubUsername/). If your changes show up there, you can consider your files submitted.

## Grading criteria

This assignment is worth 100 total points, broken down as follows:

  * 20 points: API supports image uploads

  * 20 points: Uploaded images are stored in GridFS

  * 20 points: API uses an offline process powered by RabbitMQ to generate thumbnail images

  * 20 points: All thumbnail images are correctly stored in GridFS and "linked" to their corresponding original photo in the datavase

  * 20 points: All photos and thumbnails are available for download using the URL formats described above
