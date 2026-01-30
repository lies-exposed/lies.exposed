# Changelog

## [0.2.5](https://github.com/lies-exposed/lies.exposed/compare/admin@0.2.4...admin@0.2.5) (2026-01-30)


### Miscellaneous

* **admin:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.2.5
    * @liexp/core bumped to 0.2.5
    * @liexp/io bumped to 0.2.5
    * @liexp/shared bumped to 0.2.5
    * @liexp/ui bumped to 0.2.5
  * devDependencies
    * @liexp/eslint-config bumped to 0.2.5
    * @liexp/test bumped to 0.2.5

## [0.2.4](https://github.com/lies-exposed/lies.exposed/compare/admin@0.2.3...admin@0.2.4) (2026-01-28)


### Bug Fixes

* **admin:** missing sidebar pages icons and fixed colors ([#3135](https://github.com/lies-exposed/lies.exposed/issues/3135)) ([96f7d18](https://github.com/lies-exposed/lies.exposed/commit/96f7d18d2ae7d1187eaa17a5f872372cd4438590))
* **shared:** make merge events helper function only accept NonEmptyArray ([#3134](https://github.com/lies-exposed/lies.exposed/issues/3134)) ([a8ae137](https://github.com/lies-exposed/lies.exposed/commit/a8ae1376345311c25f47b2e14cd9ca69fc11babd))


### Miscellaneous

* refactor error logic ([#3129](https://github.com/lies-exposed/lies.exposed/issues/3129)) ([d04b8ff](https://github.com/lies-exposed/lies.exposed/commit/d04b8ffddb517d49feae3a22649e988bdc77658e))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.12
    * @liexp/core bumped to 0.1.6
    * @liexp/io bumped to 0.2.4
    * @liexp/shared bumped to 0.2.4
    * @liexp/ui bumped to 0.2.4
  * devDependencies
    * @liexp/test bumped to 0.1.12

## [0.2.3](https://github.com/lies-exposed/lies.exposed/compare/admin@0.2.2...admin@0.2.3) (2026-01-24)


### Bug Fixes

* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.11
    * @liexp/core bumped to 0.1.5
    * @liexp/io bumped to 0.2.3
    * @liexp/shared bumped to 0.2.3
    * @liexp/ui bumped to 0.2.3
  * devDependencies
    * @liexp/eslint-config bumped to 0.1.0
    * @liexp/test bumped to 0.1.11

## [0.2.2](https://github.com/lies-exposed/lies.exposed/compare/admin@0.2.1...admin@0.2.2) (2026-01-23)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.10
    * @liexp/io bumped to 0.2.2
    * @liexp/shared bumped to 0.2.2
    * @liexp/ui bumped to 0.2.2
  * devDependencies
    * @liexp/test bumped to 0.1.10

## [0.2.1](https://github.com/lies-exposed/lies.exposed/compare/admin@0.2.0...admin@0.2.1) (2026-01-21)


### Miscellaneous

* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.9
    * @liexp/io bumped to 0.2.1
    * @liexp/shared bumped to 0.2.1
    * @liexp/ui bumped to 0.2.1
  * devDependencies
    * @liexp/test bumped to 0.1.9

## [0.2.0](https://github.com/lies-exposed/lies.exposed/compare/admin@0.1.8...admin@0.2.0) (2026-01-19)


### Features

* added endpoint to merge events ([#3055](https://github.com/lies-exposed/lies.exposed/issues/3055)) ([46da181](https://github.com/lies-exposed/lies.exposed/commit/46da1812e13deae9b8d1736e7c2295372660a43b))


### Bug Fixes

* **api:** endpoints to link actors to events ([#3053](https://github.com/lies-exposed/lies.exposed/issues/3053)) ([78e9925](https://github.com/lies-exposed/lies.exposed/commit/78e9925c90d0fdde7d39a41db96d7a0642e5d135))
* **shared:** renamed Endpoints for agent to AgentEndpoints ([#3063](https://github.com/lies-exposed/lies.exposed/issues/3063)) ([5366305](https://github.com/lies-exposed/lies.exposed/commit/53663056c564a92b4ca01805f61edd849b000a26))


### Miscellaneous

* **admin:** moved hooks and context to @liexp/ui ([#3064](https://github.com/lies-exposed/lies.exposed/issues/3064)) ([3f9d3b5](https://github.com/lies-exposed/lies.exposed/commit/3f9d3b54e186a476216161624f50069d4a5835c5))
* **admin:** setup custom HMR port for server ([#3051](https://github.com/lies-exposed/lies.exposed/issues/3051)) ([99ef38c](https://github.com/lies-exposed/lies.exposed/commit/99ef38c1d3f8b299341ed2df4dc9197eda0ef4be))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.8
    * @liexp/core bumped to 0.1.4
    * @liexp/shared bumped to 0.2.0
    * @liexp/ui bumped to 0.2.0
  * devDependencies
    * @liexp/test bumped to 0.1.8

## [0.1.8](https://github.com/lies-exposed/lies.exposed/compare/admin@0.1.7...admin@0.1.8) (2026-01-11)


### Miscellaneous

* **admin:** renamed service to 'admin' ([#3035](https://github.com/lies-exposed/lies.exposed/issues/3035)) ([b88833a](https://github.com/lies-exposed/lies.exposed/commit/b88833a6a915bd0d9e0da639b034642b614a01eb))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.7
    * @liexp/core bumped to 0.1.3
    * @liexp/shared bumped to 0.1.7
    * @liexp/ui bumped to 0.1.8
  * devDependencies
    * @liexp/test bumped to 0.1.7

## [0.1.7](https://github.com/lies-exposed/lies.exposed/compare/admin-web@0.1.6...admin-web@0.1.7) (2026-01-07)


### Miscellaneous

* **admin:** removed unused export of AdminWebConfigApp type ([#3014](https://github.com/lies-exposed/lies.exposed/issues/3014)) ([e6fc2dc](https://github.com/lies-exposed/lies.exposed/commit/e6fc2dc379281e68c6830b8c9e473f38beb0f85e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.6
    * @liexp/shared bumped to 0.1.6
    * @liexp/ui bumped to 0.1.7
  * devDependencies
    * @liexp/test bumped to 0.1.6

## [0.1.6](https://github.com/lies-exposed/lies.exposed/compare/admin-web@0.1.5...admin-web@0.1.6) (2026-01-05)


### Bug Fixes

* **admin:** create entities with either new media or existing one ([#2985](https://github.com/lies-exposed/lies.exposed/issues/2985)) ([63302bf](https://github.com/lies-exposed/lies.exposed/commit/63302bf638482501b5d13d02bedb1a87cc833877))
* **admin:** description with Tooltip for AI jobs ([#2994](https://github.com/lies-exposed/lies.exposed/issues/2994)) ([6b4847a](https://github.com/lies-exposed/lies.exposed/commit/6b4847a8f6383755e2d7bee57306db5b0287dc5a))


### Miscellaneous

* **api:** solved typecheck errors in test files ([#2991](https://github.com/lies-exposed/lies.exposed/issues/2991)) ([1bbc8e2](https://github.com/lies-exposed/lies.exposed/commit/1bbc8e2bc031d857eec2c13b340c9a4ce9493116))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.5
    * @liexp/shared bumped to 0.1.5
    * @liexp/ui bumped to 0.1.6
  * devDependencies
    * @liexp/test bumped to 0.1.5

## [0.1.5](https://github.com/lies-exposed/lies.exposed/compare/admin-web@0.1.4...admin-web@0.1.5) (2026-01-05)


### Bug Fixes

* **admin:** chat  tools and messages stream and UI adjustments ([#2981](https://github.com/lies-exposed/lies.exposed/issues/2981)) ([faa9068](https://github.com/lies-exposed/lies.exposed/commit/faa9068fdac40812d72d7c3661e6fa16aa8e2d5a))
* **api:** added endpoint to merge actors ([#2984](https://github.com/lies-exposed/lies.exposed/issues/2984)) ([459df12](https://github.com/lies-exposed/lies.exposed/commit/459df124dbb2c7d73c3eb1e5418d00d11bfa6352))
* **backend:** fix SPA fallback route not matching root path in Express 5 ([#2974](https://github.com/lies-exposed/lies.exposed/issues/2974)) ([ce813ed](https://github.com/lies-exposed/lies.exposed/commit/ce813ed96b603325b85cbd1684796f4dc370aab9))


### Miscellaneous

* **workspace:** disabled watch as default for running tests ([#2982](https://github.com/lies-exposed/lies.exposed/issues/2982)) ([abc2ea9](https://github.com/lies-exposed/lies.exposed/commit/abc2ea983764205742b91dfffaa5f404ad138e81))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.4
    * @liexp/shared bumped to 0.1.4
    * @liexp/ui bumped to 0.1.5
  * devDependencies
    * @liexp/test bumped to 0.1.4

## [0.1.4](https://github.com/lies-exposed/lies.exposed/compare/admin-web@0.1.3...admin-web@0.1.4) (2026-01-03)


### Bug Fixes

* **backend:** vite server helper catch-all path ([#2965](https://github.com/lies-exposed/lies.exposed/issues/2965)) ([20d2f06](https://github.com/lies-exposed/lies.exposed/commit/20d2f06410c4e38e36675b542707fc27416a9995))
* **ui:** use react-hook-form hooks to keep TextWithSlugInput values in syn ([#2971](https://github.com/lies-exposed/lies.exposed/issues/2971)) ([88f3f2d](https://github.com/lies-exposed/lies.exposed/commit/88f3f2d4a06e8b3a5a13574ee8b3686486247df2))


### Miscellaneous

* **admin:** added vitest configuration for e2e tests ([#2968](https://github.com/lies-exposed/lies.exposed/issues/2968)) ([6f6dd39](https://github.com/lies-exposed/lies.exposed/commit/6f6dd39b909dd637f501d3d8030deecd0fbc8dfd))
* **admin:** vitest configuration with projects ([#2972](https://github.com/lies-exposed/lies.exposed/issues/2972)) ([cf48122](https://github.com/lies-exposed/lies.exposed/commit/cf4812263124dc690ac94b267b77772a1c0f4ade))
* deploy of admin-web service ([#2963](https://github.com/lies-exposed/lies.exposed/issues/2963)) ([956f071](https://github.com/lies-exposed/lies.exposed/commit/956f0713d15f65b3c2ab3ca9ec16eb1457c00900))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.3
    * @liexp/core bumped to 0.1.2
    * @liexp/shared bumped to 0.1.3
    * @liexp/ui bumped to 0.1.4
  * devDependencies
    * @liexp/test bumped to 0.1.3

## [0.1.3](https://github.com/lies-exposed/lies.exposed/compare/admin-web@0.1.2...admin-web@0.1.3) (2026-01-01)


### Miscellaneous

* **admin:** kubernetes deploy configuration ([#2960](https://github.com/lies-exposed/lies.exposed/issues/2960)) ([3397b37](https://github.com/lies-exposed/lies.exposed/commit/3397b37c356e71d01d3173125b34365de1e7c2d3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/ui bumped to 0.1.3

## [0.1.2](https://github.com/lies-exposed/lies.exposed/compare/admin-web@0.1.1...admin-web@0.1.2) (2026-01-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.2
    * @liexp/shared bumped to 0.1.2
    * @liexp/ui bumped to 0.1.2

## [0.1.1](https://github.com/lies-exposed/lies.exposed/compare/admin-web@0.1.0...admin-web@0.1.1) (2025-12-30)


### Miscellaneous

* **workspace:** bump the vite group across 8 directories with 2 updates ([#2894](https://github.com/lies-exposed/lies.exposed/issues/2894)) ([9b335af](https://github.com/lies-exposed/lies.exposed/commit/9b335afd53d543e8225464c7cb93d62986bb8b9b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.1
    * @liexp/core bumped to 0.1.1
    * @liexp/shared bumped to 0.1.1
    * @liexp/ui bumped to 0.1.1
