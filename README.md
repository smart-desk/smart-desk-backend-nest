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

[https://stackoverflow.com/questions/62821983/typeorm-no-migrations-pending-when-attempting-to-run-migrations-manually](https://stackoverflow.com/questions/62821983/typeorm-no-migrations-pending-when-attempting-to-run-migrations-manually)
