FROM postgres:10

ARG PG_LOCALE=fi_FI

RUN locale-gen ${PG_LOCALE}.UTF-8

RUN localedef -i ${PG_LOCALE} -c -f UTF-8 -A /usr/share/locale/locale.alias ${PG_LOCALE}.UTF-8
ENV LANG ${PG_LOCALE}.UTF-8

# To extend with custom setup scripts that are run automatically:
# COPY src/main/docker/init/001* /docker-entrypoint-initdb.d/
# COPY src/main/docker/init/002* /docker-entrypoint-initdb.d/

# To extend with custom setup scripts that may be run manually:
# RUN mkdir -p /tmp/migrate
# COPY src/main/docker/init/003* /tmp/migrate/
# COPY src/main/resources/db/manual-migration/* /tmp/migrate/
# COPY src/main/resources/db/migration/* /tmp/migrate/

ENTRYPOINT ["docker-entrypoint.sh"]

EXPOSE 5432
CMD ["postgres"]
