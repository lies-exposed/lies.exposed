# Changelog

## [0.2.5](https://github.com/lies-exposed/lies.exposed/compare/api@0.2.4...api@0.2.5) (2026-01-30)


### Miscellaneous

* **api:** removed puppeteer and puppeteer-extra deps and dead code ([#3149](https://github.com/lies-exposed/lies.exposed/issues/3149)) ([1a6ddab](https://github.com/lies-exposed/lies.exposed/commit/1a6ddabb6a28d42727b94954035f197b4f3646e5))
* **workspace:** removed fs direct import in flows ([#3150](https://github.com/lies-exposed/lies.exposed/issues/3150)) ([0aa2bcf](https://github.com/lies-exposed/lies.exposed/commit/0aa2bcf479cbce4efe87912e93171b473166d84b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.2.5
    * @liexp/core bumped to 0.2.5
    * @liexp/io bumped to 0.2.5
    * @liexp/shared bumped to 0.2.5
  * devDependencies
    * @liexp/eslint-config bumped to 0.2.5
    * @liexp/test bumped to 0.2.5

## [0.2.4](https://github.com/lies-exposed/lies.exposed/compare/api@0.2.3...api@0.2.4) (2026-01-28)


### Bug Fixes

* **shared:** make merge events helper function only accept NonEmptyArray ([#3134](https://github.com/lies-exposed/lies.exposed/issues/3134)) ([a8ae137](https://github.com/lies-exposed/lies.exposed/commit/a8ae1376345311c25f47b2e14cd9ca69fc11babd))


### Miscellaneous

* **api:** move config folder creation to proper method ([#3146](https://github.com/lies-exposed/lies.exposed/issues/3146)) ([4bd8375](https://github.com/lies-exposed/lies.exposed/commit/4bd8375f6f7a0161a7d4e9b949da7b6fc1ed4de7))
* moved queue implementation from fs to pg ([#3136](https://github.com/lies-exposed/lies.exposed/issues/3136)) ([5d9efc8](https://github.com/lies-exposed/lies.exposed/commit/5d9efc865751e6468b0e883a87005029f4e32802))
* refactor error logic ([#3129](https://github.com/lies-exposed/lies.exposed/issues/3129)) ([d04b8ff](https://github.com/lies-exposed/lies.exposed/commit/d04b8ffddb517d49feae3a22649e988bdc77658e))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.12
    * @liexp/core bumped to 0.1.6
    * @liexp/io bumped to 0.2.4
    * @liexp/shared bumped to 0.2.4
  * devDependencies
    * @liexp/test bumped to 0.1.12

## [0.2.3](https://github.com/lies-exposed/lies.exposed/compare/api@0.2.2...api@0.2.3) (2026-01-24)


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
    * @liexp/test bumped to 0.1.11

## [0.2.2](https://github.com/lies-exposed/lies.exposed/compare/api@0.2.1...api@0.2.2) (2026-01-23)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.10
    * @liexp/io bumped to 0.2.2
    * @liexp/shared bumped to 0.2.2
  * devDependencies
    * @liexp/test bumped to 0.1.10

## [0.2.1](https://github.com/lies-exposed/lies.exposed/compare/api@0.2.0...api@0.2.1) (2026-01-21)


### Miscellaneous

* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.9
    * @liexp/io bumped to 0.2.1
    * @liexp/shared bumped to 0.2.1
  * devDependencies
    * @liexp/test bumped to 0.1.9

## [0.2.0](https://github.com/lies-exposed/lies.exposed/compare/api@0.1.7...api@0.2.0) (2026-01-19)


### Features

* added endpoint to merge events ([#3055](https://github.com/lies-exposed/lies.exposed/issues/3055)) ([46da181](https://github.com/lies-exposed/lies.exposed/commit/46da1812e13deae9b8d1736e7c2295372660a43b))


### Bug Fixes

* **api:** endpoints to link actors to events ([#3053](https://github.com/lies-exposed/lies.exposed/issues/3053)) ([78e9925](https://github.com/lies-exposed/lies.exposed/commit/78e9925c90d0fdde7d39a41db96d7a0642e5d135))
* **api:** merge events flow ([#3073](https://github.com/lies-exposed/lies.exposed/issues/3073)) ([03669c1](https://github.com/lies-exposed/lies.exposed/commit/03669c1fea5a2be404b531e00c1713c84fe137a2))


### Miscellaneous

* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* **core:** fp module utils ([#3068](https://github.com/lies-exposed/lies.exposed/issues/3068)) ([1937350](https://github.com/lies-exposed/lies.exposed/commit/19373509798471fb3303c05af721479f71fa023b))
* **shared:** refactor event helpers ([#3067](https://github.com/lies-exposed/lies.exposed/issues/3067)) ([d9c5980](https://github.com/lies-exposed/lies.exposed/commit/d9c5980b68af7ca62f95b09922041613ac1e1677))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.8
    * @liexp/core bumped to 0.1.4
    * @liexp/shared bumped to 0.2.0
  * devDependencies
    * @liexp/test bumped to 0.1.8

## [0.1.7](https://github.com/lies-exposed/lies.exposed/compare/api@0.1.6...api@0.1.7) (2026-01-11)


### Bug Fixes

* **agent:** provide searchWebTools in agent service ([#3045](https://github.com/lies-exposed/lies.exposed/issues/3045)) ([1191a71](https://github.com/lies-exposed/lies.exposed/commit/1191a713da3eb66fa59f4ce275fc7f6e88a47693))
* **api:** actors and groups events linking routes ([#3041](https://github.com/lies-exposed/lies.exposed/issues/3041)) ([4d31bcb](https://github.com/lies-exposed/lies.exposed/commit/4d31bcb720288d516fc98de679883a61b79bafea))
* **api:** event hard delete ([#3024](https://github.com/lies-exposed/lies.exposed/issues/3024)) ([c27656f](https://github.com/lies-exposed/lies.exposed/commit/c27656f01331e1bfcbc7c2ffca37960796b54c5d))
* **api:** include relations in listed events when requested via query params ([#3032](https://github.com/lies-exposed/lies.exposed/issues/3032)) ([e9d85a7](https://github.com/lies-exposed/lies.exposed/commit/e9d85a796367ef7410b02ed0039fcdd26710e2fd))


### Miscellaneous

* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* **workspace:** bump supertest from 7.1.0 to 7.2.2 ([#3027](https://github.com/lies-exposed/lies.exposed/issues/3027)) ([7b7ece9](https://github.com/lies-exposed/lies.exposed/commit/7b7ece9e22aa502a13b44d2c3e5171803b32e0c1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.7
    * @liexp/core bumped to 0.1.3
    * @liexp/shared bumped to 0.1.7
  * devDependencies
    * @liexp/test bumped to 0.1.7

## [0.1.6](https://github.com/lies-exposed/lies.exposed/compare/api@0.1.5...api@0.1.6) (2026-01-07)


### Bug Fixes

* **ai-bot:** create event from url queue job ([#3015](https://github.com/lies-exposed/lies.exposed/issues/3015)) ([b5bf5f2](https://github.com/lies-exposed/lies.exposed/commit/b5bf5f25761d3326bf1e93d375192eea2858f72b))
* **api:** added missing description to getGroup MCP tool ([#3016](https://github.com/lies-exposed/lies.exposed/issues/3016)) ([42bf2c8](https://github.com/lies-exposed/lies.exposed/commit/42bf2c82e8367a83858882a639c785d8d52bfd51))
* **api:** get event with deleted items for admins ([#3020](https://github.com/lies-exposed/lies.exposed/issues/3020)) ([0d10219](https://github.com/lies-exposed/lies.exposed/commit/0d102194a77d17278b31c44ff4b1fa9445e10390))
* **api:** set timeout to 30s for get metadata client ([#3003](https://github.com/lies-exposed/lies.exposed/issues/3003)) ([21037df](https://github.com/lies-exposed/lies.exposed/commit/21037dffdb4db88b6c48e88f79b5e1083831f803))


### Miscellaneous

* **worker:** proper mocks initialization for e2e tests ([#2998](https://github.com/lies-exposed/lies.exposed/issues/2998)) ([4619599](https://github.com/lies-exposed/lies.exposed/commit/4619599251bb8eca66c3a35ad17d10e0f9c3d2a9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.6
    * @liexp/shared bumped to 0.1.6
  * devDependencies
    * @liexp/test bumped to 0.1.6

## [0.1.5](https://github.com/lies-exposed/lies.exposed/compare/api@0.1.4...api@0.1.5) (2026-01-05)


### Bug Fixes

* **backend:** handle space TLS connection via env variable ([#2986](https://github.com/lies-exposed/lies.exposed/issues/2986)) ([ccfa27e](https://github.com/lies-exposed/lies.exposed/commit/ccfa27ed47281a7d7975c0d0506d342f3ba2468b))


### Miscellaneous

* **api:** solved typecheck errors in test files ([#2991](https://github.com/lies-exposed/lies.exposed/issues/2991)) ([1bbc8e2](https://github.com/lies-exposed/lies.exposed/commit/1bbc8e2bc031d857eec2c13b340c9a4ce9493116))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.5
    * @liexp/shared bumped to 0.1.5
  * devDependencies
    * @liexp/test bumped to 0.1.5

## [0.1.4](https://github.com/lies-exposed/lies.exposed/compare/api@0.1.3...api@0.1.4) (2026-01-05)


### Bug Fixes

* **admin:** filter links by events count ([#2978](https://github.com/lies-exposed/lies.exposed/issues/2978)) ([2baee88](https://github.com/lies-exposed/lies.exposed/commit/2baee882c054639ecc76437aaf7fd9589d6fa43a))
* **api:** added endpoint to merge actors ([#2984](https://github.com/lies-exposed/lies.exposed/issues/2984)) ([459df12](https://github.com/lies-exposed/lies.exposed/commit/459df124dbb2c7d73c3eb1e5418d00d11bfa6352))
* **api:** added tools to find and get nation entities ([#2983](https://github.com/lies-exposed/lies.exposed/issues/2983)) ([3e6de57](https://github.com/lies-exposed/lies.exposed/commit/3e6de57e4f0456a4892fc9facc010989540ecf81))


### Miscellaneous

* **workspace:** disabled watch as default for running tests ([#2982](https://github.com/lies-exposed/lies.exposed/issues/2982)) ([abc2ea9](https://github.com/lies-exposed/lies.exposed/commit/abc2ea983764205742b91dfffaa5f404ad138e81))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.4
    * @liexp/shared bumped to 0.1.4
  * devDependencies
    * @liexp/test bumped to 0.1.4

## [0.1.3](https://github.com/lies-exposed/lies.exposed/compare/api@0.1.2...api@0.1.3) (2026-01-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.3
    * @liexp/core bumped to 0.1.2
    * @liexp/shared bumped to 0.1.3
  * devDependencies
    * @liexp/test bumped to 0.1.3

## [0.1.2](https://github.com/lies-exposed/lies.exposed/compare/api@0.1.1...api@0.1.2) (2026-01-01)


### Miscellaneous

* **deps:** bump typeorm from 0.3.27 to 0.3.28 ([#2937](https://github.com/lies-exposed/lies.exposed/issues/2937)) ([d4fb0d8](https://github.com/lies-exposed/lies.exposed/commit/d4fb0d80a1222e8c25942fac4e229b57bfa00576))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.2
    * @liexp/shared bumped to 0.1.2
  * devDependencies
    * @liexp/test bumped to 0.1.2

## [0.1.1](https://github.com/lies-exposed/lies.exposed/compare/api@0.1.0...api@0.1.1) (2025-12-30)


### Miscellaneous

* **workspace:** bump the vite group across 8 directories with 2 updates ([#2894](https://github.com/lies-exposed/lies.exposed/issues/2894)) ([9b335af](https://github.com/lies-exposed/lies.exposed/commit/9b335afd53d543e8225464c7cb93d62986bb8b9b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.1
    * @liexp/core bumped to 0.1.1
    * @liexp/shared bumped to 0.1.1
  * devDependencies
    * @liexp/test bumped to 0.1.1
