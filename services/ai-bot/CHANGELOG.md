# Changelog

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...ai-bot@0.6.0) (2026-03-11)


### Features

* **ai-bot:** extract thumbnailUrl from link metadata and create media on job completion ([#3245](https://github.com/lies-exposed/lies.exposed/issues/3245)) ([fe15601](https://github.com/lies-exposed/lies.exposed/commit/fe15601b9909fbf9e9f069f6ff59ba7679263e8e))
* **ai-bot:** use agent via http API ([#2809](https://github.com/lies-exposed/lies.exposed/issues/2809)) ([657ec21](https://github.com/lies-exposed/lies.exposed/commit/657ec218a45c861b06eb74a00310c4770ec435a3))


### Bug Fixes

* **admin:** description with Tooltip for AI jobs ([#2994](https://github.com/lies-exposed/lies.exposed/issues/2994)) ([6b4847a](https://github.com/lies-exposed/lies.exposed/commit/6b4847a8f6383755e2d7bee57306db5b0287dc5a))
* **ai-bot:** add create event from multiple links feature ([#3098](https://github.com/lies-exposed/lies.exposed/issues/3098)) ([#3099](https://github.com/lies-exposed/lies.exposed/issues/3099)) ([8644ffc](https://github.com/lies-exposed/lies.exposed/commit/8644ffc883fd294e130cbcee3ef6865a9ca28628))
* **ai-bot:** create event from links prompt without json schema ([#3108](https://github.com/lies-exposed/lies.exposed/issues/3108)) ([60f47a7](https://github.com/lies-exposed/lies.exposed/commit/60f47a7bc94e5456843bc110fb9125c276f963ea))
* **ai-bot:** create event from links with json schema ([#3123](https://github.com/lies-exposed/lies.exposed/issues/3123)) ([6a90c81](https://github.com/lies-exposed/lies.exposed/commit/6a90c81da9d860589f336f3d930d011273a32e23))
* **ai-bot:** create event from url queue job ([#3015](https://github.com/lies-exposed/lies.exposed/issues/3015)) ([b5bf5f2](https://github.com/lies-exposed/lies.exposed/commit/b5bf5f25761d3326bf1e93d375192eea2858f72b))
* **ai-bot:** created custom strategy for effect-to-zod schema compatibility with NGrok ([#2824](https://github.com/lies-exposed/lies.exposed/issues/2824)) ([8b3a0bc](https://github.com/lies-exposed/lies.exposed/commit/8b3a0bcbd2902fb5b7552598281f344ccbe74600))
* **ai-bot:** flow to update multiple entities from a link ([#3214](https://github.com/lies-exposed/lies.exposed/issues/3214)) ([d36a398](https://github.com/lies-exposed/lies.exposed/commit/d36a3987a390da3e6c482e6f64bcb5f9025440e8))
* **ai-bot:** link metadata extraction and status filtering for admin  ([#3242](https://github.com/lies-exposed/lies.exposed/issues/3242)) ([8b2ce40](https://github.com/lies-exposed/lies.exposed/commit/8b2ce40aaf32c1c6798f282e49ff8e9e7335e015))
* **ai-bot:** remove loadDocs flow in favor of agent tools ([#3048](https://github.com/lies-exposed/lies.exposed/issues/3048)) ([144bb66](https://github.com/lies-exposed/lies.exposed/commit/144bb6671520d893e6f1975f995e589412f00838))
* **ai-bot:** update event flow with proper types and prompts ([#3025](https://github.com/lies-exposed/lies.exposed/issues/3025)) ([ba42afe](https://github.com/lies-exposed/lies.exposed/commit/ba42afef414865c5b70c902fb052e515a2d3ef6a))
* **backend:** added status to LinkEntity ([#3156](https://github.com/lies-exposed/lies.exposed/issues/3156)) ([71980bf](https://github.com/lies-exposed/lies.exposed/commit/71980bf2e401423c85cb1722e8cff338792b1864))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* io namespace imports ([#3216](https://github.com/lies-exposed/lies.exposed/issues/3216)) ([0efdfc6](https://github.com/lies-exposed/lies.exposed/commit/0efdfc67a6b43d34a874a3b6fda8169d10486948))
* **shared:** renamed Endpoints for agent to AgentEndpoints ([#3063](https://github.com/lies-exposed/lies.exposed/issues/3063)) ([5366305](https://github.com/lies-exposed/lies.exposed/commit/53663056c564a92b4ca01805f61edd849b000a26))
* **ui:** remove isLoading from OpenAIJobUtton ([#2997](https://github.com/lies-exposed/lies.exposed/issues/2997)) ([d873e4d](https://github.com/lies-exposed/lies.exposed/commit/d873e4d652d6b7194b5d94508c24cca503e50d71))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))


### Miscellaneous

* bump eslint and related deps ([fe055a8](https://github.com/lies-exposed/lies.exposed/commit/fe055a8b704f8fc8511d7b22cc04751d8f8fc9a0))
* bump langchain from 1.0.6 to 1.2.1 ([3168ffa](https://github.com/lies-exposed/lies.exposed/commit/3168ffa932bd0c34707e693acf6b570ac1298e88))
* bump openai from 5.23.2 to 6.15.0 ([#2877](https://github.com/lies-exposed/lies.exposed/issues/2877)) ([8390c5c](https://github.com/lies-exposed/lies.exposed/commit/8390c5c41129eff37310d13a97442b44e355acfc))
* bump pnpm from 10.23.0 to 10.26.0 ([db8bdc6](https://github.com/lies-exposed/lies.exposed/commit/db8bdc69b1816dd2845fb54b004689db98d09064))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* bump pnpm to 10.23.0 ([d4a6ef0](https://github.com/lies-exposed/lies.exposed/commit/d4a6ef073804068182a8796b58c47469503898a3))
* **core:** replaced deprecated tselint.config with defineConfig from eslint ([#2817](https://github.com/lies-exposed/lies.exposed/issues/2817)) ([0266861](https://github.com/lies-exposed/lies.exposed/commit/026686115f656ea842faea5924a29d1f486c8503))
* **deps:** bump pdfjs-dist from 5.4.149 to 5.4.530 ([#2941](https://github.com/lies-exposed/lies.exposed/issues/2941)) ([3b64984](https://github.com/lies-exposed/lies.exposed/commit/3b64984ce77017e64481035ce98ef3411980cbc7))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* errors refactor ([#3207](https://github.com/lies-exposed/lies.exposed/issues/3207)) ([ed74cee](https://github.com/lies-exposed/lies.exposed/commit/ed74ceea7c12764221f40d6f30f76c3a55e20373))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* moved queue implementation from fs to pg ([#3136](https://github.com/lies-exposed/lies.exposed/issues/3136)) ([5d9efc8](https://github.com/lies-exposed/lies.exposed/commit/5d9efc865751e6468b0e883a87005029f4e32802))
* refactor error logic ([#3129](https://github.com/lies-exposed/lies.exposed/issues/3129)) ([d04b8ff](https://github.com/lies-exposed/lies.exposed/commit/d04b8ffddb517d49feae3a22649e988bdc77658e))
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
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))
* **shared:** moved ai prompts from io package ([#3111](https://github.com/lies-exposed/lies.exposed/issues/3111)) ([3619422](https://github.com/lies-exposed/lies.exposed/commit/3619422b1c3d65cee35ca81a1e67a8afca91ac6f))
* **shared:** refactor event helpers ([#3067](https://github.com/lies-exposed/lies.exposed/issues/3067)) ([d9c5980](https://github.com/lies-exposed/lies.exposed/commit/d9c5980b68af7ca62f95b09922041613ac1e1677))
* solve knip report errors ([4fdf617](https://github.com/lies-exposed/lies.exposed/commit/4fdf617fbe7d464c64a104f38013a4d768e71f39))
* update release-please config for v0.1.0 releases ([#2898](https://github.com/lies-exposed/lies.exposed/issues/2898)) ([cd0acf9](https://github.com/lies-exposed/lies.exposed/commit/cd0acf915dab59cb25a40e7857223faca138c2fe))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
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

## [0.5.6](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.5...ai-bot@0.5.6) (2026-03-11)


### Miscellaneous

* **ai-bot:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.6
    * @liexp/core bumped to 0.5.6
    * @liexp/io bumped to 0.5.6
    * @liexp/shared bumped to 0.5.6
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.6

## [0.5.5](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.4...ai-bot@0.5.5) (2026-03-08)


### Miscellaneous

* **ai-bot:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.5
    * @liexp/core bumped to 0.5.5
    * @liexp/io bumped to 0.5.5
    * @liexp/shared bumped to 0.5.5
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.5

## [0.5.4](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.3...ai-bot@0.5.4) (2026-03-07)


### Miscellaneous

* **ai-bot:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.4
    * @liexp/core bumped to 0.5.4
    * @liexp/io bumped to 0.5.4
    * @liexp/shared bumped to 0.5.4
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.4

## [0.5.3](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.2...ai-bot@0.5.3) (2026-03-04)


### Miscellaneous

* **ai-bot:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.3
    * @liexp/core bumped to 0.5.3
    * @liexp/io bumped to 0.5.3
    * @liexp/shared bumped to 0.5.3
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.3

## [0.5.2](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.1...ai-bot@0.5.2) (2026-03-01)


### Miscellaneous

* **ai-bot:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.2
    * @liexp/core bumped to 0.5.2
    * @liexp/io bumped to 0.5.2
    * @liexp/shared bumped to 0.5.2
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.2

## [0.5.1](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.0...ai-bot@0.5.1) (2026-02-28)


### Miscellaneous

* **ai-bot:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.1
    * @liexp/core bumped to 0.5.1
    * @liexp/io bumped to 0.5.1
    * @liexp/shared bumped to 0.5.1
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.1

## [0.5.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.4.4...ai-bot@0.5.0) (2026-02-28)


### Features

* **ai-bot:** extract thumbnailUrl from link metadata and create media on job completion ([#3245](https://github.com/lies-exposed/lies.exposed/issues/3245)) ([fe15601](https://github.com/lies-exposed/lies.exposed/commit/fe15601b9909fbf9e9f069f6ff59ba7679263e8e))


### Bug Fixes

* **ai-bot:** link metadata extraction and status filtering for admin  ([#3242](https://github.com/lies-exposed/lies.exposed/issues/3242)) ([8b2ce40](https://github.com/lies-exposed/lies.exposed/commit/8b2ce40aaf32c1c6798f282e49ff8e9e7335e015))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.5.0
    * @liexp/core bumped to 0.5.0
    * @liexp/io bumped to 0.5.0
    * @liexp/shared bumped to 0.5.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.0

## [0.4.4](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.4.3...ai-bot@0.4.4) (2026-02-24)


### Miscellaneous

* **ai-bot:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.4.4
    * @liexp/core bumped to 0.4.4
    * @liexp/io bumped to 0.4.4
    * @liexp/shared bumped to 0.4.4
  * devDependencies
    * @liexp/eslint-config bumped to 0.4.4

## [0.4.3](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.4.2...ai-bot@0.4.3) (2026-02-22)


### Bug Fixes

* **ai-bot:** flow to update multiple entities from a link ([#3214](https://github.com/lies-exposed/lies.exposed/issues/3214)) ([d36a398](https://github.com/lies-exposed/lies.exposed/commit/d36a3987a390da3e6c482e6f64bcb5f9025440e8))
* **backend:** added status to LinkEntity ([#3156](https://github.com/lies-exposed/lies.exposed/issues/3156)) ([71980bf](https://github.com/lies-exposed/lies.exposed/commit/71980bf2e401423c85cb1722e8cff338792b1864))
* io namespace imports ([#3216](https://github.com/lies-exposed/lies.exposed/issues/3216)) ([0efdfc6](https://github.com/lies-exposed/lies.exposed/commit/0efdfc67a6b43d34a874a3b6fda8169d10486948))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.4.3
    * @liexp/core bumped to 0.4.3
    * @liexp/io bumped to 0.4.3
    * @liexp/shared bumped to 0.4.3
  * devDependencies
    * @liexp/eslint-config bumped to 0.4.3

## [0.4.2](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.4.1...ai-bot@0.4.2) (2026-02-19)


### Miscellaneous

* **ai-bot:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.4.2
    * @liexp/core bumped to 0.4.2
    * @liexp/io bumped to 0.4.2
    * @liexp/shared bumped to 0.4.2
  * devDependencies
    * @liexp/eslint-config bumped to 0.4.2

## [0.4.1](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.4.0...ai-bot@0.4.1) (2026-02-18)


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

## [0.4.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.3.0...ai-bot@0.4.0) (2026-02-15)


### Miscellaneous

* **ai-bot:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.4.0
    * @liexp/core bumped to 0.4.0
    * @liexp/io bumped to 0.4.0
    * @liexp/shared bumped to 0.4.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.4.0

## [0.3.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.2.5...ai-bot@0.3.0) (2026-02-11)


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

## [0.2.5](https://github.com/lies-exposed/lies.exposed/compare/ai-bot@0.1.12...ai-bot@0.2.5) (2026-01-30)


### Miscellaneous

* **ai-bot:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.2.5
    * @liexp/core bumped to 0.2.5
    * @liexp/io bumped to 0.2.5
    * @liexp/shared bumped to 0.2.5
  * devDependencies
    * @liexp/eslint-config bumped to 0.2.5

## [0.1.12](https://github.com/lies-exposed/lies.exposed/compare/ai-bot@0.1.11...ai-bot@0.1.12) (2026-01-28)


### Miscellaneous

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

## [0.1.11](https://github.com/lies-exposed/lies.exposed/compare/ai-bot@0.1.10...ai-bot@0.1.11) (2026-01-24)


### Bug Fixes

* **ai-bot:** create event from links with json schema ([#3123](https://github.com/lies-exposed/lies.exposed/issues/3123)) ([6a90c81](https://github.com/lies-exposed/lies.exposed/commit/6a90c81da9d860589f336f3d930d011273a32e23))
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

## [0.1.10](https://github.com/lies-exposed/lies.exposed/compare/ai-bot@0.1.9...ai-bot@0.1.10) (2026-01-23)


### Bug Fixes

* **ai-bot:** create event from links prompt without json schema ([#3108](https://github.com/lies-exposed/lies.exposed/issues/3108)) ([60f47a7](https://github.com/lies-exposed/lies.exposed/commit/60f47a7bc94e5456843bc110fb9125c276f963ea))


### Miscellaneous

* **shared:** moved ai prompts from io package ([#3111](https://github.com/lies-exposed/lies.exposed/issues/3111)) ([3619422](https://github.com/lies-exposed/lies.exposed/commit/3619422b1c3d65cee35ca81a1e67a8afca91ac6f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.10
    * @liexp/io bumped to 0.2.2
    * @liexp/shared bumped to 0.2.2

## [0.1.9](https://github.com/lies-exposed/lies.exposed/compare/ai-bot@0.1.8...ai-bot@0.1.9) (2026-01-21)


### Bug Fixes

* **ai-bot:** add create event from multiple links feature ([#3098](https://github.com/lies-exposed/lies.exposed/issues/3098)) ([#3099](https://github.com/lies-exposed/lies.exposed/issues/3099)) ([8644ffc](https://github.com/lies-exposed/lies.exposed/commit/8644ffc883fd294e130cbcee3ef6865a9ca28628))


### Miscellaneous

* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.9
    * @liexp/io bumped to 0.2.1
    * @liexp/shared bumped to 0.2.1

## [0.1.8](https://github.com/lies-exposed/lies.exposed/compare/ai-bot@0.1.7...ai-bot@0.1.8) (2026-01-19)


### Bug Fixes

* **ai-bot:** remove loadDocs flow in favor of agent tools ([#3048](https://github.com/lies-exposed/lies.exposed/issues/3048)) ([144bb66](https://github.com/lies-exposed/lies.exposed/commit/144bb6671520d893e6f1975f995e589412f00838))
* **shared:** renamed Endpoints for agent to AgentEndpoints ([#3063](https://github.com/lies-exposed/lies.exposed/issues/3063)) ([5366305](https://github.com/lies-exposed/lies.exposed/commit/53663056c564a92b4ca01805f61edd849b000a26))


### Miscellaneous

* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* **shared:** refactor event helpers ([#3067](https://github.com/lies-exposed/lies.exposed/issues/3067)) ([d9c5980](https://github.com/lies-exposed/lies.exposed/commit/d9c5980b68af7ca62f95b09922041613ac1e1677))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.8
    * @liexp/core bumped to 0.1.4
    * @liexp/shared bumped to 0.2.0

## [0.1.7](https://github.com/lies-exposed/lies.exposed/compare/ai-bot@0.1.6...ai-bot@0.1.7) (2026-01-11)


### Bug Fixes

* **ai-bot:** update event flow with proper types and prompts ([#3025](https://github.com/lies-exposed/lies.exposed/issues/3025)) ([ba42afe](https://github.com/lies-exposed/lies.exposed/commit/ba42afef414865c5b70c902fb052e515a2d3ef6a))


### Miscellaneous

* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.7
    * @liexp/core bumped to 0.1.3
    * @liexp/shared bumped to 0.1.7

## [0.1.6](https://github.com/lies-exposed/lies.exposed/compare/ai-bot@0.1.5...ai-bot@0.1.6) (2026-01-07)


### Bug Fixes

* **ai-bot:** create event from url queue job ([#3015](https://github.com/lies-exposed/lies.exposed/issues/3015)) ([b5bf5f2](https://github.com/lies-exposed/lies.exposed/commit/b5bf5f25761d3326bf1e93d375192eea2858f72b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.6
    * @liexp/shared bumped to 0.1.6

## [0.1.5](https://github.com/lies-exposed/lies.exposed/compare/ai-bot@0.1.4...ai-bot@0.1.5) (2026-01-05)


### Bug Fixes

* **admin:** description with Tooltip for AI jobs ([#2994](https://github.com/lies-exposed/lies.exposed/issues/2994)) ([6b4847a](https://github.com/lies-exposed/lies.exposed/commit/6b4847a8f6383755e2d7bee57306db5b0287dc5a))
* **ui:** remove isLoading from OpenAIJobUtton ([#2997](https://github.com/lies-exposed/lies.exposed/issues/2997)) ([d873e4d](https://github.com/lies-exposed/lies.exposed/commit/d873e4d652d6b7194b5d94508c24cca503e50d71))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.5
    * @liexp/shared bumped to 0.1.5

## [0.1.4](https://github.com/lies-exposed/lies.exposed/compare/ai-bot@0.1.3...ai-bot@0.1.4) (2026-01-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.4
    * @liexp/shared bumped to 0.1.4

## [0.1.3](https://github.com/lies-exposed/lies.exposed/compare/ai-bot@0.1.2...ai-bot@0.1.3) (2026-01-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.3
    * @liexp/core bumped to 0.1.2
    * @liexp/shared bumped to 0.1.3

## [0.1.2](https://github.com/lies-exposed/lies.exposed/compare/ai-bot@0.1.1...ai-bot@0.1.2) (2026-01-01)


### Miscellaneous

* **deps:** bump pdfjs-dist from 5.4.149 to 5.4.530 ([#2941](https://github.com/lies-exposed/lies.exposed/issues/2941)) ([3b64984](https://github.com/lies-exposed/lies.exposed/commit/3b64984ce77017e64481035ce98ef3411980cbc7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.2
    * @liexp/shared bumped to 0.1.2

## [0.1.1](https://github.com/lies-exposed/lies.exposed/compare/ai-bot@0.1.0...ai-bot@0.1.1) (2025-12-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.1.1
    * @liexp/core bumped to 0.1.1
    * @liexp/shared bumped to 0.1.1
