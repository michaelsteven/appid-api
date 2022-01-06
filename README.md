# appid-api
Stubbed out NodeJS REST API for interacting with the AppID Service. This is a work in progress.

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
PORT=8080
```

## Docker Image
Building:
```
docker build -t michaelsteven/appid-api:latest
```

Running:
```
docker run --env-file=.env -p 8080:8080 michaelsteven/appid-api:latest
```

## Licensing
Licensed under the Apache License, Version 2.0 (the "License"); you may not use these files except in compliance with the License. You may obtain a copy of the License at http://ww.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permission and limitations under the License.
