1a. First check to see if mongo-net is in the network:
	docker network ls
1b. If mongo-net is not exisistent go to step 2 if not go to step 3

2. This creates the network
	docker network create --driver bridge mongo-net

3. Running a MongoDB server (with authentication) - mongo-server will be created
	docker run -d --name mongo-server --network mongo-net -p "27017:27017" -e "MONGO_INITDB_ROOT_USERNAME=root" -e "MONGO_INITDB_ROOT_PASSWORD=hunter2" mongo:latest

4. Afterwards you're able to run the network by running the program, and insomnia should be working.

NOTE: in case of an authorization failure it could potentially be due to line 16 in "auth.js". I added a ":" to the "Bearer" portion due to how in insomnia it would
automatically include ":" to the header of the command. 
		const token = authHeaderParts[0] === 'Bearer:' ? authHeaderParts[1] : null;

However in the lecture slides the example was simply just:
		const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : null;

So in the case where there's an authorization failure in the client command (insomnia) just include ":" after "Bearer".