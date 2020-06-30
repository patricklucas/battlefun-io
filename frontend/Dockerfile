FROM node:12 as frontend-build
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY package.json yarn.lock tsconfig.json ./
RUN yarn
COPY src src
COPY public public
RUN yarn build


FROM nginx
RUN set -ex; \
  groupadd --system --gid=999 battlefun; \
  useradd --system --uid=999 --gid=battlefun battlefun

RUN sed -i /etc/nginx/nginx.conf \
  -e '/^user\b/d' \
  -e 's#/var/run/nginx.pid#/tmp/nginx.pid#'

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /home/node/app/build /battlefun

USER 999:999
EXPOSE 3000