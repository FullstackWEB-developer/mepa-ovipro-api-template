## DB

Add Database related files here
folders:
|Folder name|Description|
| ------------ | ------------ |
|db/java/src/main/resources/db/migration|Migration SQL files|
|db/java/src/main/resources/db/manual-migration|Manual migration files example testing sql files|

----

Example of migration SQL file i.e. `V001__base.sql` (check [naming convention](https://flywaydb.org/documentation/concepts/migrations#naming))
```sql
SET client_encoding = 'UTF8';

CREATE SCHEMA if not exists realty authorization ovipro;
ALTER SCHEMA realty OWNER TO ovipro;
...
CREATE TABLE realty.enum_realty_status_code (
    enum_value common.enumvalue PRIMARY KEY,
    description common.enumdescription
);
ALTER TABLE realty.enum_realty_status_code OWNER TO ovipro;
```
----

Example of manual-migration SQL file i.e. `test-data.sql`
```sql
insert into realty.realty values ('6f0cabd4-f17a-4c43-a87a-d1e8e84355d3', 'PLOT_REALTY', 'DRAFT', null);
insert into realty.plot values ('6f0cabd4-f17a-4c43-a87a-d1e8e84355d3', '6f0cabd4-f17a-4c43-a87a-d1e8e84355d3', now(), 99, 'EUR');
```

We use [FlyWay](https://flywaydb.org) to create and migrate DB. See more information from [flyway documentation](https://flywaydb.org/documentation/).

Information about [TypeORM](https://typeorm.io/#/) find options can be found [here](https://typeorm.io/#/find-options)