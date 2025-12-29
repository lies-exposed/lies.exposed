# Changelog

## 0.1.0 (2025-12-29)


### Features

* **agent:** created new agent service ([#2794](https://github.com/lies-exposed/lies.exposed/issues/2794)) ([b9c70c9](https://github.com/lies-exposed/lies.exposed/commit/b9c70c97b8a2e308c3c45d45201f4092eceec223))
* **ai-bot:** add cli command to start an agent ([#2750](https://github.com/lies-exposed/lies.exposed/issues/2750)) ([99046a2](https://github.com/lies-exposed/lies.exposed/commit/99046a2b8f63f3ea10dbff9ad4464ae72b9c9255))
* **ai-bot:** add cli commands ([#2436](https://github.com/lies-exposed/lies.exposed/issues/2436)) ([c4d3774](https://github.com/lies-exposed/lies.exposed/commit/c4d37740067cc3f95596fcb96df9376b9e73cf87))
* **ai-bot:** update event OpenAI flow ([#2571](https://github.com/lies-exposed/lies.exposed/issues/2571)) ([24cc4ac](https://github.com/lies-exposed/lies.exposed/commit/24cc4ac3466789ab4d69d43a9563f469d348b805))
* **ai-bot:** use agent via http API ([#2809](https://github.com/lies-exposed/lies.exposed/issues/2809)) ([657ec21](https://github.com/lies-exposed/lies.exposed/commit/657ec218a45c861b06eb74a00310c4770ec435a3))
* **ai-bot:** use agent with api MCP servers ([#2762](https://github.com/lies-exposed/lies.exposed/issues/2762)) ([cca3cbe](https://github.com/lies-exposed/lies.exposed/commit/cca3cbe2a59e01ac0541e669d6253c21c6aa2499))
* replaced io-ts with effect ([#2388](https://github.com/lies-exposed/lies.exposed/issues/2388)) ([4ee8bc1](https://github.com/lies-exposed/lies.exposed/commit/4ee8bc1b2c79c4f363e6fbba0c64df8f1ab2cd62))


### Bug Fixes

* added langchain context and adjust flows ([1f97b26](https://github.com/lies-exposed/lies.exposed/commit/1f97b264882e43152397021dc8c375292810c9e9))
* **ai-bot:** add 'options' property to langchain provider ([540ce4e](https://github.com/lies-exposed/lies.exposed/commit/540ce4e0012b0ae29b63fa1c13c1e55380c0957b))
* **ai-bot:** added timeout to localAi config options ([19aa00b](https://github.com/lies-exposed/lies.exposed/commit/19aa00bd69b3e133973c1cc4f8159d31f8365ede))
* **ai-bot:** better prompt template typing ([9df21a6](https://github.com/lies-exposed/lies.exposed/commit/9df21a65aee946a144a73217d910e9a48ff9b373))
* **ai-bot:** chat command with streaming to avoid timeout connection ([4a2f379](https://github.com/lies-exposed/lies.exposed/commit/4a2f3791d012e444218d2a68902ced248a9a331a))
* **ai-bot:** correct configuration to call ai.lies.exposed from remote ([cc38cc3](https://github.com/lies-exposed/lies.exposed/commit/cc38cc38be116657178621d66813ae874f48574b))
* **ai-bot:** created custom strategy for effect-to-zod schema compatibility with NGrok ([#2824](https://github.com/lies-exposed/lies.exposed/issues/2824)) ([8b3a0bc](https://github.com/lies-exposed/lies.exposed/commit/8b3a0bcbd2902fb5b7552598281f344ccbe74600))
* **ai-bot:** handle puppeteer error while reading links for AI ([e332769](https://github.com/lies-exposed/lies.exposed/commit/e3327696386da9c0b98384f2fa50328bbc586236))
* **ai-bot:** increased langchain clients timeout up to 20 min ([b75b0a5](https://github.com/lies-exposed/lies.exposed/commit/b75b0a5951006485facef5c3be5df133658f5c69))
* **ai-bot:** localai api timeout set to 1hour ([cf1b57c](https://github.com/lies-exposed/lies.exposed/commit/cf1b57ccdef25e289e783d4ade2aaccfdca8dd86))
* **ai-bot:** login token refresh and update actor flow with agent ([7fbdedd](https://github.com/lies-exposed/lies.exposed/commit/7fbdedd0539ece46c21bb1e9957c3f3cbc119b7d))
* **ai-bot:** provide cloudflare access credentials and local ai api key cookie as default headers ([3509e3e](https://github.com/lies-exposed/lies.exposed/commit/3509e3e4cf71d06315018b82c627c8421b9b663d))
* **ai-bot:** restore es build ([970ee70](https://github.com/lies-exposed/lies.exposed/commit/970ee70408f0cbe29b7dec5b8540046607b484a8))
* **ai-bot:** set maximum exponential delay to 1 minute ([#2590](https://github.com/lies-exposed/lies.exposed/issues/2590)) ([2050476](https://github.com/lies-exposed/lies.exposed/commit/20504761ba05eddaea4dd843a54111f3a9c9e228))
* **ai-bot:** use qwen3-4b as default model ([73a51b4](https://github.com/lies-exposed/lies.exposed/commit/73a51b41d8c39aea23cda1aad53c987a7c00c9bc))
* **ai-bot:** use vanilla puppeteer to load link as embeddable documents ([#2582](https://github.com/lies-exposed/lies.exposed/issues/2582)) ([6bccba4](https://github.com/lies-exposed/lies.exposed/commit/6bccba41e3ddaf3fbb58c4852116f8790f5542b3))
* allow qwen3-4b to call functions and reply with structured output ([#2787](https://github.com/lies-exposed/lies.exposed/issues/2787)) ([e28cac4](https://github.com/lies-exposed/lies.exposed/commit/e28cac429897af1b035823d0b6dfebbcc620588a))
* **api:** added MCP tools to create actor, group and link entities ([#2791](https://github.com/lies-exposed/lies.exposed/issues/2791)) ([4123d6a](https://github.com/lies-exposed/lies.exposed/commit/4123d6a8d660121721bb2a03ed80728fe723f36d))
* **api:** authentication of service clients with api key ([#2793](https://github.com/lies-exposed/lies.exposed/issues/2793)) ([009b359](https://github.com/lies-exposed/lies.exposed/commit/009b359a2de73e5e849e98dae72b3013cdf18d0d))
* **api:** link pub subs ([#2693](https://github.com/lies-exposed/lies.exposed/issues/2693)) ([9010c73](https://github.com/lies-exposed/lies.exposed/commit/9010c7382b19d6c1de874d6b3cdc7038d16c8355))
* **backend:** create event from documents with AI flow ([#2414](https://github.com/lies-exposed/lies.exposed/issues/2414)) ([8200e1b](https://github.com/lies-exposed/lies.exposed/commit/8200e1b87975a4a205057eeb3652d2c38873f5e3))
* media upload location key and space endpoint resolution ([abe42fd](https://github.com/lies-exposed/lies.exposed/commit/abe42fd245314535216affe9374ab9ab04060af7))
* social post schema and decode helpers ([#2395](https://github.com/lies-exposed/lies.exposed/issues/2395)) ([2266c3e](https://github.com/lies-exposed/lies.exposed/commit/2266c3eeb1f83820445966d50ae5d7f0e95560da))
* use langchain tool strategy for LLM structured output ([#2800](https://github.com/lies-exposed/lies.exposed/issues/2800)) ([cfb0a08](https://github.com/lies-exposed/lies.exposed/commit/cfb0a081ebc8566827ee1a6870cb928b29a19315))
