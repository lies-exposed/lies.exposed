# Changelog

## 0.1.0 (2025-12-29)


### Features

* **admin:** implement frontend proxy integration (Phase 2) ([#2842](https://github.com/lies-exposed/lies.exposed/issues/2842)) ([1b9f2f7](https://github.com/lies-exposed/lies.exposed/commit/1b9f2f7271882863885e4ffb27b99c7e18f03252))
* **admin:** setup server ([#2840](https://github.com/lies-exposed/lies.exposed/issues/2840)) ([ea5d01d](https://github.com/lies-exposed/lies.exposed/commit/ea5d01d7b8d10423c2632dcb9611ad4f57bf70c5))
* **agent:** created new agent service ([#2794](https://github.com/lies-exposed/lies.exposed/issues/2794)) ([b9c70c9](https://github.com/lies-exposed/lies.exposed/commit/b9c70c97b8a2e308c3c45d45201f4092eceec223))
* **agent:** streamable chat endpoint ([#2845](https://github.com/lies-exposed/lies.exposed/issues/2845)) ([c7376ca](https://github.com/lies-exposed/lies.exposed/commit/c7376caab780cd66d3e7116471fbd6dd7fb2484a))
* **backend:** extract shared m2m auth infrastructure ([#2827](https://github.com/lies-exposed/lies.exposed/issues/2827)) ([72f2219](https://github.com/lies-exposed/lies.exposed/commit/72f2219ccdc64f81fc1797a446b7ce28edfdc05b))
* defined actor citizenships ([#2657](https://github.com/lies-exposed/lies.exposed/issues/2657)) ([df546ad](https://github.com/lies-exposed/lies.exposed/commit/df546ad2abe04b212e09792ed378640044a538ec))
* deploy on kubernetes ([#2594](https://github.com/lies-exposed/lies.exposed/issues/2594)) ([cc9647c](https://github.com/lies-exposed/lies.exposed/commit/cc9647c87d8f801cc742c7b6f3544b5dd7c5fcb0))
* replaced io-ts with effect ([#2388](https://github.com/lies-exposed/lies.exposed/issues/2388)) ([4ee8bc1](https://github.com/lies-exposed/lies.exposed/commit/4ee8bc1b2c79c4f363e6fbba0c64df8f1ab2cd62))


### Bug Fixes

* added langchain context and adjust flows ([1f97b26](https://github.com/lies-exposed/lies.exposed/commit/1f97b264882e43152397021dc8c375292810c9e9))
* added missing extension to ts imports ([c7c395e](https://github.com/lies-exposed/lies.exposed/commit/c7c395ef13878dfeb009a4c0378330e08243e982))
* **admin:** actor create without avatar ([69cd81e](https://github.com/lies-exposed/lies.exposed/commit/69cd81ed8b4a58c3c1376c8eb90fd115ce55b3e2))
* **admin:** added nationalities input to admin create view ([1734f59](https://github.com/lies-exposed/lies.exposed/commit/1734f59eb122db998cb995363c5c53598ec66b4f))
* **admin:** display progress bar for media upload ([#2653](https://github.com/lies-exposed/lies.exposed/issues/2653)) ([479f4c4](https://github.com/lies-exposed/lies.exposed/commit/479f4c442e5b4d34fcddb5b39c0349c0c8e3c236))
* **admin:** edit group members ([#2790](https://github.com/lies-exposed/lies.exposed/issues/2790)) ([8a895cf](https://github.com/lies-exposed/lies.exposed/commit/8a895cfca63b6cc4079c9820b88fc1d9a2e20f1e))
* **admin:** event edit layout ([69def21](https://github.com/lies-exposed/lies.exposed/commit/69def2179fb1ac3eb793a9d01f7d65feb48bfead))
* **admin:** form grid layouts ([#2537](https://github.com/lies-exposed/lies.exposed/issues/2537)) ([7466d4b](https://github.com/lies-exposed/lies.exposed/commit/7466d4b292b26ec4ed7b96b0fcdd3d75a7f87a83))
* **admin:** no required endDate for group creation ([4a618eb](https://github.com/lies-exposed/lies.exposed/commit/4a618eb56edf554f7700ae903a828840db96febb))
* **admin:** remove double wrap with defineConfig ([dba96d2](https://github.com/lies-exposed/lies.exposed/commit/dba96d2e1213cd607fa7ea4dc2b7bc8b5bcc7118))
* **admin:** resource edit forms layout with Grid ([#2568](https://github.com/lies-exposed/lies.exposed/issues/2568)) ([431b8df](https://github.com/lies-exposed/lies.exposed/commit/431b8dfa8b845a8371e42ab09bcb2a8e50d8ee7b))
* **admin:** update imports of admin pages to use React.lazy ([#2792](https://github.com/lies-exposed/lies.exposed/issues/2792)) ([badaa96](https://github.com/lies-exposed/lies.exposed/commit/badaa9662136ebc7b560d9fc757beeedff6fcba1))
* **api:** authentication of service clients with api key ([#2793](https://github.com/lies-exposed/lies.exposed/issues/2793)) ([009b359](https://github.com/lies-exposed/lies.exposed/commit/009b359a2de73e5e849e98dae72b3013cdf18d0d))
* **api:** create group flow ([9897f60](https://github.com/lies-exposed/lies.exposed/commit/9897f6052d3caed93493991b36b292cd35892468))
* **api:** create social post endpoint ([#2569](https://github.com/lies-exposed/lies.exposed/issues/2569)) ([db3474b](https://github.com/lies-exposed/lies.exposed/commit/db3474b13808af2e07e2e463504a0a90e7727750))
* **api:** telegram photo, text and media posts ([#2570](https://github.com/lies-exposed/lies.exposed/issues/2570)) ([06e11d3](https://github.com/lies-exposed/lies.exposed/commit/06e11d399d803a14258ebc8d0daf8b3fbecd2e8a))
* **api:** use literal value for event type search filters ([#2394](https://github.com/lies-exposed/lies.exposed/issues/2394)) ([4fadcad](https://github.com/lies-exposed/lies.exposed/commit/4fadcada9dd2fe9545c37d47809971dc16e70fad))
* media upload location key and space endpoint resolution ([abe42fd](https://github.com/lies-exposed/lies.exposed/commit/abe42fd245314535216affe9374ab9ab04060af7))
* social post schema and decode helpers ([#2395](https://github.com/lies-exposed/lies.exposed/issues/2395)) ([2266c3e](https://github.com/lies-exposed/lies.exposed/commit/2266c3eeb1f83820445966d50ae5d7f0e95560da))
* usage of EventTypes properties as const replaced with constant EVENT_TYPES ([ec0e96d](https://github.com/lies-exposed/lies.exposed/commit/ec0e96dbe7d04a6eb34c576d3f0cbdda1c6b18bd))
