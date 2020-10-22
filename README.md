<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## DataBase Issue

If migrations fails with `function uuid_generate_v4() does not exist` you need to add _uuid-ossp_ extention by executing SQL query on database:

`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`.

This should solve the problem.

> [https://github.com/typeorm/typeorm/issues/3009#issuecomment-638503671](https://github.com/typeorm/typeorm/issues/3009#issuecomment-638503671)