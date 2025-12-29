# Changelog

## 0.1.0 (2025-12-29)


### Features

* **admin:** implement frontend proxy integration (Phase 2) ([#2842](https://github.com/lies-exposed/lies.exposed/issues/2842)) ([1b9f2f7](https://github.com/lies-exposed/lies.exposed/commit/1b9f2f7271882863885e4ffb27b99c7e18f03252))
* **admin:** setup server ([#2840](https://github.com/lies-exposed/lies.exposed/issues/2840)) ([ea5d01d](https://github.com/lies-exposed/lies.exposed/commit/ea5d01d7b8d10423c2632dcb9611ad4f57bf70c5))
* **agent:** created new agent service ([#2794](https://github.com/lies-exposed/lies.exposed/issues/2794)) ([b9c70c9](https://github.com/lies-exposed/lies.exposed/commit/b9c70c97b8a2e308c3c45d45201f4092eceec223))
* **agent:** streamable chat endpoint ([#2845](https://github.com/lies-exposed/lies.exposed/issues/2845)) ([c7376ca](https://github.com/lies-exposed/lies.exposed/commit/c7376caab780cd66d3e7116471fbd6dd7fb2484a))
* **ai-bot:** add cli commands ([#2436](https://github.com/lies-exposed/lies.exposed/issues/2436)) ([c4d3774](https://github.com/lies-exposed/lies.exposed/commit/c4d37740067cc3f95596fcb96df9376b9e73cf87))
* **ai-bot:** update event OpenAI flow ([#2571](https://github.com/lies-exposed/lies.exposed/issues/2571)) ([24cc4ac](https://github.com/lies-exposed/lies.exposed/commit/24cc4ac3466789ab4d69d43a9563f469d348b805))
* **ai-bot:** use agent via http API ([#2809](https://github.com/lies-exposed/lies.exposed/issues/2809)) ([657ec21](https://github.com/lies-exposed/lies.exposed/commit/657ec218a45c861b06eb74a00310c4770ec435a3))
* **ai-bot:** use agent with api MCP servers ([#2762](https://github.com/lies-exposed/lies.exposed/issues/2762)) ([cca3cbe](https://github.com/lies-exposed/lies.exposed/commit/cca3cbe2a59e01ac0541e669d6253c21c6aa2499))
* **backend:** extract shared m2m auth infrastructure ([#2827](https://github.com/lies-exposed/lies.exposed/issues/2827)) ([72f2219](https://github.com/lies-exposed/lies.exposed/commit/72f2219ccdc64f81fc1797a446b7ce28edfdc05b))
* defined actor citizenships ([#2657](https://github.com/lies-exposed/lies.exposed/issues/2657)) ([df546ad](https://github.com/lies-exposed/lies.exposed/commit/df546ad2abe04b212e09792ed378640044a538ec))
* deploy on kubernetes ([#2594](https://github.com/lies-exposed/lies.exposed/issues/2594)) ([cc9647c](https://github.com/lies-exposed/lies.exposed/commit/cc9647c87d8f801cc742c7b6f3544b5dd7c5fcb0))
* replaced io-ts with effect ([#2388](https://github.com/lies-exposed/lies.exposed/issues/2388)) ([4ee8bc1](https://github.com/lies-exposed/lies.exposed/commit/4ee8bc1b2c79c4f363e6fbba0c64df8f1ab2cd62))


### Bug Fixes

* added langchain context and adjust flows ([1f97b26](https://github.com/lies-exposed/lies.exposed/commit/1f97b264882e43152397021dc8c375292810c9e9))
* added more tools to get resources by id and added e2e tests ([cbd1492](https://github.com/lies-exposed/lies.exposed/commit/cbd1492348d8dcd23c94abe81d636f7ee0d1371e))
* **admin:** form grid layouts ([#2537](https://github.com/lies-exposed/lies.exposed/issues/2537)) ([7466d4b](https://github.com/lies-exposed/lies.exposed/commit/7466d4b292b26ec4ed7b96b0fcdd3d75a7f87a83))
* **ai-bot:** add 'options' property to langchain provider ([540ce4e](https://github.com/lies-exposed/lies.exposed/commit/540ce4e0012b0ae29b63fa1c13c1e55380c0957b))
* **ai-bot:** better prompt template typing ([9df21a6](https://github.com/lies-exposed/lies.exposed/commit/9df21a65aee946a144a73217d910e9a48ff9b373))
* **ai-bot:** chat command with streaming to avoid timeout connection ([4a2f379](https://github.com/lies-exposed/lies.exposed/commit/4a2f3791d012e444218d2a68902ced248a9a331a))
* **ai-bot:** created custom strategy for effect-to-zod schema compatibility with NGrok ([#2824](https://github.com/lies-exposed/lies.exposed/issues/2824)) ([8b3a0bc](https://github.com/lies-exposed/lies.exposed/commit/8b3a0bcbd2902fb5b7552598281f344ccbe74600))
* **ai-bot:** handle puppeteer error while reading links for AI ([e332769](https://github.com/lies-exposed/lies.exposed/commit/e3327696386da9c0b98384f2fa50328bbc586236))
* **ai-bot:** increased langchain clients timeout up to 20 min ([b75b0a5](https://github.com/lies-exposed/lies.exposed/commit/b75b0a5951006485facef5c3be5df133658f5c69))
* **ai-bot:** login token refresh and update actor flow with agent ([7fbdedd](https://github.com/lies-exposed/lies.exposed/commit/7fbdedd0539ece46c21bb1e9957c3f3cbc119b7d))
* **ai-bot:** provide cloudflare access credentials and local ai api key cookie as default headers ([3509e3e](https://github.com/lies-exposed/lies.exposed/commit/3509e3e4cf71d06315018b82c627c8421b9b663d))
* **ai-bot:** use vanilla puppeteer to load link as embeddable documents ([#2582](https://github.com/lies-exposed/lies.exposed/issues/2582)) ([6bccba4](https://github.com/lies-exposed/lies.exposed/commit/6bccba41e3ddaf3fbb58c4852116f8790f5542b3))
* allow qwen3-4b to call functions and reply with structured output ([#2787](https://github.com/lies-exposed/lies.exposed/issues/2787)) ([e28cac4](https://github.com/lies-exposed/lies.exposed/commit/e28cac429897af1b035823d0b6dfebbcc620588a))
* **api:** added 'getLink' MCP tool ([bf83a31](https://github.com/lies-exposed/lies.exposed/commit/bf83a310cefbe7f9cefc2321b323df7666643d37))
* **api:** added create and edit tools for every event type ([#2851](https://github.com/lies-exposed/lies.exposed/issues/2851)) ([f5e42a4](https://github.com/lies-exposed/lies.exposed/commit/f5e42a4ee39e3cebf5920daa873f1ac00f725b2e))
* **api:** added missing 'edit' MCP tools with e2e tests ([6ca4986](https://github.com/lies-exposed/lies.exposed/commit/6ca49865439a3715efa0e84384bc0976a75c8358))
* **api:** added missing 'get by id' MCP tools with e2e tests ([3f8b844](https://github.com/lies-exposed/lies.exposed/commit/3f8b844f77271aa7dd297ca7f7a20c47087e89ce))
* **api:** authentication of service clients with api key ([#2793](https://github.com/lies-exposed/lies.exposed/issues/2793)) ([009b359](https://github.com/lies-exposed/lies.exposed/commit/009b359a2de73e5e849e98dae72b3013cdf18d0d))
* **api:** create group flow ([9897f60](https://github.com/lies-exposed/lies.exposed/commit/9897f6052d3caed93493991b36b292cd35892468))
* **api:** create social post endpoint ([#2569](https://github.com/lies-exposed/lies.exposed/issues/2569)) ([db3474b](https://github.com/lies-exposed/lies.exposed/commit/db3474b13808af2e07e2e463504a0a90e7727750))
* **api:** link pub subs ([#2693](https://github.com/lies-exposed/lies.exposed/issues/2693)) ([9010c73](https://github.com/lies-exposed/lies.exposed/commit/9010c7382b19d6c1de874d6b3cdc7038d16c8355))
* **api:** media entity creator as user entity ([5f6fbf5](https://github.com/lies-exposed/lies.exposed/commit/5f6fbf5bc09c7e566fd7bbdb042144070e18ecf2))
* **api:** removed ProjectImage entity in favor of a join table between project and media ([#2761](https://github.com/lies-exposed/lies.exposed/issues/2761)) ([7d0ec90](https://github.com/lies-exposed/lies.exposed/commit/7d0ec9011989689c8d9fd020b4cb4f31524237c0))
* **backend:** correct langchain imports and types ([fcc90ef](https://github.com/lies-exposed/lies.exposed/commit/fcc90efd4d65cf0c38f96e4c661160fd0d03b2a0))
* **backend:** create event from documents with AI flow ([#2414](https://github.com/lies-exposed/lies.exposed/issues/2414)) ([8200e1b](https://github.com/lies-exposed/lies.exposed/commit/8200e1b87975a4a205057eeb3652d2c38873f5e3))
* **backend:** decode media creator correctly ([#2310](https://github.com/lies-exposed/lies.exposed/issues/2310)) ([301f83f](https://github.com/lies-exposed/lies.exposed/commit/301f83fb19d1d095050b7d9db7dc2d87e6135e9a))
* **backend:** prompt stringification to message string ([260f3ea](https://github.com/lies-exposed/lies.exposed/commit/260f3eadae5149fcaa693c0cb8951103f9403442))
* **backend:** removed Actor and Group old_avatar columns ([#2789](https://github.com/lies-exposed/lies.exposed/issues/2789)) ([16b53ff](https://github.com/lies-exposed/lies.exposed/commit/16b53ffce881cc529a21dddae084bfb77b331788))
* **backend:** replace "as any" with proper types  ([#2839](https://github.com/lies-exposed/lies.exposed/issues/2839)) ([dc462d0](https://github.com/lies-exposed/lies.exposed/commit/dc462d037e714162e5556592bf09339620a53825))
* **backend:** run rag chain with option for 'stream' or 'invoke' mode ([a044cfd](https://github.com/lies-exposed/lies.exposed/commit/a044cfda2fc148364519cf4c2326e61eefd0f513))
* **backend:** set creator for links and media coming from TG ([#2311](https://github.com/lies-exposed/lies.exposed/issues/2311)) ([4df204b](https://github.com/lies-exposed/lies.exposed/commit/4df204b01c6a36b7229913fe0b677951dab8d324))
* **backend:** use always path style for S3 client ([1e5dac8](https://github.com/lies-exposed/lies.exposed/commit/1e5dac80165a93a3d3633aba4d74e619bcc6d9d1))
* **backend:** use api interface from resource-client for api context ([868153b](https://github.com/lies-exposed/lies.exposed/commit/868153b09c57f0f4579f4ce257469baedadd7983))
* media upload location key and space endpoint resolution ([abe42fd](https://github.com/lies-exposed/lies.exposed/commit/abe42fd245314535216affe9374ab9ab04060af7))
* social post schema and decode helpers ([#2395](https://github.com/lies-exposed/lies.exposed/issues/2395)) ([2266c3e](https://github.com/lies-exposed/lies.exposed/commit/2266c3eeb1f83820445966d50ae5d7f0e95560da))
* story soft and hard deletion ([#2659](https://github.com/lies-exposed/lies.exposed/issues/2659)) ([e25f02e](https://github.com/lies-exposed/lies.exposed/commit/e25f02e4561ae9ef7782c3e66444a9ad6c5bab54))
* use langchain tool strategy for LLM structured output ([#2800](https://github.com/lies-exposed/lies.exposed/issues/2800)) ([cfb0a08](https://github.com/lies-exposed/lies.exposed/commit/cfb0a081ebc8566827ee1a6870cb928b29a19315))
* **web:** ssr rendering path to regexp match function ([3cce4fd](https://github.com/lies-exposed/lies.exposed/commit/3cce4fd7c6f10d0e09a26805bd7bec59b7da38f3))
* **worker:** bind one on 'message' redis listener for subscribers ([c4e4c07](https://github.com/lies-exposed/lies.exposed/commit/c4e4c07c77ffd366711bafc5bfc58a380dbeef83))
* **worker:** redis channel subscriptions ([360dc49](https://github.com/lies-exposed/lies.exposed/commit/360dc49cd14e7c5d097012bceee2d56ccce7ef76))


### Code Refactoring

* **backend:** replace jsdom with linkedom for URL metadata parsing ([#2889](https://github.com/lies-exposed/lies.exposed/issues/2889)) ([d82b6d8](https://github.com/lies-exposed/lies.exposed/commit/d82b6d88f74c47837086ee94e999a284fd22ebfe))
