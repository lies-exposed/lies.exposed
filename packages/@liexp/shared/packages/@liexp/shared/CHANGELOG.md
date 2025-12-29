# Changelog

## 0.1.0 (2025-12-29)


### Features

* **agent:** created new agent service ([#2794](https://github.com/lies-exposed/lies.exposed/issues/2794)) ([b9c70c9](https://github.com/lies-exposed/lies.exposed/commit/b9c70c97b8a2e308c3c45d45201f4092eceec223))
* **agent:** streamable chat endpoint ([#2845](https://github.com/lies-exposed/lies.exposed/issues/2845)) ([c7376ca](https://github.com/lies-exposed/lies.exposed/commit/c7376caab780cd66d3e7116471fbd6dd7fb2484a))
* **ai-bot:** update event OpenAI flow ([#2571](https://github.com/lies-exposed/lies.exposed/issues/2571)) ([24cc4ac](https://github.com/lies-exposed/lies.exposed/commit/24cc4ac3466789ab4d69d43a9563f469d348b805))
* **ai-bot:** use agent via http API ([#2809](https://github.com/lies-exposed/lies.exposed/issues/2809)) ([657ec21](https://github.com/lies-exposed/lies.exposed/commit/657ec218a45c861b06eb74a00310c4770ec435a3))
* **ai-bot:** use agent with api MCP servers ([#2762](https://github.com/lies-exposed/lies.exposed/issues/2762)) ([cca3cbe](https://github.com/lies-exposed/lies.exposed/commit/cca3cbe2a59e01ac0541e669d6253c21c6aa2499))
* **api:** added tools to add and edit actors, groups, links and events ([#2814](https://github.com/lies-exposed/lies.exposed/issues/2814)) ([a33e5c2](https://github.com/lies-exposed/lies.exposed/commit/a33e5c25c7b5abf458211d6c91658027414dad0b))
* defined actor citizenships ([#2657](https://github.com/lies-exposed/lies.exposed/issues/2657)) ([df546ad](https://github.com/lies-exposed/lies.exposed/commit/df546ad2abe04b212e09792ed378640044a538ec))
* replaced io-ts with effect ([#2388](https://github.com/lies-exposed/lies.exposed/issues/2388)) ([4ee8bc1](https://github.com/lies-exposed/lies.exposed/commit/4ee8bc1b2c79c4f363e6fbba0c64df8f1ab2cd62))


### Bug Fixes

* **@liexp/shared:** replace "as any" with proper types ([c0b8dfa](https://github.com/lies-exposed/lies.exposed/commit/c0b8dfaf5dfe2574ce2578ba17b04d31f281304b))
* added langchain context and adjust flows ([1f97b26](https://github.com/lies-exposed/lies.exposed/commit/1f97b264882e43152397021dc8c375292810c9e9))
* added missing extension to ts imports ([c7c395e](https://github.com/lies-exposed/lies.exposed/commit/c7c395ef13878dfeb009a4c0378330e08243e982))
* added more tools to get resources by id and added e2e tests ([cbd1492](https://github.com/lies-exposed/lies.exposed/commit/cbd1492348d8dcd23c94abe81d636f7ee0d1371e))
* **admin:** edit group members ([#2790](https://github.com/lies-exposed/lies.exposed/issues/2790)) ([8a895cf](https://github.com/lies-exposed/lies.exposed/commit/8a895cfca63b6cc4079c9820b88fc1d9a2e20f1e))
* **admin:** form grid layouts ([#2537](https://github.com/lies-exposed/lies.exposed/issues/2537)) ([7466d4b](https://github.com/lies-exposed/lies.exposed/commit/7466d4b292b26ec4ed7b96b0fcdd3d75a7f87a83))
* **ai-bot:** better prompt template typing ([9df21a6](https://github.com/lies-exposed/lies.exposed/commit/9df21a65aee946a144a73217d910e9a48ff9b373))
* **ai-bot:** created custom strategy for effect-to-zod schema compatibility with NGrok ([#2824](https://github.com/lies-exposed/lies.exposed/issues/2824)) ([8b3a0bc](https://github.com/lies-exposed/lies.exposed/commit/8b3a0bcbd2902fb5b7552598281f344ccbe74600))
* **ai-bot:** login token refresh and update actor flow with agent ([7fbdedd](https://github.com/lies-exposed/lies.exposed/commit/7fbdedd0539ece46c21bb1e9957c3f3cbc119b7d))
* **ai-bot:** use vanilla puppeteer to load link as embeddable documents ([#2582](https://github.com/lies-exposed/lies.exposed/issues/2582)) ([6bccba4](https://github.com/lies-exposed/lies.exposed/commit/6bccba41e3ddaf3fbb58c4852116f8790f5542b3))
* **api:** added create and edit tools for every event type ([#2851](https://github.com/lies-exposed/lies.exposed/issues/2851)) ([f5e42a4](https://github.com/lies-exposed/lies.exposed/commit/f5e42a4ee39e3cebf5920daa873f1ac00f725b2e))
* **api:** added MCP tools to create actor, group and link entities ([#2791](https://github.com/lies-exposed/lies.exposed/issues/2791)) ([4123d6a](https://github.com/lies-exposed/lies.exposed/commit/4123d6a8d660121721bb2a03ed80728fe723f36d))
* **api:** authentication of service clients with api key ([#2793](https://github.com/lies-exposed/lies.exposed/issues/2793)) ([009b359](https://github.com/lies-exposed/lies.exposed/commit/009b359a2de73e5e849e98dae72b3013cdf18d0d))
* **api:** create group flow ([9897f60](https://github.com/lies-exposed/lies.exposed/commit/9897f6052d3caed93493991b36b292cd35892468))
* **api:** create social post endpoint ([#2569](https://github.com/lies-exposed/lies.exposed/issues/2569)) ([db3474b](https://github.com/lies-exposed/lies.exposed/commit/db3474b13808af2e07e2e463504a0a90e7727750))
* **api:** different endpoint to extract and retrieve entities with NLP ([bff67e0](https://github.com/lies-exposed/lies.exposed/commit/bff67e0121de27561b1764c485d647d828afc090))
* **api:** link pub subs ([#2693](https://github.com/lies-exposed/lies.exposed/issues/2693)) ([9010c73](https://github.com/lies-exposed/lies.exposed/commit/9010c7382b19d6c1de874d6b3cdc7038d16c8355))
* **api:** removed ProjectImage entity in favor of a join table between project and media ([#2761](https://github.com/lies-exposed/lies.exposed/issues/2761)) ([7d0ec90](https://github.com/lies-exposed/lies.exposed/commit/7d0ec9011989689c8d9fd020b4cb4f31524237c0))
* **api:** telegram photo, text and media posts ([#2570](https://github.com/lies-exposed/lies.exposed/issues/2570)) ([06e11d3](https://github.com/lies-exposed/lies.exposed/commit/06e11d399d803a14258ebc8d0daf8b3fbecd2e8a))
* **api:** use only auth middleware for jwt authentication ([#2810](https://github.com/lies-exposed/lies.exposed/issues/2810)) ([cffa55d](https://github.com/lies-exposed/lies.exposed/commit/cffa55db32ae2dc32309e2c98ddb2cbc98e75b76))
* **backend:** create event from documents with AI flow ([#2414](https://github.com/lies-exposed/lies.exposed/issues/2414)) ([8200e1b](https://github.com/lies-exposed/lies.exposed/commit/8200e1b87975a4a205057eeb3652d2c38873f5e3))
* media upload location key and space endpoint resolution ([abe42fd](https://github.com/lies-exposed/lies.exposed/commit/abe42fd245314535216affe9374ab9ab04060af7))
* **shared:** correct type of EventTypeMap and blocknote arbitrary usage ([#2437](https://github.com/lies-exposed/lies.exposed/issues/2437)) ([c83a647](https://github.com/lies-exposed/lies.exposed/commit/c83a6474bbe5789c4e2ee144ee20386eb29af8e1))
* **shared:** ensure url have 'https' protocol in encodeWithSpaceEndpoint util ([d5aa4f1](https://github.com/lies-exposed/lies.exposed/commit/d5aa4f10c5c0fde0b21d401819b2a6b231bfbd25))
* **shared:** patent payload link codec to possibly undefind ([7213630](https://github.com/lies-exposed/lies.exposed/commit/72136305f9145919e8c93a9429c7b8230ea19bbc))
* **shared:** use uuid v4 as default ([e993089](https://github.com/lies-exposed/lies.exposed/commit/e993089e1928fb8b7a21c7b31a8cb90b711c2e64))
* **shared:** use v3 of zod for effect to zod conversion utils ([68c25e5](https://github.com/lies-exposed/lies.exposed/commit/68c25e525821b299f458de68dadc60f164797747))
* social post schema and decode helpers ([#2395](https://github.com/lies-exposed/lies.exposed/issues/2395)) ([2266c3e](https://github.com/lies-exposed/lies.exposed/commit/2266c3eeb1f83820445966d50ae5d7f0e95560da))
* story soft and hard deletion ([#2659](https://github.com/lies-exposed/lies.exposed/issues/2659)) ([e25f02e](https://github.com/lies-exposed/lies.exposed/commit/e25f02e4561ae9ef7782c3e66444a9ad6c5bab54))
* use langchain tool strategy for LLM structured output ([#2800](https://github.com/lies-exposed/lies.exposed/issues/2800)) ([cfb0a08](https://github.com/lies-exposed/lies.exposed/commit/cfb0a081ebc8566827ee1a6870cb928b29a19315))
