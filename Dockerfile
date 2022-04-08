
# base image
# because we are using sharp, we can't use alpine
FROM node:slim as base
ENV APP_DIR=/home/node/app
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN apt-get update && \
   apt-get -y install musl && \
   mkdir $APP_DIR && chmod +x /tini
WORKDIR $APP_DIR
RUN npm install --verbose sharp && \
    chown node:node $APP_DIR
COPY --chown=node:node package.json package-lock.json* npm-shrinkwrap.json* tsoa.json ./
ENTRYPOINT ["/tini", "--"]


# build and test
FROM base as test
RUN apt-get install -y .gyp python3 make g++ \
    && npm ci \
    && apt del .gyp
COPY --chown=node:node src ./src
RUN npm run build && \
    npm run lint && \
    npm run test

# runtime
FROM base
COPY --chown=node:node src ./src
ENV NODE_ENV production
RUN npm ci && \
    npm install -g ts-node && \
    npm run build

ENV PORT=8080
USER node
EXPOSE 8080
CMD ["npm", "start"]
