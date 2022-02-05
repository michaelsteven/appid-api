[![SonarCloud](https://sonarcloud.io/images/project_badges/sonarcloud-white.svg)](https://sonarcloud.io/summary/new_code?id=michaelsteven_appid-api)

# appid-api
Stubbed out NodeJS REST API for interacting with the AppID Service. This is a work in progress.

## Design Decisions

***Cookie for Browser Storage***:  Two different ways of handling the tokens are possible with this project. They consist of returing a JWT, ***or*** setting an HttpOnly Cookie, storing the JWT in a database and returning metadata for the user. The currently coded in mechanism is the cookie/metadata method, but there is code in place to easily switch to return the JWT (to be stored however you want) should that meet your requirements.

As part of the Cookie flow we are using, upon successful login a guid is generated and set into an HttpOnly cookie as an "auth ticket". The HttpOnly cookie means that it is not accessable via javascript.  After setting the cookie as part of the response, the login method returns basic auth info metadata in the body for use by the client to store how it wants.  The JWT tokens obtained from AppID at login time and the client's IP adddress are stored in a Redis database.  The tokens are only used internally on the server, and expired from Redis after one day (when the refresh would expire). The access and refresh tokens are never sent down to the client.

When an API request requring authorization is received, the cookie is read by the server to retrieve the authTicket.  The authTicket's guid is used to look up the JWT, the client's IP address compared, and it's access token verified. If the access token from Redis is expired, the refresh token will be used to generate a new access token and refresh_token, and then the original refresh token is revoked. 

Currently, a new guid is generated and set in the HttpOnly cookie whenever the redis data changes. In a future change this will continue to be true, however the HttpOnly will also have correlation id that will not change for the entire session, and both of these will be encrypted/decrypted when issued/read.

On logout, the refresh_token is revoked, redis data is removed, and the authTicket cookie deleted.

***TSOA***: The TSOA module is used to read the annotations on the controllers at build time, and construct the swagger json.  This works in conjunction with Express. The disadvantage is that it is more difficult to use middleware like passport to authenticate the express request.  TSOA has a pattern of using a @Security annotation to handle authorization on the request so it's not a big loss.

***API Calls instead of the AppID Node SDK***: The AppID Node SDK examples rely heavily of using passport with express.  Since we are using TSOA as mentioned above, it is easier for us to make the api calls directly than leverage the SDK.

## Prerequisites
1) An IBM Cloud account
2) Provisioned instance of IBM Cloud AppID in your account
3) AppID Cloud Directory enabled
4) An "Application" defined in AppID with roles and scopes.

## Environment Variables
For running locally you can create a .env file at the root of the project with these key/value pairs.

Required:
```
IBMCLOUD_API_KEY="";
APPID_SERVICE_ENDPOINT="https://us-south.appid.cloud.ibm.com";
APPID_API_TENANT_ID="";
APPID_CLIENT_ID=""
APPID_SECRET=""
REDIS_URL=redis://:mysecretpassword@127.0.0.1:6379
```

Optional:
```
PORT=3001
```

## Running Locally
Get redis installed locally
```
brew install redis
brew services start redis
redis-cli AUTH mysecretpassword
```

Create a .env file at the root of the project with the key/value pairs above, including the PORT=3001.

```
npm install
npm run build
npm run start
```
or
```
yarn
yarn build
yarn start
```
NOTE: The "Build" step must be ran so the tsoa defined routes will work. 

Access the Swagger-UI at http://localhost:3001/docs, and launch the React-AppID-UI project found in an adjacent repository.

## Docker Image
Building:
```
docker build -t michaelsteven/appid-api:latest
```

Running:
```
docker run --env-file=.env -p 8080:8080 michaelsteven/appid-api:latest
```

## Roadmap
- Add endpoints for user management

## Licensing
Licensed under the Apache License, Version 2.0 (the "License"); you may not use these files except in compliance with the License. You may obtain a copy of the License at http://ww.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permission and limitations under the License.
