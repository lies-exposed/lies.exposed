# Changelog

## 0.1.0 (2025-12-29)


### Features

* **admin:** setup server ([#2840](https://github.com/lies-exposed/lies.exposed/issues/2840)) ([ea5d01d](https://github.com/lies-exposed/lies.exposed/commit/ea5d01d7b8d10423c2632dcb9611ad4f57bf70c5))
* **agent:** created new agent service ([#2794](https://github.com/lies-exposed/lies.exposed/issues/2794)) ([b9c70c9](https://github.com/lies-exposed/lies.exposed/commit/b9c70c97b8a2e308c3c45d45201f4092eceec223))
* **agent:** streamable chat endpoint ([#2845](https://github.com/lies-exposed/lies.exposed/issues/2845)) ([c7376ca](https://github.com/lies-exposed/lies.exposed/commit/c7376caab780cd66d3e7116471fbd6dd7fb2484a))
* **ai-bot:** use agent with api MCP servers ([#2762](https://github.com/lies-exposed/lies.exposed/issues/2762)) ([cca3cbe](https://github.com/lies-exposed/lies.exposed/commit/cca3cbe2a59e01ac0541e669d6253c21c6aa2499))
* **api:** added tools to add and edit actors, groups, links and events ([#2814](https://github.com/lies-exposed/lies.exposed/issues/2814)) ([a33e5c2](https://github.com/lies-exposed/lies.exposed/commit/a33e5c25c7b5abf458211d6c91658027414dad0b))
* **backend:** extract shared m2m auth infrastructure ([#2827](https://github.com/lies-exposed/lies.exposed/issues/2827)) ([72f2219](https://github.com/lies-exposed/lies.exposed/commit/72f2219ccdc64f81fc1797a446b7ce28edfdc05b))
* defined actor citizenships ([#2657](https://github.com/lies-exposed/lies.exposed/issues/2657)) ([df546ad](https://github.com/lies-exposed/lies.exposed/commit/df546ad2abe04b212e09792ed378640044a538ec))
* deploy on kubernetes ([#2594](https://github.com/lies-exposed/lies.exposed/issues/2594)) ([cc9647c](https://github.com/lies-exposed/lies.exposed/commit/cc9647c87d8f801cc742c7b6f3544b5dd7c5fcb0))
* replaced io-ts with effect ([#2388](https://github.com/lies-exposed/lies.exposed/issues/2388)) ([4ee8bc1](https://github.com/lies-exposed/lies.exposed/commit/4ee8bc1b2c79c4f363e6fbba0c64df8f1ab2cd62))


### Bug Fixes

* added langchain context and adjust flows ([1f97b26](https://github.com/lies-exposed/lies.exposed/commit/1f97b264882e43152397021dc8c375292810c9e9))
* added more tools to get resources by id and added e2e tests ([cbd1492](https://github.com/lies-exposed/lies.exposed/commit/cbd1492348d8dcd23c94abe81d636f7ee0d1371e))
* **admin:** edit group members ([#2790](https://github.com/lies-exposed/lies.exposed/issues/2790)) ([8a895cf](https://github.com/lies-exposed/lies.exposed/commit/8a895cfca63b6cc4079c9820b88fc1d9a2e20f1e))
* **ai-bot:** created custom strategy for effect-to-zod schema compatibility with NGrok ([#2824](https://github.com/lies-exposed/lies.exposed/issues/2824)) ([8b3a0bc](https://github.com/lies-exposed/lies.exposed/commit/8b3a0bcbd2902fb5b7552598281f344ccbe74600))
* **api:** actor unique avatar constraint migration ([#2641](https://github.com/lies-exposed/lies.exposed/issues/2641)) ([e4b2ae2](https://github.com/lies-exposed/lies.exposed/commit/e4b2ae25735ca4d2747173a60471a8556977e519))
* **api:** added 'email' field to service token payload ([0500aa4](https://github.com/lies-exposed/lies.exposed/commit/0500aa49fa3552146972f6f382a081724ca7eee0))
* **api:** added 'getLink' MCP tool ([bf83a31](https://github.com/lies-exposed/lies.exposed/commit/bf83a310cefbe7f9cefc2321b323df7666643d37))
* **api:** added create and edit tools for every event type ([#2851](https://github.com/lies-exposed/lies.exposed/issues/2851)) ([f5e42a4](https://github.com/lies-exposed/lies.exposed/commit/f5e42a4ee39e3cebf5920daa873f1ac00f725b2e))
* **api:** added MCP tools to create actor, group and link entities ([#2791](https://github.com/lies-exposed/lies.exposed/issues/2791)) ([4123d6a](https://github.com/lies-exposed/lies.exposed/commit/4123d6a8d660121721bb2a03ed80728fe723f36d))
* **api:** added missing 'edit' MCP tools with e2e tests ([6ca4986](https://github.com/lies-exposed/lies.exposed/commit/6ca49865439a3715efa0e84384bc0976a75c8358))
* **api:** added missing 'get by id' MCP tools with e2e tests ([3f8b844](https://github.com/lies-exposed/lies.exposed/commit/3f8b844f77271aa7dd297ca7f7a20c47087e89ce))
* **api:** authentication of service clients with api key ([#2793](https://github.com/lies-exposed/lies.exposed/issues/2793)) ([009b359](https://github.com/lies-exposed/lies.exposed/commit/009b359a2de73e5e849e98dae72b3013cdf18d0d))
* **api:** bearer token for client ([bfff242](https://github.com/lies-exposed/lies.exposed/commit/bfff242bba734f4965b3cb3c3308681d47cacf78))
* **api:** correct decode of Queue data payload ([de57ad7](https://github.com/lies-exposed/lies.exposed/commit/de57ad7760ea2221c2175cf364269198d6ee946e))
* **api:** create group flow ([9897f60](https://github.com/lies-exposed/lies.exposed/commit/9897f6052d3caed93493991b36b292cd35892468))
* **api:** create social post endpoint ([#2569](https://github.com/lies-exposed/lies.exposed/issues/2569)) ([db3474b](https://github.com/lies-exposed/lies.exposed/commit/db3474b13808af2e07e2e463504a0a90e7727750))
* **api:** different endpoint to extract and retrieve entities with NLP ([bff67e0](https://github.com/lies-exposed/lies.exposed/commit/bff67e0121de27561b1764c485d647d828afc090))
* **api:** handle db error status code when transforming to APIError ([58cc1bc](https://github.com/lies-exposed/lies.exposed/commit/58cc1bcccee28296eeb5e604fb94eaf4e9bd56bc))
* **api:** link pub subs ([#2693](https://github.com/lies-exposed/lies.exposed/issues/2693)) ([9010c73](https://github.com/lies-exposed/lies.exposed/commit/9010c7382b19d6c1de874d6b3cdc7038d16c8355))
* **api:** media entity creator as user entity ([5f6fbf5](https://github.com/lies-exposed/lies.exposed/commit/5f6fbf5bc09c7e566fd7bbdb042144070e18ecf2))
* **api:** removed ProjectImage entity in favor of a join table between project and media ([#2761](https://github.com/lies-exposed/lies.exposed/issues/2761)) ([7d0ec90](https://github.com/lies-exposed/lies.exposed/commit/7d0ec9011989689c8d9fd020b4cb4f31524237c0))
* **api:** return social post count for filtered items ([c3adf27](https://github.com/lies-exposed/lies.exposed/commit/c3adf2795f79c6893f26ef131a0b01a2c6fab8d9))
* **api:** return void promise in uploadFile and uploadMultipartFile controllers ([#2481](https://github.com/lies-exposed/lies.exposed/issues/2481)) ([31b9a9c](https://github.com/lies-exposed/lies.exposed/commit/31b9a9c004c248fed1442f0e603a92872f5f9d9a))
* **api:** use literal value for event type search filters ([#2394](https://github.com/lies-exposed/lies.exposed/issues/2394)) ([4fadcad](https://github.com/lies-exposed/lies.exposed/commit/4fadcada9dd2fe9545c37d47809971dc16e70fad))
* **api:** use only auth middleware for jwt authentication ([#2810](https://github.com/lies-exposed/lies.exposed/issues/2810)) ([cffa55d](https://github.com/lies-exposed/lies.exposed/commit/cffa55db32ae2dc32309e2c98ddb2cbc98e75b76))
* **backend:** correct langchain imports and types ([fcc90ef](https://github.com/lies-exposed/lies.exposed/commit/fcc90efd4d65cf0c38f96e4c661160fd0d03b2a0))
* **backend:** create event from documents with AI flow ([#2414](https://github.com/lies-exposed/lies.exposed/issues/2414)) ([8200e1b](https://github.com/lies-exposed/lies.exposed/commit/8200e1b87975a4a205057eeb3652d2c38873f5e3))
* **backend:** removed Actor and Group old_avatar columns ([#2789](https://github.com/lies-exposed/lies.exposed/issues/2789)) ([16b53ff](https://github.com/lies-exposed/lies.exposed/commit/16b53ffce881cc529a21dddae084bfb77b331788))
* media upload location key and space endpoint resolution ([abe42fd](https://github.com/lies-exposed/lies.exposed/commit/abe42fd245314535216affe9374ab9ab04060af7))
* social post schema and decode helpers ([#2395](https://github.com/lies-exposed/lies.exposed/issues/2395)) ([2266c3e](https://github.com/lies-exposed/lies.exposed/commit/2266c3eeb1f83820445966d50ae5d7f0e95560da))
* story soft and hard deletion ([#2659](https://github.com/lies-exposed/lies.exposed/issues/2659)) ([e25f02e](https://github.com/lies-exposed/lies.exposed/commit/e25f02e4561ae9ef7782c3e66444a9ad6c5bab54))
* usage of EventTypes properties as const replaced with constant EVENT_TYPES ([ec0e96d](https://github.com/lies-exposed/lies.exposed/commit/ec0e96dbe7d04a6eb34c576d3f0cbdda1c6b18bd))
