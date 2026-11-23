:robot: I have created a release *beep* *boop*
---


<details><summary>@liexp/backend: 0.9.0</summary>

## [0.9.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.8.0...@liexp/backend@0.9.0) (2026-11-23)


### Features

* **agent,admin:** report AI chat errors to Sentry ([#4017](https://github.com/lies-exposed/lies.exposed/issues/4017)) ([3867eb6](https://github.com/lies-exposed/lies.exposed/commit/3867eb6acaec6c3a5f3b350c213b83bfbb564e5f))
* **agent:** persist admin chat conversations in Postgres ([#4185](https://github.com/lies-exposed/lies.exposed/issues/4185)) ([5182e84](https://github.com/lies-exposed/lies.exposed/commit/5182e84576f634ab659a4ef36d739350d1b557bf))
* **agent:** use API MCP tools, drop liexp_cli; chat UI sticky scroll + regenerate ([#4154](https://github.com/lies-exposed/lies.exposed/issues/4154)) ([f2e81dd](https://github.com/lies-exposed/lies.exposed/commit/f2e81dd4a9a704cd59412adfd8a954463fce76e1))
* **api:** add createGroupMember MCP tool ([#4180](https://github.com/lies-exposed/lies.exposed/issues/4180)) ([9a014d1](https://github.com/lies-exposed/lies.exposed/commit/9a014d1bd4899e8e2692680db5c37fe85de3fa7f))
* **api:** add Event MCP tools (find, create, edit) ([#4003](https://github.com/lies-exposed/lies.exposed/issues/4003)) ([19717dc](https://github.com/lies-exposed/lies.exposed/commit/19717dc47f1056151d91c0fdf87d641951f1baf1))
* **api:** add Keyword MCP CRUD tools (findKeywords, createKeyword, editKeyword) ([#4041](https://github.com/lies-exposed/lies.exposed/issues/4041)) ([414eca8](https://github.com/lies-exposed/lies.exposed/commit/414eca88e9951e512f3d44e4409954422f30227e))
* **api:** add MCP tools for link CRUD operations ([#4002](https://github.com/lies-exposed/lies.exposed/issues/4002)) ([196eab9](https://github.com/lies-exposed/lies.exposed/commit/196eab94920ff19285e679bf3f26a8cbe29275e1))
* **api:** add Media MCP CRUD tools (findMedia, createMedia, editMedia) ([#4026](https://github.com/lies-exposed/lies.exposed/issues/4026)) ([fadc053](https://github.com/lies-exposed/lies.exposed/commit/fadc0536e73b6f0a72cdd9cf312c4a3e671e91ac))
* **api:** add Setting MCP CRUD tools (findSettings, createSetting, editSetting) ([#4018](https://github.com/lies-exposed/lies.exposed/issues/4018)) ([412583d](https://github.com/lies-exposed/lies.exposed/commit/412583dcf28c71d65b173766bb0f5242e59a5605))
* **api:** add Story MCP CRUD tools (findStories, createStory, editStory) ([#4027](https://github.com/lies-exposed/lies.exposed/issues/4027)) ([f6a3736](https://github.com/lies-exposed/lies.exposed/commit/f6a3736f0a1c1b3a708f4a527e2b6070146be5a8))
* **api:** wire up all MCP tool registration and constants ([#4011](https://github.com/lies-exposed/lies.exposed/issues/4011)) ([a1f699f](https://github.com/lies-exposed/lies.exposed/commit/a1f699f7b9ecc6e51d72a96ccffd252097b189d1))
* **mcp:** add actor CRUD tools (find, create, edit) ([#4004](https://github.com/lies-exposed/lies.exposed/issues/4004)) ([6bb0aba](https://github.com/lies-exposed/lies.exposed/commit/6bb0aba9ccb2158ac17e8cbe42eda4fc83d0b213))
* **mcp:** add Area CRUD tools (findAreas, createArea, editArea) ([#4023](https://github.com/lies-exposed/lies.exposed/issues/4023)) ([3b0240e](https://github.com/lies-exposed/lies.exposed/commit/3b0240e2d1aa3e3ec423e34b9713c691f3ec6175))
* **react:** migrate monorepo to React 19 ([#4183](https://github.com/lies-exposed/lies.exposed/issues/4183)) ([b00e204](https://github.com/lies-exposed/lies.exposed/commit/b00e2042d4215efb07872a444754cb14764fa711))


### Bug Fixes

* **agent,backend:** replace any casts with typed generics and type guards ([#4029](https://github.com/lies-exposed/lies.exposed/issues/4029)) ([2cde5a5](https://github.com/lies-exposed/lies.exposed/commit/2cde5a5f4ed8fd6830cafd8846490c6196667205))
* **agent:** recover MCP sessions & degrade chat turns instead of UNKNOWN errors (HOM-1599) ([#4192](https://github.com/lies-exposed/lies.exposed/issues/4192)) ([a959bb5](https://github.com/lies-exposed/lies.exposed/commit/a959bb56fe2970af8c83772d1853e1cd2d98f496))
* **api:** close token-login bypass, rate limit login, scope POST /media, attribute MCP media ([#4114](https://github.com/lies-exposed/lies.exposed/issues/4114)) ([d58b1bb](https://github.com/lies-exposed/lies.exposed/commit/d58b1bb0355ac9349dab05083976b65cbf8dc02d))
* **api:** remove as any[] casts in media/links controllers ([#4022](https://github.com/lies-exposed/lies.exposed/issues/4022)) ([3e23277](https://github.com/lies-exposed/lies.exposed/commit/3e23277bd35972c0ff48d343bdbe7a6e506353eb))
* **backend:** date-safe ISO helpers for media IO decode/encode (HOM-1597 API-4) ([#4190](https://github.com/lies-exposed/lies.exposed/issues/4190)) ([2618a2d](https://github.com/lies-exposed/lies.exposed/commit/2618a2daba0b9058d59e7715fd50dcc831919a12))
* **backend:** decode media keywords as ids and retry 429 in accessibility check ([#4170](https://github.com/lies-exposed/lies.exposed/issues/4170)) ([25ed17b](https://github.com/lies-exposed/lies.exposed/commit/25ed17b21deeeec1442e41e804c4b7ccae350be7))
* **backend:** handle string bornOn/diedOn in actor relation tree ([#4172](https://github.com/lies-exposed/lies.exposed/issues/4172)) ([86cf413](https://github.com/lies-exposed/lies.exposed/commit/86cf4132e8f36ca0a390ee45bba68ba6427d5042))
* **backend:** pass Telegram API root as Bot constructor option ([#3989](https://github.com/lies-exposed/lies.exposed/issues/3989)) ([212981c](https://github.com/lies-exposed/lies.exposed/commit/212981c2134621fcd50371890bd373353a4278af))
* **backend:** remove remaining production any casts (tail B) ([#4159](https://github.com/lies-exposed/lies.exposed/issues/4159)) ([f5aebb1](https://github.com/lies-exposed/lies.exposed/commit/f5aebb156fea5a40e640ce46c2706b0b74b3bc1c))
* **backend:** type AI/social provider casts (HOM-1567 WS60) ([#4168](https://github.com/lies-exposed/lies.exposed/issues/4168)) ([b7bbd04](https://github.com/lies-exposed/lies.exposed/commit/b7bbd047b24aa39f6e087d2d60bc95a9c5c82978))
* **backend:** type prod flows & utils casts (HOM-1568 WS61A) ([#4193](https://github.com/lies-exposed/lies.exposed/issues/4193)) ([1eb1da8](https://github.com/lies-exposed/lies.exposed/commit/1eb1da80483dfff64b97603e54a128ed1177fa95))
* **backend:** type prod middleware/utils/test-context B (HOM-1569 WS62) ([#4171](https://github.com/lies-exposed/lies.exposed/issues/4171)) ([b370f48](https://github.com/lies-exposed/lies.exposed/commit/b370f4846c44482b07e5a1dcedffc110c2baa717))
* **backend:** type URLMetadata options, puppeteer onEval&lt;T&gt;, ORM casts ([#4031](https://github.com/lies-exposed/lies.exposed/issues/4031)) ([8b1f71f](https://github.com/lies-exposed/lies.exposed/commit/8b1f71f27431f9a965fda59806545ce921712c92))


### Miscellaneous

* **admin:** eliminate remaining any casts in admin package ([#4103](https://github.com/lies-exposed/lies.exposed/issues/4103)) ([8f49cc1](https://github.com/lies-exposed/lies.exposed/commit/8f49cc147aa6bc2fb57fd55ebfe1fea2d26429cf))
* **backend:** added missing spec tests ([#3656](https://github.com/lies-exposed/lies.exposed/issues/3656)) ([7278063](https://github.com/lies-exposed/lies.exposed/commit/7278063b2be9dd02472257f0a7d199816cf45aed))
* **backend:** linting errors ([#4035](https://github.com/lies-exposed/lies.exposed/issues/4035)) ([5efaaf3](https://github.com/lies-exposed/lies.exposed/commit/5efaaf3256cb9257153a2b854f775462349b7a3a))
* **backend:** remove any casts in express/io/providers/services (HOM-1435) ([#4119](https://github.com/lies-exposed/lies.exposed/issues/4119)) ([f8bf784](https://github.com/lies-exposed/lies.exposed/commit/f8bf7842b4893d1705dc9f570f8febb8f5e5571f))
* **deps:** update msw from v2 to v3 ([#4007](https://github.com/lies-exposed/lies.exposed/issues/4007)) ([164e025](https://github.com/lies-exposed/lies.exposed/commit/164e02570ff4f7f609eb64bf189421e63643deb7))
* fix build and lint errors from [#4032](https://github.com/lies-exposed/lies.exposed/issues/4032)/[#4033](https://github.com/lies-exposed/lies.exposed/issues/4033) ([#4059](https://github.com/lies-exposed/lies.exposed/issues/4059)) ([ae56e7d](https://github.com/lies-exposed/lies.exposed/commit/ae56e7d85cf545d523109c6885d942345d464594))
* solved 'as any' errors ([#4105](https://github.com/lies-exposed/lies.exposed/issues/4105)) ([6cba6f3](https://github.com/lies-exposed/lies.exposed/commit/6cba6f31fbe74ea1569f956051d807674485a10a))
* update dev dependencies and remove eslint-disable comments ([#4110](https://github.com/lies-exposed/lies.exposed/issues/4110)) ([7beb247](https://github.com/lies-exposed/lies.exposed/commit/7beb2472dc06a4260ce3c474921ee3ed401fdd83))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.9.0
    * @liexp/io bumped to 0.9.0
    * @liexp/shared bumped to 0.9.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.9.0
    * @liexp/test bumped to 0.9.0
</details>

<details><summary>@liexp/core: 0.9.0</summary>

## [0.9.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.8.0...@liexp/core@0.9.0) (2026-11-23)


### Bug Fixes

* **core,admin,web,worker,ai-bot:** replace any with specific types across 22 files ([#4033](https://github.com/lies-exposed/lies.exposed/issues/4033)) ([fa982da](https://github.com/lies-exposed/lies.exposed/commit/fa982da449f43e23eead3f1d6494b79c748516de))
* **io,core,test,agent:** type remaining any casts (HOM-1578 WS71) ([#4182](https://github.com/lies-exposed/lies.exposed/issues/4182)) ([b341f96](https://github.com/lies-exposed/lies.exposed/commit/b341f96c24f5c52002fd3dcf8eb0f115150d8245))


### Miscellaneous

* addressed errors reported by 'pnpm peers check' ([#4166](https://github.com/lies-exposed/lies.exposed/issues/4166)) ([b97fc8e](https://github.com/lies-exposed/lies.exposed/commit/b97fc8eb1529d79602c6e376ccdfcf40fc4d5153))
* fix build and lint errors from [#4032](https://github.com/lies-exposed/lies.exposed/issues/4032)/[#4033](https://github.com/lies-exposed/lies.exposed/issues/4033) ([#4059](https://github.com/lies-exposed/lies.exposed/issues/4059)) ([ae56e7d](https://github.com/lies-exposed/lies.exposed/commit/ae56e7d85cf545d523109c6885d942345d464594))
* update dev dependencies and remove eslint-disable comments ([#4110](https://github.com/lies-exposed/lies.exposed/issues/4110)) ([7beb247](https://github.com/lies-exposed/lies.exposed/commit/7beb2472dc06a4260ce3c474921ee3ed401fdd83))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @liexp/eslint-config bumped to 0.9.0
</details>

<details><summary>@liexp/eslint-config: 0.9.0</summary>

## [0.9.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.8.0...@liexp/eslint-config@0.9.0) (2026-11-23)


### Miscellaneous

* **eslint-config:** enable no-explicit-any as error (no suppressions) ([#4165](https://github.com/lies-exposed/lies.exposed/issues/4165)) ([20106a5](https://github.com/lies-exposed/lies.exposed/commit/20106a5c946e2745f1089e9510a4cc1e06dc877e))
* **eslint-config:** warn for 'as any' in test files ([#4145](https://github.com/lies-exposed/lies.exposed/issues/4145)) ([beff45b](https://github.com/lies-exposed/lies.exposed/commit/beff45b917f407bc8b7788366b0e062be4855a96))
* update dev dependencies and remove eslint-disable comments ([#4110](https://github.com/lies-exposed/lies.exposed/issues/4110)) ([7beb247](https://github.com/lies-exposed/lies.exposed/commit/7beb2472dc06a4260ce3c474921ee3ed401fdd83))
</details>

<details><summary>@liexp/io: 0.9.0</summary>

## [0.9.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.8.0...@liexp/io@0.9.0) (2026-11-23)


### Features

* **agent,admin:** report AI chat errors to Sentry ([#4017](https://github.com/lies-exposed/lies.exposed/issues/4017)) ([3867eb6](https://github.com/lies-exposed/lies.exposed/commit/3867eb6acaec6c3a5f3b350c213b83bfbb564e5f))
* **agent:** target rhino-coder, fix memory scope and reasoning/token handling ([#4151](https://github.com/lies-exposed/lies.exposed/issues/4151)) ([b64f0ca](https://github.com/lies-exposed/lies.exposed/commit/b64f0ca8639e14dd7cac2babecb2056dac4eb0b2))


### Bug Fixes

* **api:** close token-login bypass, rate limit login, scope POST /media, attribute MCP media ([#4114](https://github.com/lies-exposed/lies.exposed/issues/4114)) ([d58b1bb](https://github.com/lies-exposed/lies.exposed/commit/d58b1bb0355ac9349dab05083976b65cbf8dc02d))
* **core,admin,web,worker,ai-bot:** replace any with specific types across 22 files ([#4033](https://github.com/lies-exposed/lies.exposed/issues/4033)) ([fa982da](https://github.com/lies-exposed/lies.exposed/commit/fa982da449f43e23eead3f1d6494b79c748516de))
* **io,core,test,agent:** type remaining any casts (HOM-1578 WS71) ([#4182](https://github.com/lies-exposed/lies.exposed/issues/4182)) ([b341f96](https://github.com/lies-exposed/lies.exposed/commit/b341f96c24f5c52002fd3dcf8eb0f115150d8245))


### Miscellaneous

* **admin:** eliminate remaining any casts in admin package ([#4103](https://github.com/lies-exposed/lies.exposed/issues/4103)) ([8f49cc1](https://github.com/lies-exposed/lies.exposed/commit/8f49cc147aa6bc2fb57fd55ebfe1fea2d26429cf))
* enable vitest fsModuleCache and tune isolation ([#4006](https://github.com/lies-exposed/lies.exposed/issues/4006)) ([06cada1](https://github.com/lies-exposed/lies.exposed/commit/06cada1a3c0e5eaa979e00776e8a967812f604b8))
* update dev dependencies and remove eslint-disable comments ([#4110](https://github.com/lies-exposed/lies.exposed/issues/4110)) ([7beb247](https://github.com/lies-exposed/lies.exposed/commit/7beb2472dc06a4260ce3c474921ee3ed401fdd83))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.9.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.9.0
</details>

<details><summary>@liexp/shared: 0.9.0</summary>

## [0.9.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.8.0...@liexp/shared@0.9.0) (2026-11-23)


### Features

* **react:** migrate monorepo to React 19 ([#4183](https://github.com/lies-exposed/lies.exposed/issues/4183)) ([b00e204](https://github.com/lies-exposed/lies.exposed/commit/b00e2042d4215efb07872a444754cb14764fa711))


### Bug Fixes

* **shared:** replace any casts with proper types ([#4069](https://github.com/lies-exposed/lies.exposed/issues/4069)) ([75799f5](https://github.com/lies-exposed/lies.exposed/commit/75799f59c413dc1ecc0961743c85f62234c836bc))
* **shared:** replace remaining any casts in test files with proper types (HOM-1393) ([#4081](https://github.com/lies-exposed/lies.exposed/issues/4081)) ([5b4901b](https://github.com/lies-exposed/lies.exposed/commit/5b4901b107f04724eb7d5c26826f03febc702139))
* **ui:** type BlockNote plugins, editor, and admin media components ([#4030](https://github.com/lies-exposed/lies.exposed/issues/4030)) ([1ff105c](https://github.com/lies-exposed/lies.exposed/commit/1ff105ceee06c5f51aceb436953cb13a43db1b96))


### Miscellaneous

* addressed errors reported by 'pnpm peers check' ([#4166](https://github.com/lies-exposed/lies.exposed/issues/4166)) ([b97fc8e](https://github.com/lies-exposed/lies.exposed/commit/b97fc8eb1529d79602c6e376ccdfcf40fc4d5153))
* enable vitest fsModuleCache and tune isolation ([#4006](https://github.com/lies-exposed/lies.exposed/issues/4006)) ([06cada1](https://github.com/lies-exposed/lies.exposed/commit/06cada1a3c0e5eaa979e00776e8a967812f604b8))
* **shared:** add comprehensive tests for provider modules ([#3991](https://github.com/lies-exposed/lies.exposed/issues/3991)) ([b8f367f](https://github.com/lies-exposed/lies.exposed/commit/b8f367f08ae85820dfcb5064e6d36d8670bd1a67))
* **shared:** expand helper test coverage for event and social-post modules ([#3996](https://github.com/lies-exposed/lies.exposed/issues/3996)) ([8367c06](https://github.com/lies-exposed/lies.exposed/commit/8367c065bd1d4707b822b9c9bf1cfb04b1f9668a))
* update dev dependencies and remove eslint-disable comments ([#4110](https://github.com/lies-exposed/lies.exposed/issues/4110)) ([7beb247](https://github.com/lies-exposed/lies.exposed/commit/7beb2472dc06a4260ce3c474921ee3ed401fdd83))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.9.0
    * @liexp/io bumped to 0.9.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.9.0
    * @liexp/test bumped to 0.9.0
</details>

<details><summary>@liexp/storybook: 0.9.0</summary>

## [0.9.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.8.0...@liexp/storybook@0.9.0) (2026-11-23)


### Features

* **react:** migrate monorepo to React 19 ([#4183](https://github.com/lies-exposed/lies.exposed/issues/4183)) ([b00e204](https://github.com/lies-exposed/lies.exposed/commit/b00e2042d4215efb07872a444754cb14764fa711))


### Bug Fixes

* **storybook:** reduce any casts in graph and page stories ([#4080](https://github.com/lies-exposed/lies.exposed/issues/4080)) ([bd5720e](https://github.com/lies-exposed/lies.exposed/commit/bd5720e636781a960874f83de96c6b8c7c734510))
* **storybook:** type story args in 5 story files (HOM-1546) ([#4163](https://github.com/lies-exposed/lies.exposed/issues/4163)) ([20dd728](https://github.com/lies-exposed/lies.exposed/commit/20dd72806174004c86c6784a9962dec285048527))
* **ui:** replace any casts in WealthDistributionGraph and HeaderMenu types ([#4101](https://github.com/lies-exposed/lies.exposed/issues/4101)) ([d8a19b1](https://github.com/lies-exposed/lies.exposed/commit/d8a19b1d52056ce8f44fb96a5e58f74ed8a844a0))


### Miscellaneous

* **api:** solved some 'as any' errors ([#4104](https://github.com/lies-exposed/lies.exposed/issues/4104)) ([767b21c](https://github.com/lies-exposed/lies.exposed/commit/767b21c917cc67fb7159720a7c1499a0da285b8b))
* **eslint-config:** enable no-explicit-any as error (no suppressions) ([#4165](https://github.com/lies-exposed/lies.exposed/issues/4165)) ([20106a5](https://github.com/lies-exposed/lies.exposed/commit/20106a5c946e2745f1089e9510a4cc1e06dc877e))
* solved 'as any' errors ([#4105](https://github.com/lies-exposed/lies.exposed/issues/4105)) ([6cba6f3](https://github.com/lies-exposed/lies.exposed/commit/6cba6f31fbe74ea1569f956051d807674485a10a))
* update dev dependencies and remove eslint-disable comments ([#4110](https://github.com/lies-exposed/lies.exposed/issues/4110)) ([7beb247](https://github.com/lies-exposed/lies.exposed/commit/7beb2472dc06a4260ce3c474921ee3ed401fdd83))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/io bumped to 0.9.0
    * @liexp/shared bumped to 0.9.0
    * @liexp/test bumped to 0.9.0
    * @liexp/ui bumped to 0.9.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.9.0
</details>

<details><summary>@liexp/test: 0.9.0</summary>

## [0.9.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.8.0...@liexp/test@0.9.0) (2026-11-23)


### Bug Fixes

* **io,core,test,agent:** type remaining any casts (HOM-1578 WS71) ([#4182](https://github.com/lies-exposed/lies.exposed/issues/4182)) ([b341f96](https://github.com/lies-exposed/lies.exposed/commit/b341f96c24f5c52002fd3dcf8eb0f115150d8245))


### Miscellaneous

* fix build and lint errors from [#4032](https://github.com/lies-exposed/lies.exposed/issues/4032)/[#4033](https://github.com/lies-exposed/lies.exposed/issues/4033) ([#4059](https://github.com/lies-exposed/lies.exposed/issues/4059)) ([ae56e7d](https://github.com/lies-exposed/lies.exposed/commit/ae56e7d85cf545d523109c6885d942345d464594))
* update dev dependencies and remove eslint-disable comments ([#4110](https://github.com/lies-exposed/lies.exposed/issues/4110)) ([7beb247](https://github.com/lies-exposed/lies.exposed/commit/7beb2472dc06a4260ce3c474921ee3ed401fdd83))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/io bumped to 0.9.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.9.0
</details>

<details><summary>@liexp/ui: 0.9.0</summary>

## [0.9.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.8.0...@liexp/ui@0.9.0) (2026-11-23)


### Features

* **admin:** add chat history UI ([#4189](https://github.com/lies-exposed/lies.exposed/issues/4189)) ([eb4ada7](https://github.com/lies-exposed/lies.exposed/commit/eb4ada70bf632de8ed9c04a4a6dd6530b1079d6e))
* **admin:** add chat toggle button to CustomAppBar ([#4093](https://github.com/lies-exposed/lies.exposed/issues/4093)) ([5009425](https://github.com/lies-exposed/lies.exposed/commit/5009425f496428111e58cc534188dff0c7672f4a))
* **agent:** use API MCP tools, drop liexp_cli; chat UI sticky scroll + regenerate ([#4154](https://github.com/lies-exposed/lies.exposed/issues/4154)) ([f2e81dd](https://github.com/lies-exposed/lies.exposed/commit/f2e81dd4a9a704cd59412adfd8a954463fce76e1))
* **react:** migrate monorepo to React 19 ([#4183](https://github.com/lies-exposed/lies.exposed/issues/4183)) ([b00e204](https://github.com/lies-exposed/lies.exposed/commit/b00e2042d4215efb07872a444754cb14764fa711))
* **ui,admin:** add panel mode to AdminChat and ChatUI ([#4094](https://github.com/lies-exposed/lies.exposed/issues/4094)) ([85eb7e9](https://github.com/lies-exposed/lies.exposed/commit/85eb7e9ac0673d2aa698eaf88c41e65500348645))
* **ui:** replace any casts with proper d3 types in graph components ([#4024](https://github.com/lies-exposed/lies.exposed/issues/4024)) ([f5113ad](https://github.com/lies-exposed/lies.exposed/commit/f5113ad8ac464821c66b9774646db018b22c9698))


### Bug Fixes

* **core,admin,web,worker,ai-bot:** replace any with specific types across 22 files ([#4033](https://github.com/lies-exposed/lies.exposed/issues/4033)) ([fa982da](https://github.com/lies-exposed/lies.exposed/commit/fa982da449f43e23eead3f1d6494b79c748516de))
* **ui,agent:** stop sending undefined network type/id and double-encoded member arrays (HOM-1598) ([#4194](https://github.com/lies-exposed/lies.exposed/issues/4194)) ([d34d3d4](https://github.com/lies-exposed/lies.exposed/commit/d34d3d484ca5546d0dec9b1ef2456a40c777ae0e))
* **ui:** add eslint-disable comments for BlockNote plugin any casts ([#4072](https://github.com/lies-exposed/lies.exposed/issues/4072)) ([09e0d5b](https://github.com/lies-exposed/lies.exposed/commit/09e0d5bc7a8a1a99f53e6b334306faed6f46131a))
* **ui:** remove any casts from BlockNote plugin layer (HOM-1541) ([#4162](https://github.com/lies-exposed/lies.exposed/issues/4162)) ([1a48da7](https://github.com/lies-exposed/lies.exposed/commit/1a48da77fa6c6fb1827c05e36f3d3c48d4e462e3))
* **ui:** remove any casts from container components ([#4067](https://github.com/lies-exposed/lies.exposed/issues/4067)) ([e21154a](https://github.com/lies-exposed/lies.exposed/commit/e21154aa947a5dbf50cb826bc820d83c4c747af0))
* **ui:** remove any casts in events/admin/Graph components A (HOM-1513) ([#4140](https://github.com/lies-exposed/lies.exposed/issues/4140)) ([27164cf](https://github.com/lies-exposed/lies.exposed/commit/27164cf260b765166ec0ca84054cc4d7da7422b4))
* **ui:** remove remaining any casts in UI containers ([#4061](https://github.com/lies-exposed/lies.exposed/issues/4061)) ([7b24412](https://github.com/lies-exposed/lies.exposed/commit/7b24412c0eb5836dbcbd6409a1e321dbbad1f72d))
* **ui:** replace any casts in Chat components ([#4099](https://github.com/lies-exposed/lies.exposed/issues/4099)) ([98229d2](https://github.com/lies-exposed/lies.exposed/commit/98229d2bc4b1e85c0a1c1b1a21f9f38c5e308e77))
* **ui:** replace any casts in Common components with proper types ([#4100](https://github.com/lies-exposed/lies.exposed/issues/4100)) ([c938fce](https://github.com/lies-exposed/lies.exposed/commit/c938fceb376a0e40fed53eac22eca5946527a8c8))
* **ui:** replace any casts in graph components with proper types ([#4098](https://github.com/lies-exposed/lies.exposed/issues/4098)) ([fbb2417](https://github.com/lies-exposed/lies.exposed/commit/fbb2417a6333aa5e12be5a54e796542fed989643))
* **ui:** replace any casts in WealthDistributionGraph and HeaderMenu types ([#4101](https://github.com/lies-exposed/lies.exposed/issues/4101)) ([d8a19b1](https://github.com/lies-exposed/lies.exposed/commit/d8a19b1d52056ce8f44fb96a5e58f74ed8a844a0))
* **ui:** replace any casts with proper types in containers, utils, templates, theme ([#4075](https://github.com/lies-exposed/lies.exposed/issues/4075)) ([6f34fae](https://github.com/lies-exposed/lies.exposed/commit/6f34fae83e900b9fb81e0c559e231bb8c2a49bf0))
* **ui:** resolve ScientificStudy url to a Link id in transformEvent ([#4090](https://github.com/lies-exposed/lies.exposed/issues/4090)) ([85476a6](https://github.com/lies-exposed/lies.exposed/commit/85476a65512edc8890791448f0e001695db01c0b))
* **ui:** restore @liexp/ui build ([#4039](https://github.com/lies-exposed/lies.exposed/issues/4039)) ([4e94193](https://github.com/lies-exposed/lies.exposed/commit/4e94193d49cb7e1ab01d6e5ac49c4b5b7a749aa3))
* **ui:** send null instead of empty body in transformEvent ([#4089](https://github.com/lies-exposed/lies.exposed/issues/4089)) ([6214333](https://github.com/lies-exposed/lies.exposed/commit/6214333c88a95fe48186febd8310d7369c6867b1))
* **ui:** type admin button casts (HOM-1574 WS67) ([#4177](https://github.com/lies-exposed/lies.exposed/issues/4177)) ([c4814a1](https://github.com/lies-exposed/lies.exposed/commit/c4814a1ab7fe9295f46833a8f4d8d81b5f029cb5))
* **ui:** type admin media & form spec casts (HOM-1575 WS68) ([#4179](https://github.com/lies-exposed/lies.exposed/issues/4179)) ([0966424](https://github.com/lies-exposed/lies.exposed/commit/09664248441a0cd52f7068974f5eff26e7a290d6))
* **ui:** type admin previews & social casts (HOM-1576 WS69) ([#4181](https://github.com/lies-exposed/lies.exposed/issues/4181)) ([e853d7c](https://github.com/lies-exposed/lies.exposed/commit/e853d7c56423b00e6539215de736b4acc040a1d8))
* **ui:** type admin/events component props (WS51) ([#4164](https://github.com/lies-exposed/lies.exposed/issues/4164)) ([1a4ccc3](https://github.com/lies-exposed/lies.exposed/commit/1a4ccc3a7ccb709b6fcf1443082d7a014a20cb57))
* **ui:** type BlockNote plugins, editor, and admin media components ([#4030](https://github.com/lies-exposed/lies.exposed/issues/4030)) ([1ff105c](https://github.com/lies-exposed/lies.exposed/commit/1ff105ceee06c5f51aceb436953cb13a43db1b96))
* **ui:** type Common components casts A (HOM-1573 WS66) ([#4176](https://github.com/lies-exposed/lies.exposed/issues/4176)) ([6ca1886](https://github.com/lies-exposed/lies.exposed/commit/6ca18865089354606db396d97b9944f4b71133fd))
* **ui:** type EventList items & cards casts (HOM-1571 WS64) ([#4174](https://github.com/lies-exposed/lies.exposed/issues/4174)) ([56c0d58](https://github.com/lies-exposed/lies.exposed/commit/56c0d58a754e89eb3c0a5ec504f88a263fe562ee))
* **ui:** type Graph/D3 long tail A (HOM-1540) ([#4153](https://github.com/lies-exposed/lies.exposed/issues/4153)) ([ac1d755](https://github.com/lies-exposed/lies.exposed/commit/ac1d7559f2ade853fb12b8adc37bedba2d05fc8c))
* **ui:** type list containers & query casts (HOM-1570 WS63) ([#4173](https://github.com/lies-exposed/lies.exposed/issues/4173)) ([3a5eaa4](https://github.com/lies-exposed/lies.exposed/commit/3a5eaa4fb98ede35dff33b686076bd2909db2651))
* **ui:** type misc list & common component any casts (HOM-1572 WS65) ([#4175](https://github.com/lies-exposed/lies.exposed/issues/4175)) ([e1fae0f](https://github.com/lies-exposed/lies.exposed/commit/e1fae0fc16d71e404f208382f495926722bb7483))
* **ui:** type SEO/navigation/graph tail casts (HOM-1579 WS72) ([#4187](https://github.com/lies-exposed/lies.exposed/issues/4187)) ([65225d1](https://github.com/lies-exposed/lies.exposed/commit/65225d1a45941287ca542a4f4eb579bd60ac7d6c))
* **worker:** send User-Agent on media fetch and add admin button feedback ([#4188](https://github.com/lies-exposed/lies.exposed/issues/4188)) ([835723e](https://github.com/lies-exposed/lies.exposed/commit/835723ebe94549423ab68b3d30476648a17b300f))


### Miscellaneous

* addressed errors reported by 'pnpm peers check' ([#4166](https://github.com/lies-exposed/lies.exposed/issues/4166)) ([b97fc8e](https://github.com/lies-exposed/lies.exposed/commit/b97fc8eb1529d79602c6e376ccdfcf40fc4d5153))
* enable vitest fsModuleCache and tune isolation ([#4006](https://github.com/lies-exposed/lies.exposed/issues/4006)) ([06cada1](https://github.com/lies-exposed/lies.exposed/commit/06cada1a3c0e5eaa979e00776e8a967812f604b8))
* **eslint-config:** enable no-explicit-any as error (no suppressions) ([#4165](https://github.com/lies-exposed/lies.exposed/issues/4165)) ([20106a5](https://github.com/lies-exposed/lies.exposed/commit/20106a5c946e2745f1089e9510a4cc1e06dc877e))
* fix build and lint errors from [#4032](https://github.com/lies-exposed/lies.exposed/issues/4032)/[#4033](https://github.com/lies-exposed/lies.exposed/issues/4033) ([#4059](https://github.com/lies-exposed/lies.exposed/issues/4059)) ([ae56e7d](https://github.com/lies-exposed/lies.exposed/commit/ae56e7d85cf545d523109c6885d942345d464594))
* solved 'as any' errors ([#4105](https://github.com/lies-exposed/lies.exposed/issues/4105)) ([6cba6f3](https://github.com/lies-exposed/lies.exposed/commit/6cba6f31fbe74ea1569f956051d807674485a10a))
* update dev dependencies and remove eslint-disable comments ([#4110](https://github.com/lies-exposed/lies.exposed/issues/4110)) ([7beb247](https://github.com/lies-exposed/lies.exposed/commit/7beb2472dc06a4260ce3c474921ee3ed401fdd83))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.9.0
    * @liexp/io bumped to 0.9.0
    * @liexp/shared bumped to 0.9.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.9.0
</details>

<details><summary>admin: 0.9.0</summary>

## [0.9.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.8.0...admin@0.9.0) (2026-11-23)


### Features

* **admin, ai-bot:** add ZeroClaw adapter for agent-proxy (WS7) ([#4032](https://github.com/lies-exposed/lies.exposed/issues/4032)) ([7e745e2](https://github.com/lies-exposed/lies.exposed/commit/7e745e247ba36b7b836c33a8864f8708ad4964b8))
* **admin:** add chat history UI ([#4189](https://github.com/lies-exposed/lies.exposed/issues/4189)) ([eb4ada7](https://github.com/lies-exposed/lies.exposed/commit/eb4ada70bf632de8ed9c04a4a6dd6530b1079d6e))
* **admin:** add chat toggle button to CustomAppBar ([#4093](https://github.com/lies-exposed/lies.exposed/issues/4093)) ([5009425](https://github.com/lies-exposed/lies.exposed/commit/5009425f496428111e58cc534188dff0c7672f4a))
* **agent,admin:** report AI chat errors to Sentry ([#4017](https://github.com/lies-exposed/lies.exposed/issues/4017)) ([3867eb6](https://github.com/lies-exposed/lies.exposed/commit/3867eb6acaec6c3a5f3b350c213b83bfbb564e5f))
* **agent:** use API MCP tools, drop liexp_cli; chat UI sticky scroll + regenerate ([#4154](https://github.com/lies-exposed/lies.exposed/issues/4154)) ([f2e81dd](https://github.com/lies-exposed/lies.exposed/commit/f2e81dd4a9a704cd59412adfd8a954463fce76e1))
* **react:** migrate monorepo to React 19 ([#4183](https://github.com/lies-exposed/lies.exposed/issues/4183)) ([b00e204](https://github.com/lies-exposed/lies.exposed/commit/b00e2042d4215efb07872a444754cb14764fa711))
* **ui,admin:** add panel mode to AdminChat and ChatUI ([#4094](https://github.com/lies-exposed/lies.exposed/issues/4094)) ([85eb7e9](https://github.com/lies-exposed/lies.exposed/commit/85eb7e9ac0673d2aa698eaf88c41e65500348645))


### Bug Fixes

* **admin:** reduce any casts in admin test files (11 -&gt; 0) ([#4077](https://github.com/lies-exposed/lies.exposed/issues/4077)) ([30c3af5](https://github.com/lies-exposed/lies.exposed/commit/30c3af5e41de8a172ad3a0faeff53d1004944fcc))
* **core,admin,web,worker,ai-bot:** replace any with specific types across 22 files ([#4033](https://github.com/lies-exposed/lies.exposed/issues/4033)) ([fa982da](https://github.com/lies-exposed/lies.exposed/commit/fa982da449f43e23eead3f1d6494b79c748516de))
* **services:** remove any casts in web/agent/admin/worker tail (HOM-1547) ([#4161](https://github.com/lies-exposed/lies.exposed/issues/4161)) ([857f27d](https://github.com/lies-exposed/lies.exposed/commit/857f27d51af9901520725caa6ae1bd6ab85e5ffe))
* **ui,agent:** stop sending undefined network type/id and double-encoded member arrays (HOM-1598) ([#4194](https://github.com/lies-exposed/lies.exposed/issues/4194)) ([d34d3d4](https://github.com/lies-exposed/lies.exposed/commit/d34d3d484ca5546d0dec9b1ef2456a40c777ae0e))
* **ui:** remove any casts in events/admin/Graph components A (HOM-1513) ([#4140](https://github.com/lies-exposed/lies.exposed/issues/4140)) ([27164cf](https://github.com/lies-exposed/lies.exposed/commit/27164cf260b765166ec0ca84054cc4d7da7422b4))


### Miscellaneous

* **admin:** eliminate remaining any casts in admin package ([#4102](https://github.com/lies-exposed/lies.exposed/issues/4102)) ([f85fb3c](https://github.com/lies-exposed/lies.exposed/commit/f85fb3cbc8d46eadeb3faa7f45cf6994c631b8f0))
* **admin:** eliminate remaining any casts in admin package ([#4103](https://github.com/lies-exposed/lies.exposed/issues/4103)) ([8f49cc1](https://github.com/lies-exposed/lies.exposed/commit/8f49cc147aa6bc2fb57fd55ebfe1fea2d26429cf))
* **deps:** update msw from v2 to v3 ([#4007](https://github.com/lies-exposed/lies.exposed/issues/4007)) ([164e025](https://github.com/lies-exposed/lies.exposed/commit/164e02570ff4f7f609eb64bf189421e63643deb7))
* enable vitest fsModuleCache and tune isolation ([#4006](https://github.com/lies-exposed/lies.exposed/issues/4006)) ([06cada1](https://github.com/lies-exposed/lies.exposed/commit/06cada1a3c0e5eaa979e00776e8a967812f604b8))
* fix build and lint errors from [#4032](https://github.com/lies-exposed/lies.exposed/issues/4032)/[#4033](https://github.com/lies-exposed/lies.exposed/issues/4033) ([#4059](https://github.com/lies-exposed/lies.exposed/issues/4059)) ([ae56e7d](https://github.com/lies-exposed/lies.exposed/commit/ae56e7d85cf545d523109c6885d942345d464594))
* update dev dependencies and remove eslint-disable comments ([#4110](https://github.com/lies-exposed/lies.exposed/issues/4110)) ([7beb247](https://github.com/lies-exposed/lies.exposed/commit/7beb2472dc06a4260ce3c474921ee3ed401fdd83))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.9.0
    * @liexp/core bumped to 0.9.0
    * @liexp/io bumped to 0.9.0
    * @liexp/shared bumped to 0.9.0
    * @liexp/ui bumped to 0.9.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.9.0
    * @liexp/test bumped to 0.9.0
</details>

<details><summary>agent: 0.9.0</summary>

## [0.9.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.8.0...agent@0.9.0) (2026-11-23)


### Features

* **agent,admin:** report AI chat errors to Sentry ([#4017](https://github.com/lies-exposed/lies.exposed/issues/4017)) ([3867eb6](https://github.com/lies-exposed/lies.exposed/commit/3867eb6acaec6c3a5f3b350c213b83bfbb564e5f))
* **agent:** persist admin chat conversations in Postgres ([#4185](https://github.com/lies-exposed/lies.exposed/issues/4185)) ([5182e84](https://github.com/lies-exposed/lies.exposed/commit/5182e84576f634ab659a4ef36d739350d1b557bf))
* **agent:** target rhino-coder, fix memory scope and reasoning/token handling ([#4151](https://github.com/lies-exposed/lies.exposed/issues/4151)) ([b64f0ca](https://github.com/lies-exposed/lies.exposed/commit/b64f0ca8639e14dd7cac2babecb2056dac4eb0b2))
* **agent:** use API MCP tools, drop liexp_cli; chat UI sticky scroll + regenerate ([#4154](https://github.com/lies-exposed/lies.exposed/issues/4154)) ([f2e81dd](https://github.com/lies-exposed/lies.exposed/commit/f2e81dd4a9a704cd59412adfd8a954463fce76e1))
* **api:** add createGroupMember MCP tool ([#4180](https://github.com/lies-exposed/lies.exposed/issues/4180)) ([9a014d1](https://github.com/lies-exposed/lies.exposed/commit/9a014d1bd4899e8e2692680db5c37fe85de3fa7f))


### Bug Fixes

* **agent,backend:** replace any casts with typed generics and type guards ([#4029](https://github.com/lies-exposed/lies.exposed/issues/4029)) ([2cde5a5](https://github.com/lies-exposed/lies.exposed/commit/2cde5a5f4ed8fd6830cafd8846490c6196667205))
* **agent:** await injectMemories in streaming chat flow ([#4015](https://github.com/lies-exposed/lies.exposed/issues/4015)) ([4205257](https://github.com/lies-exposed/lies.exposed/commit/4205257bc724d9893992984ee5cb7950dd5ee547))
* **agent:** log model finish reason, tell model to finish turn ([#4158](https://github.com/lies-exposed/lies.exposed/issues/4158)) ([1471d44](https://github.com/lies-exposed/lies.exposed/commit/1471d4452aac9ac432ce4910c58a6afe6570fc95))
* **agent:** recover MCP sessions & degrade chat turns instead of UNKNOWN errors (HOM-1599) ([#4192](https://github.com/lies-exposed/lies.exposed/issues/4192)) ([a959bb5](https://github.com/lies-exposed/lies.exposed/commit/a959bb56fe2970af8c83772d1853e1cd2d98f496))
* **agent:** replace any casts with proper types in chat flows and CLI executor ([#4109](https://github.com/lies-exposed/lies.exposed/issues/4109)) ([85ba490](https://github.com/lies-exposed/lies.exposed/commit/85ba49079c2756bb22a302ae36cc25ff076958a6))
* **agent:** teach media upload/avatar flow ([#4087](https://github.com/lies-exposed/lies.exposed/issues/4087)) ([be15d00](https://github.com/lies-exposed/lies.exposed/commit/be15d008416ad085127a7e1ec0a8d48ca4ecfe91))
* **api:** close MCP tool gaps; make pre-push docker-optional ([#4155](https://github.com/lies-exposed/lies.exposed/issues/4155)) ([ba79b50](https://github.com/lies-exposed/lies.exposed/commit/ba79b50383eb098eba158330c1e8e1fc5a54ccc7))
* **api:** decode editMedia/editGroup MCP input via flow schemas ([#4178](https://github.com/lies-exposed/lies.exposed/issues/4178)) ([6590a51](https://github.com/lies-exposed/lies.exposed/commit/6590a516f3d8373a9b59b623fe79ae34d3edce30))
* **io,core,test,agent:** type remaining any casts (HOM-1578 WS71) ([#4182](https://github.com/lies-exposed/lies.exposed/issues/4182)) ([b341f96](https://github.com/lies-exposed/lies.exposed/commit/b341f96c24f5c52002fd3dcf8eb0f115150d8245))
* **services:** remove any casts in web/agent/admin/worker tail (HOM-1547) ([#4161](https://github.com/lies-exposed/lies.exposed/issues/4161)) ([857f27d](https://github.com/lies-exposed/lies.exposed/commit/857f27d51af9901520725caa6ae1bd6ab85e5ffe))
* **ui,agent:** stop sending undefined network type/id and double-encoded member arrays (HOM-1598) ([#4194](https://github.com/lies-exposed/lies.exposed/issues/4194)) ([d34d3d4](https://github.com/lies-exposed/lies.exposed/commit/d34d3d484ca5546d0dec9b1ef2456a40c777ae0e))


### Miscellaneous

* **agent:** track services/agent/.env dev defaults ([#4074](https://github.com/lies-exposed/lies.exposed/issues/4074)) ([570c2b8](https://github.com/lies-exposed/lies.exposed/commit/570c2b8498743c863a2a0664f3a62f09435d6aaf))
* **deps:** update msw from v2 to v3 ([#4007](https://github.com/lies-exposed/lies.exposed/issues/4007)) ([164e025](https://github.com/lies-exposed/lies.exposed/commit/164e02570ff4f7f609eb64bf189421e63643deb7))
* enable vitest fsModuleCache and tune isolation ([#4006](https://github.com/lies-exposed/lies.exposed/issues/4006)) ([06cada1](https://github.com/lies-exposed/lies.exposed/commit/06cada1a3c0e5eaa979e00776e8a967812f604b8))
* update dev dependencies and remove eslint-disable comments ([#4110](https://github.com/lies-exposed/lies.exposed/issues/4110)) ([7beb247](https://github.com/lies-exposed/lies.exposed/commit/7beb2472dc06a4260ce3c474921ee3ed401fdd83))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.9.0
    * @liexp/core bumped to 0.9.0
    * @liexp/io bumped to 0.9.0
    * @liexp/shared bumped to 0.9.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.9.0
    * @liexp/test bumped to 0.9.0
</details>

<details><summary>ai-bot: 0.9.0</summary>

## [0.9.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.8.0...ai-bot@0.9.0) (2026-11-23)


### Features

* **admin, ai-bot:** add ZeroClaw adapter for agent-proxy (WS7) ([#4032](https://github.com/lies-exposed/lies.exposed/issues/4032)) ([7e745e2](https://github.com/lies-exposed/lies.exposed/commit/7e745e247ba36b7b836c33a8864f8708ad4964b8))
* **agent:** target rhino-coder, fix memory scope and reasoning/token handling ([#4151](https://github.com/lies-exposed/lies.exposed/issues/4151)) ([b64f0ca](https://github.com/lies-exposed/lies.exposed/commit/b64f0ca8639e14dd7cac2babecb2056dac4eb0b2))


### Bug Fixes

* **ai-bot:** fix build errors from [#4033](https://github.com/lies-exposed/lies.exposed/issues/4033) ([#4040](https://github.com/lies-exposed/lies.exposed/issues/4040)) ([594b094](https://github.com/lies-exposed/lies.exposed/commit/594b0948c8fb56d29d211c7d8237619e29c9269a))
* **core,admin,web,worker,ai-bot:** replace any with specific types across 22 files ([#4033](https://github.com/lies-exposed/lies.exposed/issues/4033)) ([fa982da](https://github.com/lies-exposed/lies.exposed/commit/fa982da449f43e23eead3f1d6494b79c748516de))


### Miscellaneous

* update dev dependencies and remove eslint-disable comments ([#4110](https://github.com/lies-exposed/lies.exposed/issues/4110)) ([7beb247](https://github.com/lies-exposed/lies.exposed/commit/7beb2472dc06a4260ce3c474921ee3ed401fdd83))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.9.0
    * @liexp/core bumped to 0.9.0
    * @liexp/io bumped to 0.9.0
    * @liexp/shared bumped to 0.9.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.9.0
</details>

<details><summary>api: 0.9.0</summary>

## [0.9.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.8.0...api@0.9.0) (2026-11-23)


### Features

* **agent:** persist admin chat conversations in Postgres ([#4185](https://github.com/lies-exposed/lies.exposed/issues/4185)) ([5182e84](https://github.com/lies-exposed/lies.exposed/commit/5182e84576f634ab659a4ef36d739350d1b557bf))
* **agent:** use API MCP tools, drop liexp_cli; chat UI sticky scroll + regenerate ([#4154](https://github.com/lies-exposed/lies.exposed/issues/4154)) ([f2e81dd](https://github.com/lies-exposed/lies.exposed/commit/f2e81dd4a9a704cd59412adfd8a954463fce76e1))
* **api:** add createGroupMember MCP tool ([#4180](https://github.com/lies-exposed/lies.exposed/issues/4180)) ([9a014d1](https://github.com/lies-exposed/lies.exposed/commit/9a014d1bd4899e8e2692680db5c37fe85de3fa7f))
* **api:** add Event MCP tools (find, create, edit) ([#4003](https://github.com/lies-exposed/lies.exposed/issues/4003)) ([19717dc](https://github.com/lies-exposed/lies.exposed/commit/19717dc47f1056151d91c0fdf87d641951f1baf1))
* **api:** add Graph MCP CRUD tools (findGraphs, createGraph, editGraph) ([#4066](https://github.com/lies-exposed/lies.exposed/issues/4066)) ([77e0740](https://github.com/lies-exposed/lies.exposed/commit/77e0740cb889223bef595ddfad9aaaaf7e17fd3f))
* **api:** add groups MCP tools (find, create, edit) ([#4005](https://github.com/lies-exposed/lies.exposed/issues/4005)) ([8ac1f12](https://github.com/lies-exposed/lies.exposed/commit/8ac1f12a9fe3363d0827600485211232ff719f76))
* **api:** add Keyword MCP CRUD tools (findKeywords, createKeyword, editKeyword) ([#4041](https://github.com/lies-exposed/lies.exposed/issues/4041)) ([414eca8](https://github.com/lies-exposed/lies.exposed/commit/414eca88e9951e512f3d44e4409954422f30227e))
* **api:** add MCP tools for link CRUD operations ([#4002](https://github.com/lies-exposed/lies.exposed/issues/4002)) ([196eab9](https://github.com/lies-exposed/lies.exposed/commit/196eab94920ff19285e679bf3f26a8cbe29275e1))
* **api:** add Media MCP CRUD tools (findMedia, createMedia, editMedia) ([#4026](https://github.com/lies-exposed/lies.exposed/issues/4026)) ([fadc053](https://github.com/lies-exposed/lies.exposed/commit/fadc0536e73b6f0a72cdd9cf312c4a3e671e91ac))
* **api:** add Nation MCP find tool (findNations) ([#4028](https://github.com/lies-exposed/lies.exposed/issues/4028)) ([5847f5f](https://github.com/lies-exposed/lies.exposed/commit/5847f5f231eb706e6fc8d437947807df2085e1e5))
* **api:** add Setting MCP CRUD tools (findSettings, createSetting, editSetting) ([#4018](https://github.com/lies-exposed/lies.exposed/issues/4018)) ([412583d](https://github.com/lies-exposed/lies.exposed/commit/412583dcf28c71d65b173766bb0f5242e59a5605))
* **api:** add SocialPost MCP CRUD tools ([#4042](https://github.com/lies-exposed/lies.exposed/issues/4042)) ([ab1c791](https://github.com/lies-exposed/lies.exposed/commit/ab1c7916581aa5bcf2b184bfb6b3dc3b54f58e11))
* **api:** add Story MCP CRUD tools (findStories, createStory, editStory) ([#4027](https://github.com/lies-exposed/lies.exposed/issues/4027)) ([f6a3736](https://github.com/lies-exposed/lies.exposed/commit/f6a3736f0a1c1b3a708f4a527e2b6070146be5a8))
* **api:** migrate MCP tools to use typed defineMcpTool helper ([#4019](https://github.com/lies-exposed/lies.exposed/issues/4019)) ([5317b46](https://github.com/lies-exposed/lies.exposed/commit/5317b46b30940b1bfd1f620dfa42deb79ba79a67))
* **api:** wire up all MCP tool registration and constants ([#4011](https://github.com/lies-exposed/lies.exposed/issues/4011)) ([a1f699f](https://github.com/lies-exposed/lies.exposed/commit/a1f699f7b9ecc6e51d72a96ccffd252097b189d1))
* **mcp:** add actor CRUD tools (find, create, edit) ([#4004](https://github.com/lies-exposed/lies.exposed/issues/4004)) ([6bb0aba](https://github.com/lies-exposed/lies.exposed/commit/6bb0aba9ccb2158ac17e8cbe42eda4fc83d0b213))
* **mcp:** add Area CRUD tools (findAreas, createArea, editArea) ([#4023](https://github.com/lies-exposed/lies.exposed/issues/4023)) ([3b0240e](https://github.com/lies-exposed/lies.exposed/commit/3b0240e2d1aa3e3ec423e34b9713c691f3ec6175))
* **mcp:** add E2E tests for CRUD tools and fix schema defaults ([#4016](https://github.com/lies-exposed/lies.exposed/issues/4016)) ([d0f5e69](https://github.com/lies-exposed/lies.exposed/commit/d0f5e69a29f39e4747552b693f0d6f4e2e7e7dc7))
* **mcp:** add read-only and destructive hints to MCP tool annotations ([#4010](https://github.com/lies-exposed/lies.exposed/issues/4010)) ([21238f8](https://github.com/lies-exposed/lies.exposed/commit/21238f8d806bdf3d0c8511e847ac7d65d191fe2e))
* **react:** migrate monorepo to React 19 ([#4183](https://github.com/lies-exposed/lies.exposed/issues/4183)) ([b00e204](https://github.com/lies-exposed/lies.exposed/commit/b00e2042d4215efb07872a444754cb14764fa711))


### Bug Fixes

* **api,worker:** require auth on write routes and restrict TG message handler ([#4113](https://github.com/lies-exposed/lies.exposed/issues/4113)) ([569dd8b](https://github.com/lies-exposed/lies.exposed/commit/569dd8b14e8344ff2f2062fa207b7df123db89f0))
* **api:** close MCP tool gaps; make pre-push docker-optional ([#4155](https://github.com/lies-exposed/lies.exposed/issues/4155)) ([ba79b50](https://github.com/lies-exposed/lies.exposed/commit/ba79b50383eb098eba158330c1e8e1fc5a54ccc7))
* **api:** close token-login bypass, rate limit login, scope POST /media, attribute MCP media ([#4114](https://github.com/lies-exposed/lies.exposed/issues/4114)) ([d58b1bb](https://github.com/lies-exposed/lies.exposed/commit/d58b1bb0355ac9349dab05083976b65cbf8dc02d))
* **api:** decode editMedia/editGroup MCP input via flow schemas ([#4178](https://github.com/lies-exposed/lies.exposed/issues/4178)) ([6590a51](https://github.com/lies-exposed/lies.exposed/commit/6590a516f3d8373a9b59b623fe79ae34d3edce30))
* **api:** findActors MCP tool ([#4012](https://github.com/lies-exposed/lies.exposed/issues/4012)) ([daabada](https://github.com/lies-exposed/lies.exposed/commit/daabada66da838c15837fc849571a53ef61fa5bb))
* **api:** format settings MCP tool ([#4020](https://github.com/lies-exposed/lies.exposed/issues/4020)) ([9a72e00](https://github.com/lies-exposed/lies.exposed/commit/9a72e00b846cb1f809afa8be92720bfe450c139c))
* **api:** make MCP endpoint stateless ([#4157](https://github.com/lies-exposed/lies.exposed/issues/4157)) ([b5a2af3](https://github.com/lies-exposed/lies.exposed/commit/b5a2af384b87394ebd495ac094ca58ccadc5fe0b))
* **api:** reduce any casts in API test files (HOM-1388) ([#4079](https://github.com/lies-exposed/lies.exposed/issues/4079)) ([2bf55c9](https://github.com/lies-exposed/lies.exposed/commit/2bf55c910320742cea51f809b433ee624a50fcca))
* **api:** remove any casts in controllers/flows/utils long tail (HOM-1510) ([#4147](https://github.com/lies-exposed/lies.exposed/issues/4147)) ([535efb8](https://github.com/lies-exposed/lies.exposed/commit/535efb87ebe6f163e29470f0da6252ed5afc9dd5))
* **api:** remove as any[] casts in media/links controllers ([#4022](https://github.com/lies-exposed/lies.exposed/issues/4022)) ([3e23277](https://github.com/lies-exposed/lies.exposed/commit/3e23277bd35972c0ff48d343bdbe7a6e506353eb))
* **api:** remove remaining any casts in MCP tool handlers (HOM-1543) ([#4156](https://github.com/lies-exposed/lies.exposed/issues/4156)) ([c2fc240](https://github.com/lies-exposed/lies.exposed/commit/c2fc2402a18589b9f9f8e6b1f1b2c63e870e14c8))
* **api:** report MCP errors to Sentry ([#4091](https://github.com/lies-exposed/lies.exposed/issues/4091)) ([6b02794](https://github.com/lies-exposed/lies.exposed/commit/6b0279458b56b4cd32f9b50c2f9a823d4b8d92a3))
* **api:** type mcp tool & route casts (HOM-1577 WS70) ([#4184](https://github.com/lies-exposed/lies.exposed/issues/4184)) ([d7ea85f](https://github.com/lies-exposed/lies.exposed/commit/d7ea85fc20b36f7a81f18e08fab46f7d7cc1797f))
* **backend:** decode media keywords as ids and retry 429 in accessibility check ([#4170](https://github.com/lies-exposed/lies.exposed/issues/4170)) ([25ed17b](https://github.com/lies-exposed/lies.exposed/commit/25ed17b21deeeec1442e41e804c4b7ccae350be7))


### Miscellaneous

* **admin:** eliminate remaining any casts in admin package ([#4103](https://github.com/lies-exposed/lies.exposed/issues/4103)) ([8f49cc1](https://github.com/lies-exposed/lies.exposed/commit/8f49cc147aa6bc2fb57fd55ebfe1fea2d26429cf))
* **api:** add E2E tests for MCP CRUD tools ([#4021](https://github.com/lies-exposed/lies.exposed/issues/4021)) ([4971a44](https://github.com/lies-exposed/lies.exposed/commit/4971a44a7755dae272cd332c7f3c0da1eedad504))
* **api:** eliminate any casts in app, flows, and migrations ([#4108](https://github.com/lies-exposed/lies.exposed/issues/4108)) ([88c3d4a](https://github.com/lies-exposed/lies.exposed/commit/88c3d4afe1eb7e3d65d5d154edcebef734b3a2f0))
* **api:** remove any casts from getActor, eventSuggestion.io, getGroups (HOM-1439, WS24) ([#4120](https://github.com/lies-exposed/lies.exposed/issues/4120)) ([f8b8b22](https://github.com/lies-exposed/lies.exposed/commit/f8b8b228cc02de309288a349e424137e370a7afa))
* **api:** solved some 'as any' errors ([#4104](https://github.com/lies-exposed/lies.exposed/issues/4104)) ([767b21c](https://github.com/lies-exposed/lies.exposed/commit/767b21c917cc67fb7159720a7c1499a0da285b8b))
* enable vitest fsModuleCache and tune isolation ([#4006](https://github.com/lies-exposed/lies.exposed/issues/4006)) ([06cada1](https://github.com/lies-exposed/lies.exposed/commit/06cada1a3c0e5eaa979e00776e8a967812f604b8))
* fix build and lint errors from [#4032](https://github.com/lies-exposed/lies.exposed/issues/4032)/[#4033](https://github.com/lies-exposed/lies.exposed/issues/4033) ([#4059](https://github.com/lies-exposed/lies.exposed/issues/4059)) ([ae56e7d](https://github.com/lies-exposed/lies.exposed/commit/ae56e7d85cf545d523109c6885d942345d464594))
* solved 'as any' errors ([#4105](https://github.com/lies-exposed/lies.exposed/issues/4105)) ([6cba6f3](https://github.com/lies-exposed/lies.exposed/commit/6cba6f31fbe74ea1569f956051d807674485a10a))
* update dev dependencies and remove eslint-disable comments ([#4110](https://github.com/lies-exposed/lies.exposed/issues/4110)) ([7beb247](https://github.com/lies-exposed/lies.exposed/commit/7beb2472dc06a4260ce3c474921ee3ed401fdd83))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.9.0
    * @liexp/core bumped to 0.9.0
    * @liexp/io bumped to 0.9.0
    * @liexp/shared bumped to 0.9.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.9.0
    * @liexp/test bumped to 0.9.0
</details>

<details><summary>lies.exposed: 0.9.0</summary>

## [0.9.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.8.0...lies.exposed@0.9.0) (2026-11-23)


### Features

* **admin, ai-bot:** add ZeroClaw adapter for agent-proxy (WS7) ([#4032](https://github.com/lies-exposed/lies.exposed/issues/4032)) ([7e745e2](https://github.com/lies-exposed/lies.exposed/commit/7e745e247ba36b7b836c33a8864f8708ad4964b8))
* **agent:** persist admin chat conversations in Postgres ([#4185](https://github.com/lies-exposed/lies.exposed/issues/4185)) ([5182e84](https://github.com/lies-exposed/lies.exposed/commit/5182e84576f634ab659a4ef36d739350d1b557bf))
* **agent:** target rhino-coder, fix memory scope and reasoning/token handling ([#4151](https://github.com/lies-exposed/lies.exposed/issues/4151)) ([b64f0ca](https://github.com/lies-exposed/lies.exposed/commit/b64f0ca8639e14dd7cac2babecb2056dac4eb0b2))
* **agent:** use API MCP tools, drop liexp_cli; chat UI sticky scroll + regenerate ([#4154](https://github.com/lies-exposed/lies.exposed/issues/4154)) ([f2e81dd](https://github.com/lies-exposed/lies.exposed/commit/f2e81dd4a9a704cd59412adfd8a954463fce76e1))
* **api:** add createGroupMember MCP tool ([#4180](https://github.com/lies-exposed/lies.exposed/issues/4180)) ([9a014d1](https://github.com/lies-exposed/lies.exposed/commit/9a014d1bd4899e8e2692680db5c37fe85de3fa7f))
* **api:** migrate MCP tools to use typed defineMcpTool helper ([#4019](https://github.com/lies-exposed/lies.exposed/issues/4019)) ([5317b46](https://github.com/lies-exposed/lies.exposed/commit/5317b46b30940b1bfd1f620dfa42deb79ba79a67))
* **mcp:** add actor CRUD tools (find, create, edit) ([#4004](https://github.com/lies-exposed/lies.exposed/issues/4004)) ([6bb0aba](https://github.com/lies-exposed/lies.exposed/commit/6bb0aba9ccb2158ac17e8cbe42eda4fc83d0b213))
* **react:** migrate monorepo to React 19 ([#4183](https://github.com/lies-exposed/lies.exposed/issues/4183)) ([b00e204](https://github.com/lies-exposed/lies.exposed/commit/b00e2042d4215efb07872a444754cb14764fa711))
* **ui:** replace any casts with proper d3 types in graph components ([#4024](https://github.com/lies-exposed/lies.exposed/issues/4024)) ([f5113ad](https://github.com/lies-exposed/lies.exposed/commit/f5113ad8ac464821c66b9774646db018b22c9698))


### Bug Fixes

* **agent,backend:** replace any casts with typed generics and type guards ([#4029](https://github.com/lies-exposed/lies.exposed/issues/4029)) ([2cde5a5](https://github.com/lies-exposed/lies.exposed/commit/2cde5a5f4ed8fd6830cafd8846490c6196667205))
* **agent:** allow agent pods to reach postgres ([#4186](https://github.com/lies-exposed/lies.exposed/issues/4186)) ([e66da63](https://github.com/lies-exposed/lies.exposed/commit/e66da637a4e777e260e642a0665b6e8da40c53a0))
* **api:** close MCP tool gaps; make pre-push docker-optional ([#4155](https://github.com/lies-exposed/lies.exposed/issues/4155)) ([ba79b50](https://github.com/lies-exposed/lies.exposed/commit/ba79b50383eb098eba158330c1e8e1fc5a54ccc7))
* **api:** make MCP endpoint stateless ([#4157](https://github.com/lies-exposed/lies.exposed/issues/4157)) ([b5a2af3](https://github.com/lies-exposed/lies.exposed/commit/b5a2af384b87394ebd495ac094ca58ccadc5fe0b))
* **shared:** replace any casts with proper types ([#4069](https://github.com/lies-exposed/lies.exposed/issues/4069)) ([75799f5](https://github.com/lies-exposed/lies.exposed/commit/75799f59c413dc1ecc0961743c85f62234c836bc))
* **ui:** replace any casts with proper types in containers, utils, templates, theme ([#4075](https://github.com/lies-exposed/lies.exposed/issues/4075)) ([6f34fae](https://github.com/lies-exposed/lies.exposed/commit/6f34fae83e900b9fb81e0c559e231bb8c2a49bf0))
* **ui:** restore @liexp/ui build ([#4039](https://github.com/lies-exposed/lies.exposed/issues/4039)) ([4e94193](https://github.com/lies-exposed/lies.exposed/commit/4e94193d49cb7e1ab01d6e5ac49c4b5b7a749aa3))
* **ui:** type BlockNote plugins, editor, and admin media components ([#4030](https://github.com/lies-exposed/lies.exposed/issues/4030)) ([1ff105c](https://github.com/lies-exposed/lies.exposed/commit/1ff105ceee06c5f51aceb436953cb13a43db1b96))
* **workspace:** build before knip and lint in pre-push hook ([#3994](https://github.com/lies-exposed/lies.exposed/issues/3994)) ([d8fbad5](https://github.com/lies-exposed/lies.exposed/commit/d8fbad5e61bf5c4ede1a5d0994e70dde6913955f))
* **workspace:** restore chromium base image for agent, ai-bot and worker ([#3993](https://github.com/lies-exposed/lies.exposed/issues/3993)) ([4d1d4aa](https://github.com/lies-exposed/lies.exposed/commit/4d1d4aa9dfa6ac5ee8750bcdcca421e772088cab))


### Miscellaneous

* add lies-exposed-local MCP server ([#4013](https://github.com/lies-exposed/lies.exposed/issues/4013)) ([dc715ba](https://github.com/lies-exposed/lies.exposed/commit/dc715babe124967b1a3a1354a96ef18bfa61c3a9))
* addressed errors reported by 'pnpm peers check' ([#4166](https://github.com/lies-exposed/lies.exposed/issues/4166)) ([b97fc8e](https://github.com/lies-exposed/lies.exposed/commit/b97fc8eb1529d79602c6e376ccdfcf40fc4d5153))
* **agent:** increase agent deployment memory limit to 1Gi ([#4092](https://github.com/lies-exposed/lies.exposed/issues/4092)) ([4cd607f](https://github.com/lies-exposed/lies.exposed/commit/4cd607ffb80e2aba797c1508ed9a6bef787759f1))
* **agent:** track services/agent/.env dev defaults ([#4074](https://github.com/lies-exposed/lies.exposed/issues/4074)) ([570c2b8](https://github.com/lies-exposed/lies.exposed/commit/570c2b8498743c863a2a0664f3a62f09435d6aaf))
* **compose:** make service .env.local files optional ([#4073](https://github.com/lies-exposed/lies.exposed/issues/4073)) ([3ddf1dd](https://github.com/lies-exposed/lies.exposed/commit/3ddf1ddbb2077fec5a61e0221d4aad466698da7b))
* **deps:** update msw from v2 to v3 ([#4007](https://github.com/lies-exposed/lies.exposed/issues/4007)) ([164e025](https://github.com/lies-exposed/lies.exposed/commit/164e02570ff4f7f609eb64bf189421e63643deb7))
* drop project mem0 mcp ([#4001](https://github.com/lies-exposed/lies.exposed/issues/4001)) ([244b9fd](https://github.com/lies-exposed/lies.exposed/commit/244b9fd3245549b4489d1364c932bf3c7a147626))
* enable vitest fsModuleCache and tune isolation ([#4006](https://github.com/lies-exposed/lies.exposed/issues/4006)) ([06cada1](https://github.com/lies-exposed/lies.exposed/commit/06cada1a3c0e5eaa979e00776e8a967812f604b8))
* make deploy.sh build/push opt-in ([#4088](https://github.com/lies-exposed/lies.exposed/issues/4088)) ([ebcd2df](https://github.com/lies-exposed/lies.exposed/commit/ebcd2dfea7800451425dece90bb745a129a9551f))
* reorganize docker scripts and add deploy.sh ([#3124](https://github.com/lies-exposed/lies.exposed/issues/3124)) ([a89136b](https://github.com/lies-exposed/lies.exposed/commit/a89136ba10fabf0758730d0fdec7749d8e48c93f))
* share project skills between Claude Code and OpenCode ([#3992](https://github.com/lies-exposed/lies.exposed/issues/3992)) ([6768242](https://github.com/lies-exposed/lies.exposed/commit/6768242992db3fdc791c2f36bc11d9ebf5eb1152))
* solved 'as any' errors ([#4105](https://github.com/lies-exposed/lies.exposed/issues/4105)) ([6cba6f3](https://github.com/lies-exposed/lies.exposed/commit/6cba6f31fbe74ea1569f956051d807674485a10a))
* update dev dependencies and remove eslint-disable comments ([#4110](https://github.com/lies-exposed/lies.exposed/issues/4110)) ([7beb247](https://github.com/lies-exposed/lies.exposed/commit/7beb2472dc06a4260ce3c474921ee3ed401fdd83))
* **workspace:** update to latest pnpm and enabled auto dedupe ([#4139](https://github.com/lies-exposed/lies.exposed/issues/4139)) ([41ed54a](https://github.com/lies-exposed/lies.exposed/commit/41ed54a136133d3a5fb84178a8bf6bfc9de51ad5))
</details>

<details><summary>web: 0.9.0</summary>

## [0.9.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.8.0...web@0.9.0) (2026-11-23)


### Features

* **react:** migrate monorepo to React 19 ([#4183](https://github.com/lies-exposed/lies.exposed/issues/4183)) ([b00e204](https://github.com/lies-exposed/lies.exposed/commit/b00e2042d4215efb07872a444754cb14764fa711))


### Bug Fixes

* **core,admin,web,worker,ai-bot:** replace any with specific types across 22 files ([#4033](https://github.com/lies-exposed/lies.exposed/issues/4033)) ([fa982da](https://github.com/lies-exposed/lies.exposed/commit/fa982da449f43e23eead3f1d6494b79c748516de))
* **services:** remove any casts in web/agent/admin/worker tail (HOM-1547) ([#4161](https://github.com/lies-exposed/lies.exposed/issues/4161)) ([857f27d](https://github.com/lies-exposed/lies.exposed/commit/857f27d51af9901520725caa6ae1bd6ab85e5ffe))
* **ui:** replace any casts with proper types in containers, utils, templates, theme ([#4075](https://github.com/lies-exposed/lies.exposed/issues/4075)) ([6f34fae](https://github.com/lies-exposed/lies.exposed/commit/6f34fae83e900b9fb81e0c559e231bb8c2a49bf0))
* **web:** replace any casts with proper types (HOM-1433) ([#4111](https://github.com/lies-exposed/lies.exposed/issues/4111)) ([ff51225](https://github.com/lies-exposed/lies.exposed/commit/ff51225606078ce1c4f4dacae09f97951719bc66))
* **web:** type routes.tsx query resolvers, drop any casts (HOM-1580 WS73) ([#4195](https://github.com/lies-exposed/lies.exposed/issues/4195)) ([2476a2f](https://github.com/lies-exposed/lies.exposed/commit/2476a2f3d63aec7404db8eea5ed1326e93a78943))


### Miscellaneous

* **deps:** update msw from v2 to v3 ([#4007](https://github.com/lies-exposed/lies.exposed/issues/4007)) ([164e025](https://github.com/lies-exposed/lies.exposed/commit/164e02570ff4f7f609eb64bf189421e63643deb7))
* enable vitest fsModuleCache and tune isolation ([#4006](https://github.com/lies-exposed/lies.exposed/issues/4006)) ([06cada1](https://github.com/lies-exposed/lies.exposed/commit/06cada1a3c0e5eaa979e00776e8a967812f604b8))
* fix build and lint errors from [#4032](https://github.com/lies-exposed/lies.exposed/issues/4032)/[#4033](https://github.com/lies-exposed/lies.exposed/issues/4033) ([#4059](https://github.com/lies-exposed/lies.exposed/issues/4059)) ([ae56e7d](https://github.com/lies-exposed/lies.exposed/commit/ae56e7d85cf545d523109c6885d942345d464594))
* update dev dependencies and remove eslint-disable comments ([#4110](https://github.com/lies-exposed/lies.exposed/issues/4110)) ([7beb247](https://github.com/lies-exposed/lies.exposed/commit/7beb2472dc06a4260ce3c474921ee3ed401fdd83))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.9.0
    * @liexp/core bumped to 0.9.0
    * @liexp/io bumped to 0.9.0
    * @liexp/shared bumped to 0.9.0
    * @liexp/ui bumped to 0.9.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.9.0
    * @liexp/test bumped to 0.9.0
</details>

<details><summary>worker: 0.9.0</summary>

## [0.9.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.8.0...worker@0.9.0) (2026-11-23)


### Bug Fixes

* **api,worker:** require auth on write routes and restrict TG message handler ([#4113](https://github.com/lies-exposed/lies.exposed/issues/4113)) ([569dd8b](https://github.com/lies-exposed/lies.exposed/commit/569dd8b14e8344ff2f2062fa207b7df123db89f0))
* **backend:** pass Telegram API root as Bot constructor option ([#3989](https://github.com/lies-exposed/lies.exposed/issues/3989)) ([212981c](https://github.com/lies-exposed/lies.exposed/commit/212981c2134621fcd50371890bd373353a4278af))
* **backend:** type AI/social provider casts (HOM-1567 WS60) ([#4168](https://github.com/lies-exposed/lies.exposed/issues/4168)) ([b7bbd04](https://github.com/lies-exposed/lies.exposed/commit/b7bbd047b24aa39f6e087d2d60bc95a9c5c82978))
* **core,admin,web,worker,ai-bot:** replace any with specific types across 22 files ([#4033](https://github.com/lies-exposed/lies.exposed/issues/4033)) ([fa982da](https://github.com/lies-exposed/lies.exposed/commit/fa982da449f43e23eead3f1d6494b79c748516de))
* **services:** remove any casts in web/agent/admin/worker tail (HOM-1547) ([#4161](https://github.com/lies-exposed/lies.exposed/issues/4161)) ([857f27d](https://github.com/lies-exposed/lies.exposed/commit/857f27d51af9901520725caa6ae1bd6ab85e5ffe))
* **worker:** replace unsafe any casts in test files with proper types ([#4078](https://github.com/lies-exposed/lies.exposed/issues/4078)) ([8266b41](https://github.com/lies-exposed/lies.exposed/commit/8266b410f1205370ae349b26c43017dd3057d157))
* **worker:** send User-Agent on media fetch and add admin button feedback ([#4188](https://github.com/lies-exposed/lies.exposed/issues/4188)) ([835723e](https://github.com/lies-exposed/lies.exposed/commit/835723ebe94549423ab68b3d30476648a17b300f))


### Miscellaneous

* enable vitest fsModuleCache and tune isolation ([#4006](https://github.com/lies-exposed/lies.exposed/issues/4006)) ([06cada1](https://github.com/lies-exposed/lies.exposed/commit/06cada1a3c0e5eaa979e00776e8a967812f604b8))
* fix build and lint errors from [#4032](https://github.com/lies-exposed/lies.exposed/issues/4032)/[#4033](https://github.com/lies-exposed/lies.exposed/issues/4033) ([#4059](https://github.com/lies-exposed/lies.exposed/issues/4059)) ([ae56e7d](https://github.com/lies-exposed/lies.exposed/commit/ae56e7d85cf545d523109c6885d942345d464594))
* update dev dependencies and remove eslint-disable comments ([#4110](https://github.com/lies-exposed/lies.exposed/issues/4110)) ([7beb247](https://github.com/lies-exposed/lies.exposed/commit/7beb2472dc06a4260ce3c474921ee3ed401fdd83))
* **worker:** eliminate any casts in worker service (HOM-1438 / WS26) ([#4118](https://github.com/lies-exposed/lies.exposed/issues/4118)) ([b7ffaa4](https://github.com/lies-exposed/lies.exposed/commit/b7ffaa43c7e9f500160e7c9857211c874b98c7e2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.9.0
    * @liexp/core bumped to 0.9.0
    * @liexp/io bumped to 0.9.0
    * @liexp/shared bumped to 0.9.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.9.0
    * @liexp/test bumped to 0.9.0
</details>

---
This PR was generated with [Release Please](https://github.com/googleapis/release-please). See [documentation](https://github.com/googleapis/release-please#release-please).