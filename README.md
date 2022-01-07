# appid-api
Stubbed out NodeJS REST API for interacting with the AppID Service. This is a work in progress.

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
SUPPORTED_LANGUAGES=en,fr_FR
FALLBACK_LANGUAGE=en
```

Optional:
```
PORT=3001
```

## Running Locally
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

## Limitations
- Error messages have not been localized yet

## Licensing
Licensed under the Apache License, Version 2.0 (the "License"); you may not use these files except in compliance with the License. You may obtain a copy of the License at http://ww.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permission and limitations under the License.
