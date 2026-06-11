# Changelog

## [0.5.18](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.17...agent@0.5.18) (2026-06-11)


### Miscellaneous

* migrate to @typescript/native-preview ([#3583](https://github.com/lies-exposed/lies.exposed/issues/3583)) ([21ec836](https://github.com/lies-exposed/lies.exposed/commit/21ec8365943bd5e8b99a858039799d4eb6985b22))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.18
    * @liexp/core bumped to 0.5.18
    * @liexp/io bumped to 0.5.18
    * @liexp/shared bumped to 0.5.18
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.18
    * @liexp/test bumped to 0.5.18

## [0.5.17](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.16...agent@0.5.17) (2026-05-13)


### Miscellaneous

* **agent:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.17
    * @liexp/core bumped to 0.5.17
    * @liexp/io bumped to 0.5.17
    * @liexp/shared bumped to 0.5.17
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.17
    * @liexp/test bumped to 0.5.17

## [0.5.16](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.15...agent@0.5.16) (2026-05-07)


### Bug Fixes

* **agent:** read models from LocalAI api ([#3622](https://github.com/lies-exposed/lies.exposed/issues/3622)) ([a7f0e69](https://github.com/lies-exposed/lies.exposed/commit/a7f0e694dd14920eaace6225f13f39608088070d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.16
    * @liexp/core bumped to 0.5.16
    * @liexp/io bumped to 0.5.16
    * @liexp/shared bumped to 0.5.16
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.16
    * @liexp/test bumped to 0.5.16

## [0.5.15](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.14...agent@0.5.15) (2026-04-30)


### Miscellaneous

* **agent:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.15
    * @liexp/core bumped to 0.5.15
    * @liexp/io bumped to 0.5.15
    * @liexp/shared bumped to 0.5.15
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.15
    * @liexp/test bumped to 0.5.15

## [0.5.14](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.13...agent@0.5.14) (2026-04-30)


### Miscellaneous

* bump eslint to 10.2.1, prettier to 3.8.3 and typescript-eslint to 8.59.0 ([#3576](https://github.com/lies-exposed/lies.exposed/issues/3576)) ([4f39ac5](https://github.com/lies-exposed/lies.exposed/commit/4f39ac53113d22fef6c3076d8e659f94e4b2c605))
* migrate to typescript 6 ([#3599](https://github.com/lies-exposed/lies.exposed/issues/3599)) ([9391d22](https://github.com/lies-exposed/lies.exposed/commit/9391d225cda12ada602cf80b4b7592150cff15ac))
* remove localai service ([#3560](https://github.com/lies-exposed/lies.exposed/issues/3560)) ([bfa4bae](https://github.com/lies-exposed/lies.exposed/commit/bfa4bae9cbcd4f0ed58a4405687b4e8ff2355d63))
* typescript v6 compatibility steps ([#3555](https://github.com/lies-exposed/lies.exposed/issues/3555)) ([d52a4e8](https://github.com/lies-exposed/lies.exposed/commit/d52a4e8080f1b33aee2cc74f26c286c790a78e3d))
* update pnpm from 10.32.1 to 10.33.0 ([#3534](https://github.com/lies-exposed/lies.exposed/issues/3534)) ([c7b1438](https://github.com/lies-exposed/lies.exposed/commit/c7b1438a4045d8ba222bec8a1103f96986b00817))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.14
    * @liexp/core bumped to 0.5.14
    * @liexp/io bumped to 0.5.14
    * @liexp/shared bumped to 0.5.14
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.14
    * @liexp/test bumped to 0.5.14

## [0.5.13](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.12...agent@0.5.13) (2026-04-13)


### Bug Fixes

* **admin:** chat compact conversation and settings from local storage ([#3469](https://github.com/lies-exposed/lies.exposed/issues/3469)) ([2a44f04](https://github.com/lies-exposed/lies.exposed/commit/2a44f0480a11e3893824f2214f2fa7d7356343a7))
* **agent:** added cli tools to read the docs ([#3508](https://github.com/lies-exposed/lies.exposed/issues/3508)) ([b2534df](https://github.com/lies-exposed/lies.exposed/commit/b2534df339b365008ef40cfe65dac822e6cf71f5))
* **agent:** added qwen3.5-9b for openai provider ([#3468](https://github.com/lies-exposed/lies.exposed/issues/3468)) ([1cc8f4c](https://github.com/lies-exposed/lies.exposed/commit/1cc8f4c67b98d4e6a23c6e0a37c51af2aeff999f))
* **agent:** set proper User-Agent for Wikipedia API calls ([#3471](https://github.com/lies-exposed/lies.exposed/issues/3471)) ([061c143](https://github.com/lies-exposed/lies.exposed/commit/061c143de6949d43f684b70e0d143153a2f97583))
* **agent:** tool call parsing ([#3513](https://github.com/lies-exposed/lies.exposed/issues/3513)) ([9737d4e](https://github.com/lies-exposed/lies.exposed/commit/9737d4ee6fc5e5020f81bc2a1e24f79e8725b0dd))
* **agent:** use specific env for api baseUrl and MCP route ([#3506](https://github.com/lies-exposed/lies.exposed/issues/3506)) ([bcdb6bc](https://github.com/lies-exposed/lies.exposed/commit/bcdb6bc3e56e12a4c37ca62e1ad882b8b70f1a11))


### Miscellaneous

* **agent:** setup test eval pipeline with record and replay ([#3511](https://github.com/lies-exposed/lies.exposed/issues/3511)) ([616b444](https://github.com/lies-exposed/lies.exposed/commit/616b444f47504bd67fc1dab19f18074c4d504f3b))
* removed old models for localai ([#3510](https://github.com/lies-exposed/lies.exposed/issues/3510)) ([57f3898](https://github.com/lies-exposed/lies.exposed/commit/57f38985b98da8d307ca593058d50e31568a127d))
* **test:** switch unit tests to vmForks pool with groupOrder fixes ([#3505](https://github.com/lies-exposed/lies.exposed/issues/3505)) ([30709af](https://github.com/lies-exposed/lies.exposed/commit/30709af89801c36ebb004209511101c7f10a7fa4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.13
    * @liexp/core bumped to 0.5.13
    * @liexp/io bumped to 0.5.13
    * @liexp/shared bumped to 0.5.13
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.13
    * @liexp/test bumped to 0.5.13

## [0.5.12](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.11...agent@0.5.12) (2026-03-20)


### Miscellaneous

* **agent:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.12
    * @liexp/core bumped to 0.5.12
    * @liexp/io bumped to 0.5.12
    * @liexp/shared bumped to 0.5.12
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.12
    * @liexp/test bumped to 0.5.12

## [0.5.11](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.10...agent@0.5.11) (2026-03-18)


### Miscellaneous

* bump pnpm to 10.32.1 ([#3439](https://github.com/lies-exposed/lies.exposed/issues/3439)) ([7a15bc4](https://github.com/lies-exposed/lies.exposed/commit/7a15bc435542fe86f4c0ada9e52b43765e19bde7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.11
    * @liexp/core bumped to 0.5.11
    * @liexp/io bumped to 0.5.11
    * @liexp/shared bumped to 0.5.11
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.11
    * @liexp/test bumped to 0.5.11

## [0.5.10](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.9...agent@0.5.10) (2026-03-16)


### Bug Fixes

* integrate Sentry SDK for api, agent, worker, admin and web services ([#3410](https://github.com/lies-exposed/lies.exposed/issues/3410)) ([6d1ac72](https://github.com/lies-exposed/lies.exposed/commit/6d1ac723f5051878a90cb15dea7f3f3108e149db))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.10
    * @liexp/core bumped to 0.5.10
    * @liexp/io bumped to 0.5.10
    * @liexp/shared bumped to 0.5.10
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.10
    * @liexp/test bumped to 0.5.10

## [0.5.9](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.8...agent@0.5.9) (2026-03-15)


### Miscellaneous

* **agent:** rename tool find_platform_data → liexp_cli ([#3404](https://github.com/lies-exposed/lies.exposed/issues/3404)) ([f37b0aa](https://github.com/lies-exposed/lies.exposed/commit/f37b0aa7548d6bf515d12f655d6d6fd5af42dbbf))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.9
    * @liexp/core bumped to 0.5.9
    * @liexp/io bumped to 0.5.9
    * @liexp/shared bumped to 0.5.9
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.9
    * @liexp/test bumped to 0.5.9

## [0.5.8](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.7...agent@0.5.8) (2026-03-15)


### Miscellaneous

* **agent:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.8
    * @liexp/core bumped to 0.5.8
    * @liexp/io bumped to 0.5.8
    * @liexp/shared bumped to 0.5.8
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.8
    * @liexp/test bumped to 0.5.8

## [0.5.7](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...agent@0.5.7) (2026-03-15)


### Bug Fixes

* **agent:** partial cli edit body ([#3392](https://github.com/lies-exposed/lies.exposed/issues/3392)) ([12efac3](https://github.com/lies-exposed/lies.exposed/commit/12efac3dac9c2dac94ae27b8ec823aa9adca0ef6))
* **api:** drop old 'body' columns and renamed current 'body2' to 'body' ([#3389](https://github.com/lies-exposed/lies.exposed/issues/3389)) ([9ae4881](https://github.com/lies-exposed/lies.exposed/commit/9ae4881c4ca5fdbc30ac3d77568f59d5c001b1ee))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.7
    * @liexp/core bumped to 0.5.7
    * @liexp/io bumped to 0.5.7
    * @liexp/shared bumped to 0.5.7
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.7
    * @liexp/test bumped to 0.5.7

## [0.5.6](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.5...agent@0.5.6) (2026-03-11)


### Bug Fixes

* **agent:** cli events sub-command ([#3370](https://github.com/lies-exposed/lies.exposed/issues/3370)) ([c615dc8](https://github.com/lies-exposed/lies.exposed/commit/c615dc8dbcbfde9cb8671f1c763eceda01472bb2))
* **agent:** improve CLI error visibility and IOError formatting ([#3366](https://github.com/lies-exposed/lies.exposed/issues/3366)) ([98b0cf4](https://github.com/lies-exposed/lies.exposed/commit/98b0cf430403f39d80216edb78c913999f49a2a9))
* **agent:** include RESEARCHER.md in Docker image ([#3359](https://github.com/lies-exposed/lies.exposed/issues/3359)) ([f8469df](https://github.com/lies-exposed/lies.exposed/commit/f8469df06c14b63c65f3fa795cc562582f0f3875))
* **agent:** increase chat stream recursion limit from 25 to 50 ([#3363](https://github.com/lies-exposed/lies.exposed/issues/3363)) ([4cf3cb2](https://github.com/lies-exposed/lies.exposed/commit/4cf3cb2d8a479c9949cabdb04d442676c2553e07))
* **io:** make url optional in EditLink schema ([#3362](https://github.com/lies-exposed/lies.exposed/issues/3362)) ([2fae15a](https://github.com/lies-exposed/lies.exposed/commit/2fae15a6d96945a10ef9654f3bdff5672293339f))
* **shared:** use proper common codecs for CLI schemas ([#3371](https://github.com/lies-exposed/lies.exposed/issues/3371)) ([e237ee5](https://github.com/lies-exposed/lies.exposed/commit/e237ee5d6acae99f49117459e4f23ce63ce913d0))
* **shared:** use proper UUID codec for relation ids in MCP schemas ([#3369](https://github.com/lies-exposed/lies.exposed/issues/3369)) ([e5f02c6](https://github.com/lies-exposed/lies.exposed/commit/e5f02c64de8c23611ba9269d66a34ecd3c3779a4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.6
    * @liexp/core bumped to 0.5.6
    * @liexp/io bumped to 0.5.6
    * @liexp/shared bumped to 0.5.6
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.6
    * @liexp/test bumped to 0.5.6

## [0.5.5](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.4...agent@0.5.5) (2026-03-08)


### Bug Fixes

* **agent:** add story CLI command group with spec tests ([#3351](https://github.com/lies-exposed/lies.exposed/issues/3351)) ([03aae78](https://github.com/lies-exposed/lies.exposed/commit/03aae782b20021988a19384bc0cd609c7e288e56))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.5
    * @liexp/core bumped to 0.5.5
    * @liexp/io bumped to 0.5.5
    * @liexp/shared bumped to 0.5.5
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.5
    * @liexp/test bumped to 0.5.5

## [0.5.4](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.3...agent@0.5.4) (2026-03-07)


### Bug Fixes

* **agent:** agent supervisor ([#3344](https://github.com/lies-exposed/lies.exposed/issues/3344)) ([723675e](https://github.com/lies-exposed/lies.exposed/commit/723675e1f5b2e0c5474c40944239cf6b8b9cb9b7))
* **agent:** provide cli tools to access platform resources ([#3332](https://github.com/lies-exposed/lies.exposed/issues/3332)) ([6ba161f](https://github.com/lies-exposed/lies.exposed/commit/6ba161fcc9dc132fdedc9d3b81a8b3432325dfc6))
* **core:** fix dotenv v17 ESM resolution in Vite config bundler ([#3327](https://github.com/lies-exposed/lies.exposed/issues/3327)) ([84843e1](https://github.com/lies-exposed/lies.exposed/commit/84843e112e774248d294a2afd85704258bd39d51))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.4
    * @liexp/core bumped to 0.5.4
    * @liexp/io bumped to 0.5.4
    * @liexp/shared bumped to 0.5.4
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.4
    * @liexp/test bumped to 0.5.4

## [0.5.3](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.2...agent@0.5.3) (2026-03-04)


### Miscellaneous

* **agent:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.3
    * @liexp/core bumped to 0.5.3
    * @liexp/io bumped to 0.5.3
    * @liexp/shared bumped to 0.5.3
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.3

## [0.5.2](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.1...agent@0.5.2) (2026-03-01)


### Miscellaneous

* **agent:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.2
    * @liexp/core bumped to 0.5.2
    * @liexp/io bumped to 0.5.2
    * @liexp/shared bumped to 0.5.2
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.2

## [0.5.1](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.0...agent@0.5.1) (2026-02-28)


### Miscellaneous

* **agent:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.1
    * @liexp/core bumped to 0.5.1
    * @liexp/io bumped to 0.5.1
    * @liexp/shared bumped to 0.5.1
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.1

## [0.5.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.4.4...agent@0.5.0) (2026-02-28)


### Miscellaneous

* **agent:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.0
    * @liexp/core bumped to 0.5.0
    * @liexp/io bumped to 0.5.0
    * @liexp/shared bumped to 0.5.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.0

## [0.4.4](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.4.3...agent@0.4.4) (2026-02-24)


### Miscellaneous

* **agent:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.4.4
    * @liexp/core bumped to 0.4.4
    * @liexp/io bumped to 0.4.4
    * @liexp/shared bumped to 0.4.4
  * devDependencies
    * @liexp/eslint-config bumped to 0.4.4

## [0.4.3](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.4.2...agent@0.4.3) (2026-02-22)


### Bug Fixes

* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))


### Miscellaneous

* **workspace:** disable type generation for services build ([#3224](https://github.com/lies-exposed/lies.exposed/issues/3224)) ([4dc573f](https://github.com/lies-exposed/lies.exposed/commit/4dc573f90a5963d2784ecfc460647ad260828194))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.4.3
    * @liexp/core bumped to 0.4.3
    * @liexp/io bumped to 0.4.3
    * @liexp/shared bumped to 0.4.3
  * devDependencies
    * @liexp/eslint-config bumped to 0.4.3

## [0.4.2](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.4.1...agent@0.4.2) (2026-02-19)


### Bug Fixes

* **api:** actor tools schema 'memberId' and 'nationalities' possibly undefined ([#3209](https://github.com/lies-exposed/lies.exposed/issues/3209)) ([03dd92a](https://github.com/lies-exposed/lies.exposed/commit/03dd92ae28f31a17248feba550ca6365eae68083))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.4.2
    * @liexp/core bumped to 0.4.2
    * @liexp/io bumped to 0.4.2
    * @liexp/shared bumped to 0.4.2
  * devDependencies
    * @liexp/eslint-config bumped to 0.4.2

## [0.4.1](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.4.0...agent@0.4.1) (2026-02-18)


### Bug Fixes

* **agent:** multiprovider AI agent configuration ([#3206](https://github.com/lies-exposed/lies.exposed/issues/3206)) ([06920b4](https://github.com/lies-exposed/lies.exposed/commit/06920b4bf246b7c22f5c5acc9f9cd8b4909a1e13))
* chat providers and prompts ([#3208](https://github.com/lies-exposed/lies.exposed/issues/3208)) ([db9dbde](https://github.com/lies-exposed/lies.exposed/commit/db9dbdee889a3de0f8a358cb42d3090a305de07b))


### Miscellaneous

* errors refactor ([#3207](https://github.com/lies-exposed/lies.exposed/issues/3207)) ([ed74cee](https://github.com/lies-exposed/lies.exposed/commit/ed74ceea7c12764221f40d6f30f76c3a55e20373))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.4.1
    * @liexp/core bumped to 0.4.1
    * @liexp/io bumped to 0.4.1
    * @liexp/shared bumped to 0.4.1
  * devDependencies
    * @liexp/eslint-config bumped to 0.4.1

## [0.4.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.3.0...agent@0.4.0) (2026-02-15)


### Features

* **agent:** retry MCP initializeConnections on startup failure ([#3189](https://github.com/lies-exposed/lies.exposed/issues/3189)) ([23e1510](https://github.com/lies-exposed/lies.exposed/commit/23e151065c2b51034ea4d9df3bca058685ca09af))


### Bug Fixes

* mcp tools ([#3188](https://github.com/lies-exposed/lies.exposed/issues/3188)) ([3b9a8ce](https://github.com/lies-exposed/lies.exposed/commit/3b9a8ceefe7ee7510820d039a3fea4de29f58cbd))


### Miscellaneous

* increase agent chat timeout to 3min ([#3195](https://github.com/lies-exposed/lies.exposed/issues/3195)) ([0bf8c1a](https://github.com/lies-exposed/lies.exposed/commit/0bf8c1ade90c17654a9d4d8fd0229439287102f2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.4.0
    * @liexp/core bumped to 0.4.0
    * @liexp/io bumped to 0.4.0
    * @liexp/shared bumped to 0.4.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.4.0

## [0.3.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.2.5...agent@0.3.0) (2026-02-11)


### Miscellaneous

* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.3.0
    * @liexp/core bumped to 0.3.0
    * @liexp/io bumped to 0.3.0
    * @liexp/shared bumped to 0.3.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.3.0

## [0.2.5](https://github.com/lies-exposed/lies.exposed/compare/agent@0.1.12...agent@0.2.5) (2026-01-30)


### Miscellaneous

* **api:** removed puppeteer and puppeteer-extra deps and dead code ([#3149](https://github.com/lies-exposed/lies.exposed/issues/3149)) ([1a6ddab](https://github.com/lies-exposed/lies.exposed/commit/1a6ddabb6a28d42727b94954035f197b4f3646e5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.2.5
    * @liexp/core bumped to 0.2.5
    * @liexp/io bumped to 0.2.5
    * @liexp/shared bumped to 0.2.5
  * devDependencies
    * @liexp/eslint-config bumped to 0.2.5

## [0.1.12](https://github.com/lies-exposed/lies.exposed/compare/agent@0.1.11...agent@0.1.12) (2026-01-28)


### Miscellaneous

* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.12
    * @liexp/core bumped to 0.1.6
    * @liexp/io bumped to 0.2.4
    * @liexp/shared bumped to 0.2.4

## [0.1.11](https://github.com/lies-exposed/lies.exposed/compare/agent@0.1.10...agent@0.1.11) (2026-01-24)


### Bug Fixes

* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.11
    * @liexp/core bumped to 0.1.5
    * @liexp/io bumped to 0.2.3
    * @liexp/shared bumped to 0.2.3
  * devDependencies
    * @liexp/eslint-config bumped to 0.1.0

## [0.1.10](https://github.com/lies-exposed/lies.exposed/compare/agent@0.1.9...agent@0.1.10) (2026-01-23)


### Bug Fixes

* **agent:** support Anthropic AI provider ([#3115](https://github.com/lies-exposed/lies.exposed/issues/3115)) ([2952200](https://github.com/lies-exposed/lies.exposed/commit/29522002dc161e57dbac13af0e9c317a839cb4c5))


### Miscellaneous

* **agent:** added e2e test for chat stream endpoint ([#3109](https://github.com/lies-exposed/lies.exposed/issues/3109)) ([ec1ea38](https://github.com/lies-exposed/lies.exposed/commit/ec1ea3807265b573f4677733bbdf0ebf022c9ba5))
* **agent:** use [@ts-endpoint](https://github.com/ts-endpoint) stream endpoint definition ([#3112](https://github.com/lies-exposed/lies.exposed/issues/3112)) ([52c265d](https://github.com/lies-exposed/lies.exposed/commit/52c265d95ac581d7f61a17da19ed9cdf71833ae7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.10
    * @liexp/io bumped to 0.2.2
    * @liexp/shared bumped to 0.2.2

## [0.1.9](https://github.com/lies-exposed/lies.exposed/compare/agent@0.1.8...agent@0.1.9) (2026-01-21)


### Miscellaneous

* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.9
    * @liexp/io bumped to 0.2.1
    * @liexp/shared bumped to 0.2.1

## [0.1.8](https://github.com/lies-exposed/lies.exposed/compare/agent@0.1.7...agent@0.1.8) (2026-01-19)


### Bug Fixes

* **shared:** renamed Endpoints for agent to AgentEndpoints ([#3063](https://github.com/lies-exposed/lies.exposed/issues/3063)) ([5366305](https://github.com/lies-exposed/lies.exposed/commit/53663056c564a92b4ca01805f61edd849b000a26))


### Miscellaneous

* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.8
    * @liexp/core bumped to 0.1.4
    * @liexp/shared bumped to 0.2.0

## [0.1.7](https://github.com/lies-exposed/lies.exposed/compare/agent@0.1.6...agent@0.1.7) (2026-01-11)


### Bug Fixes

* **agent:** provide searchWebTools in agent service ([#3045](https://github.com/lies-exposed/lies.exposed/issues/3045)) ([1191a71](https://github.com/lies-exposed/lies.exposed/commit/1191a713da3eb66fa59f4ce275fc7f6e88a47693))
* **backend:** added brave provider for web searches ([#3044](https://github.com/lies-exposed/lies.exposed/issues/3044)) ([e1723b5](https://github.com/lies-exposed/lies.exposed/commit/e1723b5869cc4745cb885f0b3cab463863adc0f4))


### Miscellaneous

* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.7
    * @liexp/core bumped to 0.1.3
    * @liexp/shared bumped to 0.1.7

## [0.1.6](https://github.com/lies-exposed/lies.exposed/compare/agent@0.1.5...agent@0.1.6) (2026-01-07)


### Bug Fixes

* **agent:** reconnect to api MCP server automatically on fail ([#3002](https://github.com/lies-exposed/lies.exposed/issues/3002)) ([343d2cc](https://github.com/lies-exposed/lies.exposed/commit/343d2ccc6e219294b1da61473c57b48794a475d7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.6
    * @liexp/shared bumped to 0.1.6

## [0.1.5](https://github.com/lies-exposed/lies.exposed/compare/agent@0.1.4...agent@0.1.5) (2026-01-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.5
    * @liexp/shared bumped to 0.1.5

## [0.1.4](https://github.com/lies-exposed/lies.exposed/compare/agent@0.1.3...agent@0.1.4) (2026-01-05)


### Bug Fixes

* **admin:** chat  tools and messages stream and UI adjustments ([#2981](https://github.com/lies-exposed/lies.exposed/issues/2981)) ([faa9068](https://github.com/lies-exposed/lies.exposed/commit/faa9068fdac40812d72d7c3661e6fa16aa8e2d5a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.4
    * @liexp/shared bumped to 0.1.4

## [0.1.3](https://github.com/lies-exposed/lies.exposed/compare/agent@0.1.2...agent@0.1.3) (2026-01-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.3
    * @liexp/core bumped to 0.1.2
    * @liexp/shared bumped to 0.1.3

## [0.1.2](https://github.com/lies-exposed/lies.exposed/compare/agent@0.1.1...agent@0.1.2) (2026-01-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.2
    * @liexp/shared bumped to 0.1.2

## [0.1.1](https://github.com/lies-exposed/lies.exposed/compare/agent@0.1.0...agent@0.1.1) (2025-12-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.1
    * @liexp/core bumped to 0.1.1
    * @liexp/shared bumped to 0.1.1
