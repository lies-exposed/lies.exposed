# Changelog

## 0.1.0 (2025-12-29)


### Features

* **api:** added tools to add and edit actors, groups, links and events ([#2814](https://github.com/lies-exposed/lies.exposed/issues/2814)) ([a33e5c2](https://github.com/lies-exposed/lies.exposed/commit/a33e5c25c7b5abf458211d6c91658027414dad0b))
* defined actor citizenships ([#2657](https://github.com/lies-exposed/lies.exposed/issues/2657)) ([df546ad](https://github.com/lies-exposed/lies.exposed/commit/df546ad2abe04b212e09792ed378640044a538ec))
* replaced io-ts with effect ([#2388](https://github.com/lies-exposed/lies.exposed/issues/2388)) ([4ee8bc1](https://github.com/lies-exposed/lies.exposed/commit/4ee8bc1b2c79c4f363e6fbba0c64df8f1ab2cd62))


### Bug Fixes

* **@liexp/test:** replace "as any" with proper types ([84a8133](https://github.com/lies-exposed/lies.exposed/commit/84a8133e71c2c88d72f4e4e329d5f9a332f0b3f9))
* **api:** added create and edit tools for every event type ([#2851](https://github.com/lies-exposed/lies.exposed/issues/2851)) ([f5e42a4](https://github.com/lies-exposed/lies.exposed/commit/f5e42a4ee39e3cebf5920daa873f1ac00f725b2e))
* **api:** create social post endpoint ([#2569](https://github.com/lies-exposed/lies.exposed/issues/2569)) ([db3474b](https://github.com/lies-exposed/lies.exposed/commit/db3474b13808af2e07e2e463504a0a90e7727750))
* **api:** removed ProjectImage entity in favor of a join table between project and media ([#2761](https://github.com/lies-exposed/lies.exposed/issues/2761)) ([7d0ec90](https://github.com/lies-exposed/lies.exposed/commit/7d0ec9011989689c8d9fd020b4cb4f31524237c0))
* **shared:** correct type of EventTypeMap and blocknote arbitrary usage ([#2437](https://github.com/lies-exposed/lies.exposed/issues/2437)) ([c83a647](https://github.com/lies-exposed/lies.exposed/commit/c83a6474bbe5789c4e2ee144ee20386eb29af8e1))
* usage of EventTypes properties as const replaced with constant EVENT_TYPES ([ec0e96d](https://github.com/lies-exposed/lies.exposed/commit/ec0e96dbe7d04a6eb34c576d3f0cbdda1c6b18bd))
