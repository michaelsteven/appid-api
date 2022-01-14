# appid-api
Stubbed out NodeJS REST API for interacting with the AppID Service. This is a work in progress.

## Design Decisions

***Cookie Authetication***:  Two different ways of handling the tokens are possible with this project. They involve returing a JWT or setting an HttpOnly Cookie and storing the JWT in a database. The HttpOnly cookie means it can't be read by javascript. The currently coded in mechanism is cookie authentication, however there is code in place for JWT based authentication should that fit your requirements.

As part of the Cookie Authentication flow, upon successful login a guid is generated and set into an HttpOnly cookie as an authTicket.  The login method also returns an identity token and other metadata for use in the client to use since the HttpOnly cookie cannot be read by javascript.  The JWT token obtained at login time and the client's IP adddress is stored in a Redis database.  

When an API request requring authorization is received, the cookie is read on the server to retrieve the authTicket.  The authTicket's guid is used to look up the JWT, the client's IP address compared, and it's access token verified. If the access token from Redis is expired, the refresh token will be used to generate a new access token.  The access and refresh tokens are never shared with the client, and only used internally on the server, and expired from Redis after one day.

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
- Revoke the refresh token after it's beem used once
- Add logout endpoint

## Licensing
Licensed under the Apache License, Version 2.0 (the "License"); you may not use these files except in compliance with the License. You may obtain a copy of the License at http://ww.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permission and limitations under the License.
