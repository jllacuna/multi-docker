# Best practice is to lock in specific version
FROM node:14.15.1-alpine3.10

ENV NODE_PATH /data/node_modules
# Needed for react
ENV PATH /data/node_modules/.bin:$PATH
ENV APP_PATH /data/app

WORKDIR $APP_PATH

# Cache node modules in /data/node_modules
COPY package*.json /data/

RUN cd /data && NODE_ENV=production npm install

COPY . .
RUN rm -fr node_modules build
RUN npm run build

FROM nginx:1.19.5-alpine

EXPOSE 3000

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=0 /data/app/build /usr/share/nginx/html
