<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Migrations/Database Issues

Create Migration

```
typeorm migration:create -n MigrationName
```

### Error run migration

If migrations fails with `function uuid_generate_v4() does not exist` you need to add _uuid-ossp_ extention by executing SQL query on database:

`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`.

This should solve the problem.

> [https://github.com/typeorm/typeorm/issues/3009#issuecomment-638503671](https://github.com/typeorm/typeorm/issues/3009#issuecomment-638503671)

### If typeorm doesn't see migrations folder

> Actually after adding `migrations` script to _package.json_ and running it with `nmp/yarn run migrations` this problem shouldn't arise

[https://stackoverflow.com/questions/62821983/typeorm-no-migrations-pending-when-attempting-to-run-migrations-manually](https://stackoverflow.com/questions/62821983/typeorm-no-migrations-pending-when-attempting-to-run-migrations-manually)

The config above mentions migrations to be found in js files:

```js
migrations: [__dirname + '/Migrations/**/*.js'],
```

However from the folder structure its clear that migrations are written in ts files not js.

To run migrations from ts follow the officially recommended way described here:

[https://github.com/typeorm/typeorm/blob/master/docs/using-cli.md#if-entities-files-are-in-typescript](https://github.com/typeorm/typeorm/blob/master/docs/using-cli.md#if-entities-files-are-in-typescript)

Also in that case don't forget to update the migrations blob to be ts:

```js
migrations: [__dirname + '/Migrations/**/*.ts'],
```

If you want to run the migrations from js files you will have to provide the location to be from dist folder after the ts files have been compiled to js form.
