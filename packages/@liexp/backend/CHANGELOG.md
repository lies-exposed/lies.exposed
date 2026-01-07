# Changelog

## [0.1.6](https://github.com/lies-exposed/lies.exposed/compare/@liexp/backend@0.1.5...@liexp/backend@0.1.6) (2026-01-07)


### Bug Fixes

* **ai-bot:** create event from url queue job ([#3015](https://github.com/lies-exposed/lies.exposed/issues/3015)) ([b5bf5f2](https://github.com/lies-exposed/lies.exposed/commit/b5bf5f25761d3326bf1e93d375192eea2858f72b))
* **api:** get event with deleted items for admins ([#3020](https://github.com/lies-exposed/lies.exposed/issues/3020)) ([0d10219](https://github.com/lies-exposed/lies.exposed/commit/0d102194a77d17278b31c44ff4b1fa9445e10390))


### Miscellaneous

* **worker:** proper mocks initialization for e2e tests ([#2998](https://github.com/lies-exposed/lies.exposed/issues/2998)) ([4619599](https://github.com/lies-exposed/lies.exposed/commit/4619599251bb8eca66c3a35ad17d10e0f9c3d2a9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/shared bumped to 0.1.6
  * devDependencies
    * @liexp/test bumped to 0.1.6

## [0.1.5](https://github.com/lies-exposed/lies.exposed/compare/@liexp/backend@0.1.4...@liexp/backend@0.1.5) (2026-01-05)


### Bug Fixes

* **backend:** account for timer imprecision in audit middleware test ([#2988](https://github.com/lies-exposed/lies.exposed/issues/2988)) ([1db46c6](https://github.com/lies-exposed/lies.exposed/commit/1db46c6066d318e8fc26bf3dfab7605527eb327d))
* **backend:** handle space TLS connection via env variable ([#2986](https://github.com/lies-exposed/lies.exposed/issues/2986)) ([ccfa27e](https://github.com/lies-exposed/lies.exposed/commit/ccfa27ed47281a7d7975c0d0506d342f3ba2468b))


### Miscellaneous

* **api:** solved typecheck errors in test files ([#2991](https://github.com/lies-exposed/lies.exposed/issues/2991)) ([1bbc8e2](https://github.com/lies-exposed/lies.exposed/commit/1bbc8e2bc031d857eec2c13b340c9a4ce9493116))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/shared bumped to 0.1.5
  * devDependencies
    * @liexp/test bumped to 0.1.5

## [0.1.4](https://github.com/lies-exposed/lies.exposed/compare/@liexp/backend@0.1.3...@liexp/backend@0.1.4) (2026-01-05)


### Bug Fixes

* **admin:** chat  tools and messages stream and UI adjustments ([#2981](https://github.com/lies-exposed/lies.exposed/issues/2981)) ([faa9068](https://github.com/lies-exposed/lies.exposed/commit/faa9068fdac40812d72d7c3661e6fa16aa8e2d5a))
* **admin:** filter links by events count ([#2978](https://github.com/lies-exposed/lies.exposed/issues/2978)) ([2baee88](https://github.com/lies-exposed/lies.exposed/commit/2baee882c054639ecc76437aaf7fd9589d6fa43a))
* **api:** added tools to find and get nation entities ([#2983](https://github.com/lies-exposed/lies.exposed/issues/2983)) ([3e6de57](https://github.com/lies-exposed/lies.exposed/commit/3e6de57e4f0456a4892fc9facc010989540ecf81))
* **backend:** fix SPA fallback route not matching root path in Express 5 ([#2974](https://github.com/lies-exposed/lies.exposed/issues/2974)) ([ce813ed](https://github.com/lies-exposed/lies.exposed/commit/ce813ed96b603325b85cbd1684796f4dc370aab9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/shared bumped to 0.1.4
  * devDependencies
    * @liexp/test bumped to 0.1.4

## [0.1.3](https://github.com/lies-exposed/lies.exposed/compare/@liexp/backend@0.1.2...@liexp/backend@0.1.3) (2026-01-03)


### Bug Fixes

* **backend:** vite server helper catch-all path ([#2965](https://github.com/lies-exposed/lies.exposed/issues/2965)) ([20d2f06](https://github.com/lies-exposed/lies.exposed/commit/20d2f06410c4e38e36675b542707fc27416a9995))
* **backend:** vite server helper logic with unit tests ([#2966](https://github.com/lies-exposed/lies.exposed/issues/2966)) ([2a26a0d](https://github.com/lies-exposed/lies.exposed/commit/2a26a0da947a617698d5e8663f107477b65a5442))
* **ui:** use react-hook-form hooks to keep TextWithSlugInput values in syn ([#2971](https://github.com/lies-exposed/lies.exposed/issues/2971)) ([88f3f2d](https://github.com/lies-exposed/lies.exposed/commit/88f3f2d4a06e8b3a5a13574ee8b3686486247df2))


### Miscellaneous

* **backend:** moved node SSR logic from @liexp/ui ([#2967](https://github.com/lies-exposed/lies.exposed/issues/2967)) ([a6ed9f0](https://github.com/lies-exposed/lies.exposed/commit/a6ed9f0579033fbf556e805ea1ed4dda46cef899))
* deploy of admin-web service ([#2963](https://github.com/lies-exposed/lies.exposed/issues/2963)) ([956f071](https://github.com/lies-exposed/lies.exposed/commit/956f0713d15f65b3c2ab3ca9ec16eb1457c00900))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.2
    * @liexp/shared bumped to 0.1.3
  * devDependencies
    * @liexp/test bumped to 0.1.3

## [0.1.2](https://github.com/lies-exposed/lies.exposed/compare/@liexp/backend@0.1.1...@liexp/backend@0.1.2) (2026-01-01)


### Miscellaneous

* **deps:** bump pdfjs-dist from 5.4.149 to 5.4.530 ([#2941](https://github.com/lies-exposed/lies.exposed/issues/2941)) ([3b64984](https://github.com/lies-exposed/lies.exposed/commit/3b64984ce77017e64481035ce98ef3411980cbc7))
* **deps:** bump typeorm from 0.3.27 to 0.3.28 ([#2937](https://github.com/lies-exposed/lies.exposed/issues/2937)) ([d4fb0d8](https://github.com/lies-exposed/lies.exposed/commit/d4fb0d80a1222e8c25942fac4e229b57bfa00576))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/shared bumped to 0.1.2
  * devDependencies
    * @liexp/test bumped to 0.1.2

## [0.1.1](https://github.com/lies-exposed/lies.exposed/compare/@liexp/backend@0.1.0...@liexp/backend@0.1.1) (2025-12-30)


### Miscellaneous

* **workspace:** bump the vite group across 8 directories with 2 updates ([#2894](https://github.com/lies-exposed/lies.exposed/issues/2894)) ([9b335af](https://github.com/lies-exposed/lies.exposed/commit/9b335afd53d543e8225464c7cb93d62986bb8b9b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.1
    * @liexp/shared bumped to 0.1.1
  * devDependencies
    * @liexp/test bumped to 0.1.1
