# base image
FROM node:lts-alpine as base
ENV APP_DIR=/home/node/app
RUN apk add --no-cache tini && \
    mkdir $APP_DIR && chown node:node $APP_DIR
WORKDIR $APP_DIR    
ENTRYPOINT ["/sbin/tini", "--"]
COPY --chown=node:node package.json package-lock.json* npm-shrinkwrap.json* tsoa.json ./

# build and test
FROM base as test
RUN apk add --no-cache --virtual .gyp python3 make g++ \
  && npm ci \
  && apk del .gyp
COPY --chown=node:node src ./src
RUN npm run build && \
    npm run lint && \
    npm run test

# runtime
FROM base
COPY --chown=node:node src ./src
ENV NODE_ENV production
RUN npm ci --ignore-scripts && \
    npm install -g ts-node && \
    npm run build

ENV PORT=8080
USER node
EXPOSE 8080
CMD ["npm", "start"]