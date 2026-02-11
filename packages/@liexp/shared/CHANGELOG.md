# Changelog

## [0.3.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.2.5...@liexp/shared@0.3.0) (2026-02-11)


### Features

* create actor relation ([#3167](https://github.com/lies-exposed/lies.exposed/issues/3167)) ([f251e56](https://github.com/lies-exposed/lies.exposed/commit/f251e56a8b360dae003b88601f5bbe03cdf4216e))


### Miscellaneous

* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.3.0
    * @liexp/io bumped to 0.3.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.3.0
    * @liexp/test bumped to 0.3.0

## [0.2.5](https://github.com/lies-exposed/lies.exposed/compare/@liexp/shared@0.2.4...@liexp/shared@0.2.5) (2026-01-30)


### Miscellaneous

* **@liexp/shared:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.2.5
    * @liexp/io bumped to 0.2.5
  * devDependencies
    * @liexp/eslint-config bumped to 0.2.5
    * @liexp/test bumped to 0.2.5

## [0.2.4](https://github.com/lies-exposed/lies.exposed/compare/@liexp/shared@0.2.3...@liexp/shared@0.2.4) (2026-01-28)


### Bug Fixes

* **api:** added extension to import ([#3133](https://github.com/lies-exposed/lies.exposed/issues/3133)) ([7666ccf](https://github.com/lies-exposed/lies.exposed/commit/7666ccfaec68b1f405a7c98ae4d56fa0d4dfaa0a))
* **shared:** make merge events helper function only accept NonEmptyArray ([#3134](https://github.com/lies-exposed/lies.exposed/issues/3134)) ([a8ae137](https://github.com/lies-exposed/lies.exposed/commit/a8ae1376345311c25f47b2e14cd9ca69fc11babd))


### Miscellaneous

* moved queue implementation from fs to pg ([#3136](https://github.com/lies-exposed/lies.exposed/issues/3136)) ([5d9efc8](https://github.com/lies-exposed/lies.exposed/commit/5d9efc865751e6468b0e883a87005029f4e32802))
* refactor error logic ([#3129](https://github.com/lies-exposed/lies.exposed/issues/3129)) ([d04b8ff](https://github.com/lies-exposed/lies.exposed/commit/d04b8ffddb517d49feae3a22649e988bdc77658e))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.6
    * @liexp/io bumped to 0.2.4
  * devDependencies
    * @liexp/test bumped to 0.1.12

## [0.2.3](https://github.com/lies-exposed/lies.exposed/compare/@liexp/shared@0.2.2...@liexp/shared@0.2.3) (2026-01-24)


### Bug Fixes

* **ai-bot:** create event from links with json schema ([#3123](https://github.com/lies-exposed/lies.exposed/issues/3123)) ([6a90c81](https://github.com/lies-exposed/lies.exposed/commit/6a90c81da9d860589f336f3d930d011273a32e23))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.5
    * @liexp/io bumped to 0.2.3
  * devDependencies
    * @liexp/eslint-config bumped to 0.1.0
    * @liexp/test bumped to 0.1.11

## [0.2.2](https://github.com/lies-exposed/lies.exposed/compare/@liexp/shared@0.2.1...@liexp/shared@0.2.2) (2026-01-23)


### Miscellaneous

* **agent:** use [@ts-endpoint](https://github.com/ts-endpoint) stream endpoint definition ([#3112](https://github.com/lies-exposed/lies.exposed/issues/3112)) ([52c265d](https://github.com/lies-exposed/lies.exposed/commit/52c265d95ac581d7f61a17da19ed9cdf71833ae7))
* **shared:** moved ai prompts from io package ([#3111](https://github.com/lies-exposed/lies.exposed/issues/3111)) ([3619422](https://github.com/lies-exposed/lies.exposed/commit/3619422b1c3d65cee35ca81a1e67a8afca91ac6f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/io bumped to 0.2.2
  * devDependencies
    * @liexp/test bumped to 0.1.10

## [0.2.1](https://github.com/lies-exposed/lies.exposed/compare/@liexp/shared@0.2.0...@liexp/shared@0.2.1) (2026-01-21)


### Miscellaneous

* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* **shared:** added unit tests for helpers and utils ([#3090](https://github.com/lies-exposed/lies.exposed/issues/3090)) ([f1a6f7a](https://github.com/lies-exposed/lies.exposed/commit/f1a6f7aad7c86906d293a4f9ee6d7e92bc1d71d9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/io bumped to 0.2.1
  * devDependencies
    * @liexp/test bumped to 0.1.9

## [0.2.0](https://github.com/lies-exposed/lies.exposed/compare/@liexp/shared@0.1.7...@liexp/shared@0.2.0) (2026-01-19)


### Features

* added endpoint to merge events ([#3055](https://github.com/lies-exposed/lies.exposed/issues/3055)) ([46da181](https://github.com/lies-exposed/lies.exposed/commit/46da1812e13deae9b8d1736e7c2295372660a43b))


### Bug Fixes

* **api:** endpoints to link actors to events ([#3053](https://github.com/lies-exposed/lies.exposed/issues/3053)) ([78e9925](https://github.com/lies-exposed/lies.exposed/commit/78e9925c90d0fdde7d39a41db96d7a0642e5d135))
* **shared:** added merge events helper ([#3072](https://github.com/lies-exposed/lies.exposed/issues/3072)) ([395e45b](https://github.com/lies-exposed/lies.exposed/commit/395e45be885a25a5a897d7dd21867f37362d7fe8))
* **shared:** renamed Endpoints for agent to AgentEndpoints ([#3063](https://github.com/lies-exposed/lies.exposed/issues/3063)) ([5366305](https://github.com/lies-exposed/lies.exposed/commit/53663056c564a92b4ca01805f61edd849b000a26))
* **shared:** use UUID for scientific study payload image ([#3066](https://github.com/lies-exposed/lies.exposed/issues/3066)) ([e069dee](https://github.com/lies-exposed/lies.exposed/commit/e069deefbe953c44ab94593dd6bdaf3bfe4a9543))


### Miscellaneous

* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* **core:** fp module utils ([#3068](https://github.com/lies-exposed/lies.exposed/issues/3068)) ([1937350](https://github.com/lies-exposed/lies.exposed/commit/19373509798471fb3303c05af721479f71fa023b))
* **shared:** added spec tests for event helpers ([#3069](https://github.com/lies-exposed/lies.exposed/issues/3069)) ([9fa9f27](https://github.com/lies-exposed/lies.exposed/commit/9fa9f272f1ca0bbbdbff4b0289c84ac9fc4b92cc))
* **shared:** refactor event helpers ([#3067](https://github.com/lies-exposed/lies.exposed/issues/3067)) ([d9c5980](https://github.com/lies-exposed/lies.exposed/commit/d9c5980b68af7ca62f95b09922041613ac1e1677))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.4

## [0.1.7](https://github.com/lies-exposed/lies.exposed/compare/@liexp/shared@0.1.6...@liexp/shared@0.1.7) (2026-01-11)


### Bug Fixes

* **ai-bot:** update event flow with proper types and prompts ([#3025](https://github.com/lies-exposed/lies.exposed/issues/3025)) ([ba42afe](https://github.com/lies-exposed/lies.exposed/commit/ba42afef414865c5b70c902fb052e515a2d3ef6a))
* **api:** actors and groups events linking routes ([#3041](https://github.com/lies-exposed/lies.exposed/issues/3041)) ([4d31bcb](https://github.com/lies-exposed/lies.exposed/commit/4d31bcb720288d516fc98de679883a61b79bafea))
* **api:** include relations in listed events when requested via query params ([#3032](https://github.com/lies-exposed/lies.exposed/issues/3032)) ([e9d85a7](https://github.com/lies-exposed/lies.exposed/commit/e9d85a796367ef7410b02ed0039fcdd26710e2fd))
* **ui:** created UpdateEventQueueButton component ([#3030](https://github.com/lies-exposed/lies.exposed/issues/3030)) ([d23f7eb](https://github.com/lies-exposed/lies.exposed/commit/d23f7ebab3efbb2c32d65fe37d9af72624cf4645))
* **ui:** show event media relation in autocomplete input component ([#3031](https://github.com/lies-exposed/lies.exposed/issues/3031)) ([5f2257b](https://github.com/lies-exposed/lies.exposed/commit/5f2257b7e20ac1ad24069b264d8838a1715ed1fb))


### Miscellaneous

* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* **workspace:** pnpm overrides for zod@^4 ([#3042](https://github.com/lies-exposed/lies.exposed/issues/3042)) ([334ef1d](https://github.com/lies-exposed/lies.exposed/commit/334ef1d9ab455ba643a561e39daed4f1a8eda60e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.3

## [0.1.6](https://github.com/lies-exposed/lies.exposed/compare/@liexp/shared@0.1.5...@liexp/shared@0.1.6) (2026-01-07)


### Bug Fixes

* **ai-bot:** create event from url queue job ([#3015](https://github.com/lies-exposed/lies.exposed/issues/3015)) ([b5bf5f2](https://github.com/lies-exposed/lies.exposed/commit/b5bf5f25761d3326bf1e93d375192eea2858f72b))
* **api:** get event with deleted items for admins ([#3020](https://github.com/lies-exposed/lies.exposed/issues/3020)) ([0d10219](https://github.com/lies-exposed/lies.exposed/commit/0d102194a77d17278b31c44ff4b1fa9445e10390))
* **ui:** create event from link with AI button ([#3017](https://github.com/lies-exposed/lies.exposed/issues/3017)) ([8bf695e](https://github.com/lies-exposed/lies.exposed/commit/8bf695e2b24e7f4812ce46ffc476fd30f959b79b))

## [0.1.5](https://github.com/lies-exposed/lies.exposed/compare/@liexp/shared@0.1.4...@liexp/shared@0.1.5) (2026-01-05)


### Bug Fixes

* **admin:** description with Tooltip for AI jobs ([#2994](https://github.com/lies-exposed/lies.exposed/issues/2994)) ([6b4847a](https://github.com/lies-exposed/lies.exposed/commit/6b4847a8f6383755e2d7bee57306db5b0287dc5a))
* **ui:** remove isLoading from OpenAIJobUtton ([#2997](https://github.com/lies-exposed/lies.exposed/issues/2997)) ([d873e4d](https://github.com/lies-exposed/lies.exposed/commit/d873e4d652d6b7194b5d94508c24cca503e50d71))

## [0.1.4](https://github.com/lies-exposed/lies.exposed/compare/@liexp/shared@0.1.3...@liexp/shared@0.1.4) (2026-01-05)


### Bug Fixes

* **admin:** filter links by events count ([#2978](https://github.com/lies-exposed/lies.exposed/issues/2978)) ([2baee88](https://github.com/lies-exposed/lies.exposed/commit/2baee882c054639ecc76437aaf7fd9589d6fa43a))
* **api:** added endpoint to merge actors ([#2984](https://github.com/lies-exposed/lies.exposed/issues/2984)) ([459df12](https://github.com/lies-exposed/lies.exposed/commit/459df124dbb2c7d73c3eb1e5418d00d11bfa6352))

## [0.1.3](https://github.com/lies-exposed/lies.exposed/compare/@liexp/shared@0.1.2...@liexp/shared@0.1.3) (2026-01-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.2

## [0.1.2](https://github.com/lies-exposed/lies.exposed/compare/@liexp/shared@0.1.1...@liexp/shared@0.1.2) (2026-01-01)


### Miscellaneous

* **deps-dev:** bump @types/lodash from 4.17.20 to 4.17.21 ([#2939](https://github.com/lies-exposed/lies.exposed/issues/2939)) ([d027f03](https://github.com/lies-exposed/lies.exposed/commit/d027f033cf9a7c631e1434a23851d3cdc99dd3a4))
* **deps:** bump pdfjs-dist from 5.4.149 to 5.4.530 ([#2941](https://github.com/lies-exposed/lies.exposed/issues/2941)) ([3b64984](https://github.com/lies-exposed/lies.exposed/commit/3b64984ce77017e64481035ce98ef3411980cbc7))

## [0.1.1](https://github.com/lies-exposed/lies.exposed/compare/@liexp/shared@0.1.0...@liexp/shared@0.1.1) (2025-12-30)


### Miscellaneous

* **workspace:** bump the vite group across 8 directories with 2 updates ([#2894](https://github.com/lies-exposed/lies.exposed/issues/2894)) ([9b335af](https://github.com/lies-exposed/lies.exposed/commit/9b335afd53d543e8225464c7cb93d62986bb8b9b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.1
