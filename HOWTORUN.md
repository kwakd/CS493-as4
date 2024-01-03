- docker compose up (NOT working somehow)


- run docker desktop

- npm install

# Running a MongoDB server (with authentication) - mongo-server will be created
- docker run -d --name mongo-server --network mongo-net -p "27017:27017" -e "MONGO_INITDB_ROOT_USERNAME=root" -e "MONGO_INITDB_ROOT_PASSWORD=team4" mongo:latest
* in case of error 1 change "MONGO_INITDB_ROOT_PASSWORD=hunter2" or to matchthe environment variable

# RabbitMQ
- docker run -d --name rabbitmq-server -p "5672:5672" -p "15672:15672" rabbitmq:3-management

- npm run initdb

- npm start (or run from VSCode)





