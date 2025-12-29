# Changelog

## 0.1.0 (2025-12-29)


### Features

* **agent:** created new agent service ([#2794](https://github.com/lies-exposed/lies.exposed/issues/2794)) ([b9c70c9](https://github.com/lies-exposed/lies.exposed/commit/b9c70c97b8a2e308c3c45d45201f4092eceec223))
* **agent:** streamable chat endpoint ([#2845](https://github.com/lies-exposed/lies.exposed/issues/2845)) ([c7376ca](https://github.com/lies-exposed/lies.exposed/commit/c7376caab780cd66d3e7116471fbd6dd7fb2484a))
* **ai-bot:** update event OpenAI flow ([#2571](https://github.com/lies-exposed/lies.exposed/issues/2571)) ([24cc4ac](https://github.com/lies-exposed/lies.exposed/commit/24cc4ac3466789ab4d69d43a9563f469d348b805))
* defined actor citizenships ([#2657](https://github.com/lies-exposed/lies.exposed/issues/2657)) ([df546ad](https://github.com/lies-exposed/lies.exposed/commit/df546ad2abe04b212e09792ed378640044a538ec))
* deploy on kubernetes ([#2594](https://github.com/lies-exposed/lies.exposed/issues/2594)) ([cc9647c](https://github.com/lies-exposed/lies.exposed/commit/cc9647c87d8f801cc742c7b6f3544b5dd7c5fcb0))
* replaced io-ts with effect ([#2388](https://github.com/lies-exposed/lies.exposed/issues/2388)) ([4ee8bc1](https://github.com/lies-exposed/lies.exposed/commit/4ee8bc1b2c79c4f363e6fbba0c64df8f1ab2cd62))


### Bug Fixes

* **ai-bot:** use vanilla puppeteer to load link as embeddable documents ([#2582](https://github.com/lies-exposed/lies.exposed/issues/2582)) ([6bccba4](https://github.com/lies-exposed/lies.exposed/commit/6bccba41e3ddaf3fbb58c4852116f8790f5542b3))
* **api:** create group flow ([9897f60](https://github.com/lies-exposed/lies.exposed/commit/9897f6052d3caed93493991b36b292cd35892468))
* **api:** create social post endpoint ([#2569](https://github.com/lies-exposed/lies.exposed/issues/2569)) ([db3474b](https://github.com/lies-exposed/lies.exposed/commit/db3474b13808af2e07e2e463504a0a90e7727750))
* **api:** link pub subs ([#2693](https://github.com/lies-exposed/lies.exposed/issues/2693)) ([9010c73](https://github.com/lies-exposed/lies.exposed/commit/9010c7382b19d6c1de874d6b3cdc7038d16c8355))
* **api:** telegram photo, text and media posts ([#2570](https://github.com/lies-exposed/lies.exposed/issues/2570)) ([06e11d3](https://github.com/lies-exposed/lies.exposed/commit/06e11d399d803a14258ebc8d0daf8b3fbecd2e8a))
* **backend:** create event from documents with AI flow ([#2414](https://github.com/lies-exposed/lies.exposed/issues/2414)) ([8200e1b](https://github.com/lies-exposed/lies.exposed/commit/8200e1b87975a4a205057eeb3652d2c38873f5e3))
* **backend:** removed Actor and Group old_avatar columns ([#2789](https://github.com/lies-exposed/lies.exposed/issues/2789)) ([16b53ff](https://github.com/lies-exposed/lies.exposed/commit/16b53ffce881cc529a21dddae084bfb77b331788))
* media upload location key and space endpoint resolution ([abe42fd](https://github.com/lies-exposed/lies.exposed/commit/abe42fd245314535216affe9374ab9ab04060af7))
* social post schema and decode helpers ([#2395](https://github.com/lies-exposed/lies.exposed/issues/2395)) ([2266c3e](https://github.com/lies-exposed/lies.exposed/commit/2266c3eeb1f83820445966d50ae5d7f0e95560da))
* **worker:** bind one on 'message' redis listener for subscribers ([c4e4c07](https://github.com/lies-exposed/lies.exposed/commit/c4e4c07c77ffd366711bafc5bfc58a380dbeef83))
* **worker:** generate media thumbnail and upsert NLP entities as kubernetes cron job ([5e4305f](https://github.com/lies-exposed/lies.exposed/commit/5e4305f6b3f3871a8225ea2752a159a0717d4776))
* **worker:** import getSocialPostById from backend lib folder ([77bc62f](https://github.com/lies-exposed/lies.exposed/commit/77bc62f66fa99617b8818e7ca85c7d276ce07b2b))
* **worker:** import SocialPostIO from backend lib folder ([522bc80](https://github.com/lies-exposed/lies.exposed/commit/522bc807c8378b573ab344aed9d2b4f1f217808e))
* **worker:** redis channel subscriptions ([360dc49](https://github.com/lies-exposed/lies.exposed/commit/360dc49cd14e7c5d097012bceee2d56ccce7ef76))
