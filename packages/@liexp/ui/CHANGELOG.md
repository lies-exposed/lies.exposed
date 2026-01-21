# Changelog

## [0.2.1](https://github.com/lies-exposed/lies.exposed/compare/@liexp/ui@0.2.0...@liexp/ui@0.2.1) (2026-01-21)


### Bug Fixes

* **ai-bot:** add create event from multiple links feature ([#3098](https://github.com/lies-exposed/lies.exposed/issues/3098)) ([#3099](https://github.com/lies-exposed/lies.exposed/issues/3099)) ([8644ffc](https://github.com/lies-exposed/lies.exposed/commit/8644ffc883fd294e130cbcee3ef6865a9ca28628))


### Miscellaneous

* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* **storybook:** added stories for ErrorBox component ([#3101](https://github.com/lies-exposed/lies.exposed/issues/3101)) ([2f68ced](https://github.com/lies-exposed/lies.exposed/commit/2f68ced04151d8dfabb2ce046998a35b1b85ec8e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/io bumped to 0.2.1
    * @liexp/shared bumped to 0.2.1

## [0.2.0](https://github.com/lies-exposed/lies.exposed/compare/@liexp/ui@0.1.8...@liexp/ui@0.2.0) (2026-01-19)


### Features

* added endpoint to merge events ([#3055](https://github.com/lies-exposed/lies.exposed/issues/3055)) ([46da181](https://github.com/lies-exposed/lies.exposed/commit/46da1812e13deae9b8d1736e7c2295372660a43b))


### Bug Fixes

* **api:** endpoints to link actors to events ([#3053](https://github.com/lies-exposed/lies.exposed/issues/3053)) ([78e9925](https://github.com/lies-exposed/lies.exposed/commit/78e9925c90d0fdde7d39a41db96d7a0642e5d135))
* **ui:** add AIInstructionButton component ([#3062](https://github.com/lies-exposed/lies.exposed/issues/3062)) ([a09c400](https://github.com/lies-exposed/lies.exposed/commit/a09c400c966298f45f1cb663eb9ca5027f44351e))
* **ui:** defined EventTypeSelect component ([#3071](https://github.com/lies-exposed/lies.exposed/issues/3071)) ([a75baad](https://github.com/lies-exposed/lies.exposed/commit/a75baad174b9b4f9ba9ba75a2cb2831abebc3bee))
* **ui:** openai job button with icons instead of text ([#3046](https://github.com/lies-exposed/lies.exposed/issues/3046)) ([2b657ee](https://github.com/lies-exposed/lies.exposed/commit/2b657ee5fe2c6e9541f8502eee10d35f798b8ea3))


### Miscellaneous

* **admin:** moved hooks and context to @liexp/ui ([#3064](https://github.com/lies-exposed/lies.exposed/issues/3064)) ([3f9d3b5](https://github.com/lies-exposed/lies.exposed/commit/3f9d3b54e186a476216161624f50069d4a5835c5))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* **core:** fp module utils ([#3068](https://github.com/lies-exposed/lies.exposed/issues/3068)) ([1937350](https://github.com/lies-exposed/lies.exposed/commit/19373509798471fb3303c05af721479f71fa023b))
* **shared:** refactor event helpers ([#3067](https://github.com/lies-exposed/lies.exposed/issues/3067)) ([d9c5980](https://github.com/lies-exposed/lies.exposed/commit/d9c5980b68af7ca62f95b09922041613ac1e1677))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.4
    * @liexp/shared bumped to 0.2.0

## [0.1.8](https://github.com/lies-exposed/lies.exposed/compare/@liexp/ui@0.1.7...@liexp/ui@0.1.8) (2026-01-11)


### Bug Fixes

* **api:** include relations in listed events when requested via query params ([#3032](https://github.com/lies-exposed/lies.exposed/issues/3032)) ([e9d85a7](https://github.com/lies-exposed/lies.exposed/commit/e9d85a796367ef7410b02ed0039fcdd26710e2fd))
* **ui:** created UpdateEventQueueButton component ([#3030](https://github.com/lies-exposed/lies.exposed/issues/3030)) ([d23f7eb](https://github.com/lies-exposed/lies.exposed/commit/d23f7ebab3efbb2c32d65fe37d9af72624cf4645))
* **ui:** show event media relation in autocomplete input component ([#3031](https://github.com/lies-exposed/lies.exposed/issues/3031)) ([5f2257b](https://github.com/lies-exposed/lies.exposed/commit/5f2257b7e20ac1ad24069b264d8838a1715ed1fb))


### Miscellaneous

* **admin:** implement HMR for development server ([#3034](https://github.com/lies-exposed/lies.exposed/issues/3034)) ([13f4b42](https://github.com/lies-exposed/lies.exposed/commit/13f4b4256065f256272575d27892e6bcf9b310c9))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.3
    * @liexp/shared bumped to 0.1.7

## [0.1.7](https://github.com/lies-exposed/lies.exposed/compare/@liexp/ui@0.1.6...@liexp/ui@0.1.7) (2026-01-07)


### Bug Fixes

* **ui:** create event from link with AI button ([#3017](https://github.com/lies-exposed/lies.exposed/issues/3017)) ([8bf695e](https://github.com/lies-exposed/lies.exposed/commit/8bf695e2b24e7f4812ce46ffc476fd30f959b79b))
* **ui:** create event from link with redirect to new event ([#3001](https://github.com/lies-exposed/lies.exposed/issues/3001)) ([d097d0d](https://github.com/lies-exposed/lies.exposed/commit/d097d0df035aba3d05939463e5cdbd8d873bc4fc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/shared bumped to 0.1.6

## [0.1.6](https://github.com/lies-exposed/lies.exposed/compare/@liexp/ui@0.1.5...@liexp/ui@0.1.6) (2026-01-05)


### Bug Fixes

* **admin:** create entities with either new media or existing one ([#2985](https://github.com/lies-exposed/lies.exposed/issues/2985)) ([63302bf](https://github.com/lies-exposed/lies.exposed/commit/63302bf638482501b5d13d02bedb1a87cc833877))
* **admin:** description with Tooltip for AI jobs ([#2994](https://github.com/lies-exposed/lies.exposed/issues/2994)) ([6b4847a](https://github.com/lies-exposed/lies.exposed/commit/6b4847a8f6383755e2d7bee57306db5b0287dc5a))
* **ui:** remove isLoading from OpenAIJobUtton ([#2997](https://github.com/lies-exposed/lies.exposed/issues/2997)) ([d873e4d](https://github.com/lies-exposed/lies.exposed/commit/d873e4d652d6b7194b5d94508c24cca503e50d71))


### Miscellaneous

* **workspace:** only lint and build changed packages on pre-push ([#2993](https://github.com/lies-exposed/lies.exposed/issues/2993)) ([6702c26](https://github.com/lies-exposed/lies.exposed/commit/6702c264806f60b79b52454ad9a0b1bee9261c08))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/shared bumped to 0.1.5

## [0.1.5](https://github.com/lies-exposed/lies.exposed/compare/@liexp/ui@0.1.4...@liexp/ui@0.1.5) (2026-01-05)


### Bug Fixes

* **admin:** chat  tools and messages stream and UI adjustments ([#2981](https://github.com/lies-exposed/lies.exposed/issues/2981)) ([faa9068](https://github.com/lies-exposed/lies.exposed/commit/faa9068fdac40812d72d7c3661e6fa16aa8e2d5a))
* **admin:** filter links by events count ([#2978](https://github.com/lies-exposed/lies.exposed/issues/2978)) ([2baee88](https://github.com/lies-exposed/lies.exposed/commit/2baee882c054639ecc76437aaf7fd9589d6fa43a))
* **api:** added endpoint to merge actors ([#2984](https://github.com/lies-exposed/lies.exposed/issues/2984)) ([459df12](https://github.com/lies-exposed/lies.exposed/commit/459df124dbb2c7d73c3eb1e5418d00d11bfa6352))
* **api:** added tools to find and get nation entities ([#2983](https://github.com/lies-exposed/lies.exposed/issues/2983)) ([3e6de57](https://github.com/lies-exposed/lies.exposed/commit/3e6de57e4f0456a4892fc9facc010989540ecf81))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/shared bumped to 0.1.4

## [0.1.4](https://github.com/lies-exposed/lies.exposed/compare/@liexp/ui@0.1.3...@liexp/ui@0.1.4) (2026-01-03)


### Bug Fixes

* **ui:** use react-hook-form hooks to keep TextWithSlugInput values in syn ([#2971](https://github.com/lies-exposed/lies.exposed/issues/2971)) ([88f3f2d](https://github.com/lies-exposed/lies.exposed/commit/88f3f2d4a06e8b3a5a13574ee8b3686486247df2))


### Miscellaneous

* **backend:** moved node SSR logic from @liexp/ui ([#2967](https://github.com/lies-exposed/lies.exposed/issues/2967)) ([a6ed9f0](https://github.com/lies-exposed/lies.exposed/commit/a6ed9f0579033fbf556e805ea1ed4dda46cef899))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.2
    * @liexp/shared bumped to 0.1.3

## [0.1.3](https://github.com/lies-exposed/lies.exposed/compare/@liexp/ui@0.1.2...@liexp/ui@0.1.3) (2026-01-01)


### Bug Fixes

* **web:** keep only one fixed dimension for react-virutalized CellMeasurerCache ([#2961](https://github.com/lies-exposed/lies.exposed/issues/2961)) ([b5ae7aa](https://github.com/lies-exposed/lies.exposed/commit/b5ae7aab2a0994a289c1d789c1bceb83299d2f73))

## [0.1.2](https://github.com/lies-exposed/lies.exposed/compare/@liexp/ui@0.1.1...@liexp/ui@0.1.2) (2026-01-01)


### Miscellaneous

* **deps-dev:** bump @types/d3-sankey from 0.12.4 to 0.12.5 ([#2938](https://github.com/lies-exposed/lies.exposed/issues/2938)) ([07de970](https://github.com/lies-exposed/lies.exposed/commit/07de97005cfc29b05b869d7eb048aa25945c0553))
* **deps-dev:** bump @types/lodash from 4.17.20 to 4.17.21 ([#2939](https://github.com/lies-exposed/lies.exposed/issues/2939)) ([d027f03](https://github.com/lies-exposed/lies.exposed/commit/d027f033cf9a7c631e1434a23851d3cdc99dd3a4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/shared bumped to 0.1.2

## [0.1.1](https://github.com/lies-exposed/lies.exposed/compare/@liexp/ui@0.1.0...@liexp/ui@0.1.1) (2025-12-30)


### Miscellaneous

* **workspace:** bump the vite group across 8 directories with 2 updates ([#2894](https://github.com/lies-exposed/lies.exposed/issues/2894)) ([9b335af](https://github.com/lies-exposed/lies.exposed/commit/9b335afd53d543e8225464c7cb93d62986bb8b9b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.1
    * @liexp/shared bumped to 0.1.1
