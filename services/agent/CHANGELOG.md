# Changelog

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...agent@0.6.0) (2026-03-11)


### Features

* **admin:** implement frontend proxy integration (Phase 2) ([#2842](https://github.com/lies-exposed/lies.exposed/issues/2842)) ([1b9f2f7](https://github.com/lies-exposed/lies.exposed/commit/1b9f2f7271882863885e4ffb27b99c7e18f03252))
* **admin:** setup server ([#2840](https://github.com/lies-exposed/lies.exposed/issues/2840)) ([ea5d01d](https://github.com/lies-exposed/lies.exposed/commit/ea5d01d7b8d10423c2632dcb9611ad4f57bf70c5))
* **agent:** retry MCP initializeConnections on startup failure ([#3189](https://github.com/lies-exposed/lies.exposed/issues/3189)) ([23e1510](https://github.com/lies-exposed/lies.exposed/commit/23e151065c2b51034ea4d9df3bca058685ca09af))
* **agent:** streamable chat endpoint ([#2845](https://github.com/lies-exposed/lies.exposed/issues/2845)) ([c7376ca](https://github.com/lies-exposed/lies.exposed/commit/c7376caab780cd66d3e7116471fbd6dd7fb2484a))
* **ai-bot:** use agent via http API ([#2809](https://github.com/lies-exposed/lies.exposed/issues/2809)) ([657ec21](https://github.com/lies-exposed/lies.exposed/commit/657ec218a45c861b06eb74a00310c4770ec435a3))


### Bug Fixes

* **admin:** chat  tools and messages stream and UI adjustments ([#2981](https://github.com/lies-exposed/lies.exposed/issues/2981)) ([faa9068](https://github.com/lies-exposed/lies.exposed/commit/faa9068fdac40812d72d7c3661e6fa16aa8e2d5a))
* **agent:** add story CLI command group with spec tests ([#3351](https://github.com/lies-exposed/lies.exposed/issues/3351)) ([03aae78](https://github.com/lies-exposed/lies.exposed/commit/03aae782b20021988a19384bc0cd609c7e288e56))
* **agent:** agent supervisor ([#3344](https://github.com/lies-exposed/lies.exposed/issues/3344)) ([723675e](https://github.com/lies-exposed/lies.exposed/commit/723675e1f5b2e0c5474c40944239cf6b8b9cb9b7))
* **agent:** cli events sub-command ([#3370](https://github.com/lies-exposed/lies.exposed/issues/3370)) ([c615dc8](https://github.com/lies-exposed/lies.exposed/commit/c615dc8dbcbfde9cb8671f1c763eceda01472bb2))
* **agent:** improve CLI error visibility and IOError formatting ([#3366](https://github.com/lies-exposed/lies.exposed/issues/3366)) ([98b0cf4](https://github.com/lies-exposed/lies.exposed/commit/98b0cf430403f39d80216edb78c913999f49a2a9))
* **agent:** include RESEARCHER.md in Docker image ([#3359](https://github.com/lies-exposed/lies.exposed/issues/3359)) ([f8469df](https://github.com/lies-exposed/lies.exposed/commit/f8469df06c14b63c65f3fa795cc562582f0f3875))
* **agent:** increase chat stream recursion limit from 25 to 50 ([#3363](https://github.com/lies-exposed/lies.exposed/issues/3363)) ([4cf3cb2](https://github.com/lies-exposed/lies.exposed/commit/4cf3cb2d8a479c9949cabdb04d442676c2553e07))
* **agent:** multiprovider AI agent configuration ([#3206](https://github.com/lies-exposed/lies.exposed/issues/3206)) ([06920b4](https://github.com/lies-exposed/lies.exposed/commit/06920b4bf246b7c22f5c5acc9f9cd8b4909a1e13))
* **agent:** provide cli tools to access platform resources ([#3332](https://github.com/lies-exposed/lies.exposed/issues/3332)) ([6ba161f](https://github.com/lies-exposed/lies.exposed/commit/6ba161fcc9dc132fdedc9d3b81a8b3432325dfc6))
* **agent:** provide searchWebTools in agent service ([#3045](https://github.com/lies-exposed/lies.exposed/issues/3045)) ([1191a71](https://github.com/lies-exposed/lies.exposed/commit/1191a713da3eb66fa59f4ce275fc7f6e88a47693))
* **agent:** reconnect to api MCP server automatically on fail ([#3002](https://github.com/lies-exposed/lies.exposed/issues/3002)) ([343d2cc](https://github.com/lies-exposed/lies.exposed/commit/343d2ccc6e219294b1da61473c57b48794a475d7))
* **agent:** support Anthropic AI provider ([#3115](https://github.com/lies-exposed/lies.exposed/issues/3115)) ([2952200](https://github.com/lies-exposed/lies.exposed/commit/29522002dc161e57dbac13af0e9c317a839cb4c5))
* **ai-bot:** created custom strategy for effect-to-zod schema compatibility with NGrok ([#2824](https://github.com/lies-exposed/lies.exposed/issues/2824)) ([8b3a0bc](https://github.com/lies-exposed/lies.exposed/commit/8b3a0bcbd2902fb5b7552598281f344ccbe74600))
* **api:** actor tools schema 'memberId' and 'nationalities' possibly undefined ([#3209](https://github.com/lies-exposed/lies.exposed/issues/3209)) ([03dd92a](https://github.com/lies-exposed/lies.exposed/commit/03dd92ae28f31a17248feba550ca6365eae68083))
* **api:** added create and edit tools for every event type ([#2851](https://github.com/lies-exposed/lies.exposed/issues/2851)) ([f5e42a4](https://github.com/lies-exposed/lies.exposed/commit/f5e42a4ee39e3cebf5920daa873f1ac00f725b2e))
* **backend:** added brave provider for web searches ([#3044](https://github.com/lies-exposed/lies.exposed/issues/3044)) ([e1723b5](https://github.com/lies-exposed/lies.exposed/commit/e1723b5869cc4745cb885f0b3cab463863adc0f4))
* chat providers and prompts ([#3208](https://github.com/lies-exposed/lies.exposed/issues/3208)) ([db9dbde](https://github.com/lies-exposed/lies.exposed/commit/db9dbdee889a3de0f8a358cb42d3090a305de07b))
* **core:** fix dotenv v17 ESM resolution in Vite config bundler ([#3327](https://github.com/lies-exposed/lies.exposed/issues/3327)) ([84843e1](https://github.com/lies-exposed/lies.exposed/commit/84843e112e774248d294a2afd85704258bd39d51))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* **io:** make url optional in EditLink schema ([#3362](https://github.com/lies-exposed/lies.exposed/issues/3362)) ([2fae15a](https://github.com/lies-exposed/lies.exposed/commit/2fae15a6d96945a10ef9654f3bdff5672293339f))
* mcp tools ([#3188](https://github.com/lies-exposed/lies.exposed/issues/3188)) ([3b9a8ce](https://github.com/lies-exposed/lies.exposed/commit/3b9a8ceefe7ee7510820d039a3fea4de29f58cbd))
* **shared:** renamed Endpoints for agent to AgentEndpoints ([#3063](https://github.com/lies-exposed/lies.exposed/issues/3063)) ([5366305](https://github.com/lies-exposed/lies.exposed/commit/53663056c564a92b4ca01805f61edd849b000a26))
* **shared:** use proper common codecs for CLI schemas ([#3371](https://github.com/lies-exposed/lies.exposed/issues/3371)) ([e237ee5](https://github.com/lies-exposed/lies.exposed/commit/e237ee5d6acae99f49117459e4f23ce63ce913d0))
* **shared:** use proper UUID codec for relation ids in MCP schemas ([#3369](https://github.com/lies-exposed/lies.exposed/issues/3369)) ([e5f02c6](https://github.com/lies-exposed/lies.exposed/commit/e5f02c64de8c23611ba9269d66a34ecd3c3779a4))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))


### Miscellaneous

* **agent:** added @langchain/xai dep ([a81eb88](https://github.com/lies-exposed/lies.exposed/commit/a81eb8894b1396c48d81d594fb64ad5ec6420920))
* **agent:** added e2e test for chat stream endpoint ([#3109](https://github.com/lies-exposed/lies.exposed/issues/3109)) ([ec1ea38](https://github.com/lies-exposed/lies.exposed/commit/ec1ea3807265b573f4677733bbdf0ebf022c9ba5))
* **agent:** use [@ts-endpoint](https://github.com/ts-endpoint) stream endpoint definition ([#3112](https://github.com/lies-exposed/lies.exposed/issues/3112)) ([52c265d](https://github.com/lies-exposed/lies.exposed/commit/52c265d95ac581d7f61a17da19ed9cdf71833ae7))
* **api:** removed puppeteer and puppeteer-extra deps and dead code ([#3149](https://github.com/lies-exposed/lies.exposed/issues/3149)) ([1a6ddab](https://github.com/lies-exposed/lies.exposed/commit/1a6ddabb6a28d42727b94954035f197b4f3646e5))
* bump eslint and related deps ([fe055a8](https://github.com/lies-exposed/lies.exposed/commit/fe055a8b704f8fc8511d7b22cc04751d8f8fc9a0))
* bump express to 5.2.1 ([d6d4c18](https://github.com/lies-exposed/lies.exposed/commit/d6d4c1885140e00846836e908f321ab9bb5f18e5))
* bump langchain from 1.0.6 to 1.2.1 ([3168ffa](https://github.com/lies-exposed/lies.exposed/commit/3168ffa932bd0c34707e693acf6b570ac1298e88))
* bump pnpm from 10.23.0 to 10.26.0 ([db8bdc6](https://github.com/lies-exposed/lies.exposed/commit/db8bdc69b1816dd2845fb54b004689db98d09064))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* bump pnpm to 10.23.0 ([d4a6ef0](https://github.com/lies-exposed/lies.exposed/commit/d4a6ef073804068182a8796b58c47469503898a3))
* **core:** replaced deprecated tselint.config with defineConfig from eslint ([#2817](https://github.com/lies-exposed/lies.exposed/issues/2817)) ([0266861](https://github.com/lies-exposed/lies.exposed/commit/026686115f656ea842faea5924a29d1f486c8503))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* errors refactor ([#3207](https://github.com/lies-exposed/lies.exposed/issues/3207)) ([ed74cee](https://github.com/lies-exposed/lies.exposed/commit/ed74ceea7c12764221f40d6f30f76c3a55e20373))
* increase agent chat timeout to 3min ([#3195](https://github.com/lies-exposed/lies.exposed/issues/3195)) ([0bf8c1a](https://github.com/lies-exposed/lies.exposed/commit/0bf8c1ade90c17654a9d4d8fd0229439287102f2))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* release  0.1.1 ([#2923](https://github.com/lies-exposed/lies.exposed/issues/2923)) ([a027e30](https://github.com/lies-exposed/lies.exposed/commit/a027e304508b1f02bad1db62d7471a8e0cd145ec))
* release  0.1.10 ([#3087](https://github.com/lies-exposed/lies.exposed/issues/3087)) ([533f416](https://github.com/lies-exposed/lies.exposed/commit/533f4165ee50af12d73fa1d6e36d43acd76957ee))
* release  0.1.11 ([#3110](https://github.com/lies-exposed/lies.exposed/issues/3110)) ([c90911d](https://github.com/lies-exposed/lies.exposed/commit/c90911d8a868e10c76b5c1204c3d9b6c89cd09fe))
* release  0.1.12 ([#3119](https://github.com/lies-exposed/lies.exposed/issues/3119)) ([f68b50a](https://github.com/lies-exposed/lies.exposed/commit/f68b50a33f518bdaf2cc1f0e6bbd3d610a1245a2))
* release  0.1.13 ([#3128](https://github.com/lies-exposed/lies.exposed/issues/3128)) ([12031de](https://github.com/lies-exposed/lies.exposed/commit/12031deda14ae5873eafbfddc46df96bf0f1f595))
* release  0.1.2 ([#2930](https://github.com/lies-exposed/lies.exposed/issues/2930)) ([c8bd7a9](https://github.com/lies-exposed/lies.exposed/commit/c8bd7a994c3f114807b00b8855a495e467dcf735))
* release  0.1.4 ([#2964](https://github.com/lies-exposed/lies.exposed/issues/2964)) ([f506ebf](https://github.com/lies-exposed/lies.exposed/commit/f506ebfaea62f600e83be963ae872efba9c14917))
* release  0.1.5 ([#2975](https://github.com/lies-exposed/lies.exposed/issues/2975)) ([e674ffb](https://github.com/lies-exposed/lies.exposed/commit/e674ffb193fb2d78ee1762433d371cbe87725879))
* release  0.1.6 ([#2989](https://github.com/lies-exposed/lies.exposed/issues/2989)) ([f3a692b](https://github.com/lies-exposed/lies.exposed/commit/f3a692bc267c1c4d168c9bc02df5c307679dc843))
* release  0.1.7 ([#2999](https://github.com/lies-exposed/lies.exposed/issues/2999)) ([7b73dce](https://github.com/lies-exposed/lies.exposed/commit/7b73dce7b5e5aa202d8d972019f4676249ed7d54))
* release  0.1.8 ([#3026](https://github.com/lies-exposed/lies.exposed/issues/3026)) ([857453b](https://github.com/lies-exposed/lies.exposed/commit/857453b8c1b3960513723ab18b729a590cfe9dd6))
* release  0.1.9 ([#3047](https://github.com/lies-exposed/lies.exposed/issues/3047)) ([afa22b6](https://github.com/lies-exposed/lies.exposed/commit/afa22b62a34af2fe0d36f44e4e97ebeb450b3224))
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* removed 'project' property from languageOptions.parserOptions in favor of 'projectService' ([be5db76](https://github.com/lies-exposed/lies.exposed/commit/be5db7664d703373013ca82b6dcbb849a088ddad))
* server logging of error details ([3eda9ba](https://github.com/lies-exposed/lies.exposed/commit/3eda9ba06e3bbb9f2b0f986383b1d610652464ff))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))
* solve knip report errors ([4fdf617](https://github.com/lies-exposed/lies.exposed/commit/4fdf617fbe7d464c64a104f38013a4d768e71f39))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
* **workspace:** disable type generation for services build ([#3224](https://github.com/lies-exposed/lies.exposed/issues/3224)) ([4dc573f](https://github.com/lies-exposed/lies.exposed/commit/4dc573f90a5963d2784ecfc460647ad260828194))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.6.0
    * @liexp/core bumped to 0.6.0
    * @liexp/io bumped to 0.6.0
    * @liexp/shared bumped to 0.6.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.6.0
    * @liexp/test bumped to 0.6.0

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
