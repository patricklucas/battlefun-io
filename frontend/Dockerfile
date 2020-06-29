FROM nginx

RUN set -ex; \
  groupadd --system --gid=999 battlefun; \
  useradd --system --uid=999 --gid=battlefun bagglefun

RUN sed -i /etc/nginx/nginx.conf \
  -e '/^user\b/d' \
  -e 's#/var/run/nginx.pid#/tmp/nginx.pid#'

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./build /battlefun

USER 999:999
EXPOSE 3000