# Changelog

## 0.1.0 (2025-12-29)


### Features

* **admin:** implement frontend proxy integration (Phase 2) ([#2842](https://github.com/lies-exposed/lies.exposed/issues/2842)) ([1b9f2f7](https://github.com/lies-exposed/lies.exposed/commit/1b9f2f7271882863885e4ffb27b99c7e18f03252))
* **agent:** streamable chat endpoint ([#2845](https://github.com/lies-exposed/lies.exposed/issues/2845)) ([c7376ca](https://github.com/lies-exposed/lies.exposed/commit/c7376caab780cd66d3e7116471fbd6dd7fb2484a))
* **ai-bot:** use agent with api MCP servers ([#2762](https://github.com/lies-exposed/lies.exposed/issues/2762)) ([cca3cbe](https://github.com/lies-exposed/lies.exposed/commit/cca3cbe2a59e01ac0541e669d6253c21c6aa2499))
* **api:** added tools to add and edit actors, groups, links and events ([#2814](https://github.com/lies-exposed/lies.exposed/issues/2814)) ([a33e5c2](https://github.com/lies-exposed/lies.exposed/commit/a33e5c25c7b5abf458211d6c91658027414dad0b))
* defined actor citizenships ([#2657](https://github.com/lies-exposed/lies.exposed/issues/2657)) ([df546ad](https://github.com/lies-exposed/lies.exposed/commit/df546ad2abe04b212e09792ed378640044a538ec))
* replaced io-ts with effect ([#2388](https://github.com/lies-exposed/lies.exposed/issues/2388)) ([4ee8bc1](https://github.com/lies-exposed/lies.exposed/commit/4ee8bc1b2c79c4f363e6fbba0c64df8f1ab2cd62))


### Bug Fixes

* added missing extension to ts imports ([c7c395e](https://github.com/lies-exposed/lies.exposed/commit/c7c395ef13878dfeb009a4c0378330e08243e982))
* **admin:** actor create without avatar ([69cd81e](https://github.com/lies-exposed/lies.exposed/commit/69cd81ed8b4a58c3c1376c8eb90fd115ce55b3e2))
* **admin:** added nationalities input to admin create view ([1734f59](https://github.com/lies-exposed/lies.exposed/commit/1734f59eb122db998cb995363c5c53598ec66b4f))
* **admin:** display progress bar for media upload ([#2653](https://github.com/lies-exposed/lies.exposed/issues/2653)) ([479f4c4](https://github.com/lies-exposed/lies.exposed/commit/479f4c442e5b4d34fcddb5b39c0349c0c8e3c236))
* **admin:** event edit layout ([69def21](https://github.com/lies-exposed/lies.exposed/commit/69def2179fb1ac3eb793a9d01f7d65feb48bfead))
* **admin:** form grid layouts ([#2537](https://github.com/lies-exposed/lies.exposed/issues/2537)) ([7466d4b](https://github.com/lies-exposed/lies.exposed/commit/7466d4b292b26ec4ed7b96b0fcdd3d75a7f87a83))
* **admin:** remove duplicated field from link events tab ([29e6ee2](https://github.com/lies-exposed/lies.exposed/commit/29e6ee287d718b06273bd1bf2ce723d3e3ba1627))
* **admin:** resource edit forms layout with Grid ([#2568](https://github.com/lies-exposed/lies.exposed/issues/2568)) ([431b8df](https://github.com/lies-exposed/lies.exposed/commit/431b8dfa8b845a8371e42ab09bcb2a8e50d8ee7b))
* **api:** authentication of service clients with api key ([#2793](https://github.com/lies-exposed/lies.exposed/issues/2793)) ([009b359](https://github.com/lies-exposed/lies.exposed/commit/009b359a2de73e5e849e98dae72b3013cdf18d0d))
* **api:** different endpoint to extract and retrieve entities with NLP ([bff67e0](https://github.com/lies-exposed/lies.exposed/commit/bff67e0121de27561b1764c485d647d828afc090))
* **api:** link pub subs ([#2693](https://github.com/lies-exposed/lies.exposed/issues/2693)) ([9010c73](https://github.com/lies-exposed/lies.exposed/commit/9010c7382b19d6c1de874d6b3cdc7038d16c8355))
* **api:** removed ProjectImage entity in favor of a join table between project and media ([#2761](https://github.com/lies-exposed/lies.exposed/issues/2761)) ([7d0ec90](https://github.com/lies-exposed/lies.exposed/commit/7d0ec9011989689c8d9fd020b4cb4f31524237c0))
* **api:** telegram photo, text and media posts ([#2570](https://github.com/lies-exposed/lies.exposed/issues/2570)) ([06e11d3](https://github.com/lies-exposed/lies.exposed/commit/06e11d399d803a14258ebc8d0daf8b3fbecd2e8a))
* **backend:** create event from documents with AI flow ([#2414](https://github.com/lies-exposed/lies.exposed/issues/2414)) ([8200e1b](https://github.com/lies-exposed/lies.exposed/commit/8200e1b87975a4a205057eeb3652d2c38873f5e3))
* media upload location key and space endpoint resolution ([abe42fd](https://github.com/lies-exposed/lies.exposed/commit/abe42fd245314535216affe9374ab9ab04060af7))
* social post schema and decode helpers ([#2395](https://github.com/lies-exposed/lies.exposed/issues/2395)) ([2266c3e](https://github.com/lies-exposed/lies.exposed/commit/2266c3eeb1f83820445966d50ae5d7f0e95560da))
* story soft and hard deletion ([#2659](https://github.com/lies-exposed/lies.exposed/issues/2659)) ([e25f02e](https://github.com/lies-exposed/lies.exposed/commit/e25f02e4561ae9ef7782c3e66444a9ad6c5bab54))
* **storybook:** build and eslint compatibility with storybook 9 ([b73fc8e](https://github.com/lies-exposed/lies.exposed/commit/b73fc8e3ce7ff44985fa95b5ff4ce9cc574f8a2e))
* **ui:** add 'copy' button to ChatUI assistant message ([fe66b2b](https://github.com/lies-exposed/lies.exposed/commit/fe66b2b12a8e4c9657c5db9edc6656bffbf70abe))
* **ui:** always appearing social post modal ([68020c0](https://github.com/lies-exposed/lies.exposed/commit/68020c08a981bd6a37fa2d556beed8cf1a11a861))
* **ui:** cap book card excerpt ([eb8de8c](https://github.com/lies-exposed/lies.exposed/commit/eb8de8c65067007cafe62d41b78be5447b6c58e7))
* **ui:** check error properly for status 401 in api client ([89a0bae](https://github.com/lies-exposed/lies.exposed/commit/89a0baea3a6027bbe092ba088bbfb3ca82d3b748))
* **ui:** forward EditForm props to inner Edit component ([a707900](https://github.com/lies-exposed/lies.exposed/commit/a707900848d534026c5c34063a666b81feab45e3))
* **ui:** infinite media list cell measurement ([#2740](https://github.com/lies-exposed/lies.exposed/issues/2740)) ([0265bd5](https://github.com/lies-exposed/lies.exposed/commit/0265bd5c23f6aaa7b244f67314178bf9fa44ba2c))
* **ui:** list layouts and ellipsed texts ([#2329](https://github.com/lies-exposed/lies.exposed/issues/2329)) ([c4660f5](https://github.com/lies-exposed/lies.exposed/commit/c4660f59c5286d65f7cace9a38e8aa635e06cec8))
* **ui:** media upload progress bar value conversion ([#2841](https://github.com/lies-exposed/lies.exposed/issues/2841)) ([91b78ce](https://github.com/lies-exposed/lies.exposed/commit/91b78ced171043510eeef38601909111c489f260))
* usage of EventTypes properties as const replaced with constant EVENT_TYPES ([ec0e96d](https://github.com/lies-exposed/lies.exposed/commit/ec0e96dbe7d04a6eb34c576d3f0cbdda1c6b18bd))
* **web:** added halthcheck endpoint ([#2593](https://github.com/lies-exposed/lies.exposed/issues/2593)) ([1b911e4](https://github.com/lies-exposed/lies.exposed/commit/1b911e4e594d1d93136bb95eef637f5b69a6497b))
* **web:** react-router routes compatibility ([#2544](https://github.com/lies-exposed/lies.exposed/issues/2544)) ([544517b](https://github.com/lies-exposed/lies.exposed/commit/544517bfdd09eb910f4cb5ba483c9fd5ac159857))
* **web:** ssr rendering path to regexp match function ([3cce4fd](https://github.com/lies-exposed/lies.exposed/commit/3cce4fd7c6f10d0e09a26805bd7bec59b7da38f3))
