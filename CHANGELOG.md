# Changelog

## [0.1.9](https://github.com/lies-exposed/lies.exposed/compare/0.1.8...0.1.9) (2026-01-19)


### Bug Fixes

* **ai-bot:** remove loadDocs flow in favor of agent tools ([#3048](https://github.com/lies-exposed/lies.exposed/issues/3048)) ([144bb66](https://github.com/lies-exposed/lies.exposed/commit/144bb6671520d893e6f1975f995e589412f00838))


### Miscellaneous

* **admin:** setup custom HMR port for server ([#3051](https://github.com/lies-exposed/lies.exposed/issues/3051)) ([99ef38c](https://github.com/lies-exposed/lies.exposed/commit/99ef38c1d3f8b299341ed2df4dc9197eda0ef4be))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* **web:** removed unused files ([#3049](https://github.com/lies-exposed/lies.exposed/issues/3049)) ([591a382](https://github.com/lies-exposed/lies.exposed/commit/591a382ff290dc71b790d471f5c56d1b22231866))
* **workspace:** added script to lint only changed file ([#3054](https://github.com/lies-exposed/lies.exposed/issues/3054)) ([ae6c2b3](https://github.com/lies-exposed/lies.exposed/commit/ae6c2b3696f11a51a1dc88a712eeefa9800fd763))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump nginx image for telegram.liexp.dev to 1.27.1-alpine ([#3065](https://github.com/lies-exposed/lies.exposed/issues/3065)) ([92cf396](https://github.com/lies-exposed/lies.exposed/commit/92cf39664727bf87b94d146f1c53a1c61111eef2))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
* **workspace:** install tslib in dev deps ([#3050](https://github.com/lies-exposed/lies.exposed/issues/3050)) ([04449d3](https://github.com/lies-exposed/lies.exposed/commit/04449d397105a76742d10c9cfd0c67b033fbe99b))

## [0.1.8](https://github.com/lies-exposed/lies.exposed/compare/0.1.7...0.1.8) (2026-01-11)


### Bug Fixes

* **agent:** provide searchWebTools in agent service ([#3045](https://github.com/lies-exposed/lies.exposed/issues/3045)) ([1191a71](https://github.com/lies-exposed/lies.exposed/commit/1191a713da3eb66fa59f4ce275fc7f6e88a47693))
* **backend:** added brave provider for web searches ([#3044](https://github.com/lies-exposed/lies.exposed/issues/3044)) ([e1723b5](https://github.com/lies-exposed/lies.exposed/commit/e1723b5869cc4745cb885f0b3cab463863adc0f4))


### Miscellaneous

* **admin:** renamed service to 'admin' ([#3035](https://github.com/lies-exposed/lies.exposed/issues/3035)) ([b88833a](https://github.com/lies-exposed/lies.exposed/commit/b88833a6a915bd0d9e0da639b034642b614a01eb))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* reference AGENTS.md directly in CLAUDE.md ([#3033](https://github.com/lies-exposed/lies.exposed/issues/3033)) ([c44e7fe](https://github.com/lies-exposed/lies.exposed/commit/c44e7fe1ad40c98732b173c6e0c9faaf810657ee))
* **workspace:** bump supertest from 7.1.0 to 7.2.2 ([#3027](https://github.com/lies-exposed/lies.exposed/issues/3027)) ([7b7ece9](https://github.com/lies-exposed/lies.exposed/commit/7b7ece9e22aa502a13b44d2c3e5171803b32e0c1))
* **workspace:** pnpm overrides for zod@^4 ([#3042](https://github.com/lies-exposed/lies.exposed/issues/3042)) ([334ef1d](https://github.com/lies-exposed/lies.exposed/commit/334ef1d9ab455ba643a561e39daed4f1a8eda60e))
* **workspace:** support only current architecture with pnpm ([#3028](https://github.com/lies-exposed/lies.exposed/issues/3028)) ([ea983bc](https://github.com/lies-exposed/lies.exposed/commit/ea983bc5e2a50a008117b3c46ed1eb25b37fe62b))

## [0.1.7](https://github.com/lies-exposed/lies.exposed/compare/0.1.6...0.1.7) (2026-01-07)


### Miscellaneous

* removed path patterns for running pull-request workflow ([#3023](https://github.com/lies-exposed/lies.exposed/issues/3023)) ([ab0c64c](https://github.com/lies-exposed/lies.exposed/commit/ab0c64c3001b71dd0b41d3fe34aaa4a3cac4140c))
* **worker:** proper mocks initialization for e2e tests ([#2998](https://github.com/lies-exposed/lies.exposed/issues/2998)) ([4619599](https://github.com/lies-exposed/lies.exposed/commit/4619599251bb8eca66c3a35ad17d10e0f9c3d2a9))
* **workspace:** added agent instruction to connect to prod cluster with kubectl ([#3000](https://github.com/lies-exposed/lies.exposed/issues/3000)) ([550c9b7](https://github.com/lies-exposed/lies.exposed/commit/550c9b772c545677ae48c2ac1de15a281bf98fae))
* **workspace:** avoid commenting the addressed comments in PR ([#3018](https://github.com/lies-exposed/lies.exposed/issues/3018)) ([5f828af](https://github.com/lies-exposed/lies.exposed/commit/5f828afdb4af793bd62081acc4df0715c462a6d2))
* **workspace:** bump @vitest/coverage-v8 from 4.0.4 to 4.0.16 ([#3022](https://github.com/lies-exposed/lies.exposed/issues/3022)) ([47b86a0](https://github.com/lies-exposed/lies.exposed/commit/47b86a0e900da93df633ef3efb14e30bf46a170a))
* **workspace:** run knip-report CI job when packages@liexp/* or services/* have detected changes ([#3004](https://github.com/lies-exposed/lies.exposed/issues/3004)) ([0020ca3](https://github.com/lies-exposed/lies.exposed/commit/0020ca3b62e27140c1f33379ea6889295ac7a2b4))

## [0.1.6](https://github.com/lies-exposed/lies.exposed/compare/0.1.5...0.1.6) (2026-01-05)


### Miscellaneous

* added prompt to address review comments ([#2990](https://github.com/lies-exposed/lies.exposed/issues/2990)) ([bdeedef](https://github.com/lies-exposed/lies.exposed/commit/bdeedefa9aaed9ee2894ce24e23cda39697501ae))
* **workspace:** always update root tag with release-please ([#2992](https://github.com/lies-exposed/lies.exposed/issues/2992)) ([b849a58](https://github.com/lies-exposed/lies.exposed/commit/b849a58eaa9a7ccda1cfa2c7466d98f9d164bbfd))
* **workspace:** configure workspace MCP servers ([#2996](https://github.com/lies-exposed/lies.exposed/issues/2996)) ([6de314c](https://github.com/lies-exposed/lies.exposed/commit/6de314c567ea07bb95b60c8a9214b0a981fc75e9))
* **workspace:** only lint and build changed packages on pre-push ([#2993](https://github.com/lies-exposed/lies.exposed/issues/2993)) ([6702c26](https://github.com/lies-exposed/lies.exposed/commit/6702c264806f60b79b52454ad9a0b1bee9261c08))

## [0.1.5](https://github.com/lies-exposed/lies.exposed/compare/0.1.4...0.1.5) (2026-01-05)


### Bug Fixes

* **backend:** fix SPA fallback route not matching root path in Express 5 ([#2974](https://github.com/lies-exposed/lies.exposed/issues/2974)) ([ce813ed](https://github.com/lies-exposed/lies.exposed/commit/ce813ed96b603325b85cbd1684796f4dc370aab9))


### Miscellaneous

* **agent:** expose service running on port 3003 to port 80 ([#2976](https://github.com/lies-exposed/lies.exposed/issues/2976)) ([7bed688](https://github.com/lies-exposed/lies.exposed/commit/7bed688fd7c75aee8d3cdc05d7c63c2f8166d771))
* **workspace:** added pg and playwright MCP server configurations ([#2977](https://github.com/lies-exposed/lies.exposed/issues/2977)) ([bcfc088](https://github.com/lies-exposed/lies.exposed/commit/bcfc088252c710967199673566f88f23c12a6263))
* **workspace:** disabled watch as default for running tests ([#2982](https://github.com/lies-exposed/lies.exposed/issues/2982)) ([abc2ea9](https://github.com/lies-exposed/lies.exposed/commit/abc2ea983764205742b91dfffaa5f404ad138e81))

## [0.1.4](https://github.com/lies-exposed/lies.exposed/compare/0.1.3...0.1.4) (2026-01-03)


### Bug Fixes

* **backend:** vite server helper catch-all path ([#2965](https://github.com/lies-exposed/lies.exposed/issues/2965)) ([20d2f06](https://github.com/lies-exposed/lies.exposed/commit/20d2f06410c4e38e36675b542707fc27416a9995))
* **ui:** use react-hook-form hooks to keep TextWithSlugInput values in syn ([#2971](https://github.com/lies-exposed/lies.exposed/issues/2971)) ([88f3f2d](https://github.com/lies-exposed/lies.exposed/commit/88f3f2d4a06e8b3a5a13574ee8b3686486247df2))


### Miscellaneous

* **admin:** added vitest configuration for e2e tests ([#2968](https://github.com/lies-exposed/lies.exposed/issues/2968)) ([6f6dd39](https://github.com/lies-exposed/lies.exposed/commit/6f6dd39b909dd637f501d3d8030deecd0fbc8dfd))
* **backend:** moved node SSR logic from @liexp/ui ([#2967](https://github.com/lies-exposed/lies.exposed/issues/2967)) ([a6ed9f0](https://github.com/lies-exposed/lies.exposed/commit/a6ed9f0579033fbf556e805ea1ed4dda46cef899))
* deploy of admin-web service ([#2963](https://github.com/lies-exposed/lies.exposed/issues/2963)) ([956f071](https://github.com/lies-exposed/lies.exposed/commit/956f0713d15f65b3c2ab3ca9ec16eb1457c00900))
* **web:** added vitest configuration for e2e tests ([#2969](https://github.com/lies-exposed/lies.exposed/issues/2969)) ([01a18be](https://github.com/lies-exposed/lies.exposed/commit/01a18bead95bb71e842ccbd57441987f2934e295))

## [0.1.3](https://github.com/lies-exposed/lies.exposed/compare/0.1.2...0.1.3) (2026-01-01)


### Miscellaneous

* **admin:** kubernetes deploy configuration ([#2960](https://github.com/lies-exposed/lies.exposed/issues/2960)) ([3397b37](https://github.com/lies-exposed/lies.exposed/commit/3397b37c356e71d01d3173125b34365de1e7c2d3))

## [0.1.2](https://github.com/lies-exposed/lies.exposed/compare/0.1.1...0.1.2) (2026-01-01)


### Bug Fixes

* update CI workflows and dependabot config ([#2931](https://github.com/lies-exposed/lies.exposed/issues/2931)) ([0ad010e](https://github.com/lies-exposed/lies.exposed/commit/0ad010ed4cc6ae8a830d58879b5e9272bd093290))


### Miscellaneous

* added 'actions: write' permission to release-please CI workflow ([#2927](https://github.com/lies-exposed/lies.exposed/issues/2927)) ([0f13154](https://github.com/lies-exposed/lies.exposed/commit/0f13154e031d8adf05ae18f54ed62670f867a895))
* **deps-dev:** bump @types/d3-sankey from 0.12.4 to 0.12.5 ([#2938](https://github.com/lies-exposed/lies.exposed/issues/2938)) ([07de970](https://github.com/lies-exposed/lies.exposed/commit/07de97005cfc29b05b869d7eb048aa25945c0553))
* **deps-dev:** bump @types/lodash from 4.17.20 to 4.17.21 ([#2939](https://github.com/lies-exposed/lies.exposed/issues/2939)) ([d027f03](https://github.com/lies-exposed/lies.exposed/commit/d027f033cf9a7c631e1434a23851d3cdc99dd3a4))
* **deps-dev:** bump knip from 5.76.1 to 5.78.0 ([#2944](https://github.com/lies-exposed/lies.exposed/issues/2944)) ([d19cdb9](https://github.com/lies-exposed/lies.exposed/commit/d19cdb961f8644ac46bbfe721b036e2a8c70317b))
* **deps:** bump actions/cache from 4 to 5 ([#2936](https://github.com/lies-exposed/lies.exposed/issues/2936)) ([d33a087](https://github.com/lies-exposed/lies.exposed/commit/d33a08794e564867415fed644569d95c6b7248ee))
* **deps:** bump actions/checkout from 3 to 6 ([#2933](https://github.com/lies-exposed/lies.exposed/issues/2933)) ([89aa91a](https://github.com/lies-exposed/lies.exposed/commit/89aa91ad084bf6943da0fc2fcd0af8887c5436e0))
* **deps:** bump actions/download-artifact from 4 to 7 ([#2934](https://github.com/lies-exposed/lies.exposed/issues/2934)) ([f8b229e](https://github.com/lies-exposed/lies.exposed/commit/f8b229eaf1950196e8933992164157d4c3b7ceb1))
* **deps:** bump actions/setup-node in /.github/actions/install-deps ([#2947](https://github.com/lies-exposed/lies.exposed/issues/2947)) ([e939548](https://github.com/lies-exposed/lies.exposed/commit/e9395487a6b7539252dd692ffc38e06f69dd7d0d))
* **deps:** bump actions/upload-artifact from 4 to 6 ([#2932](https://github.com/lies-exposed/lies.exposed/issues/2932)) ([9fc526f](https://github.com/lies-exposed/lies.exposed/commit/9fc526f14d738c7a1eea0b7b525174985f7016de))
* **deps:** bump marocchino/validate-dependabot from 2 to 3 ([#2935](https://github.com/lies-exposed/lies.exposed/issues/2935)) ([ae8d0af](https://github.com/lies-exposed/lies.exposed/commit/ae8d0af6dea8a5e33df53be4f5cf19fced4bfb7c))
* **deps:** bump pdfjs-dist from 5.4.149 to 5.4.530 ([#2941](https://github.com/lies-exposed/lies.exposed/issues/2941)) ([3b64984](https://github.com/lies-exposed/lies.exposed/commit/3b64984ce77017e64481035ce98ef3411980cbc7))
* **deps:** bump typeorm from 0.3.27 to 0.3.28 ([#2937](https://github.com/lies-exposed/lies.exposed/issues/2937)) ([d4fb0d8](https://github.com/lies-exposed/lies.exposed/commit/d4fb0d80a1222e8c25942fac4e229b57bfa00576))
* include '.github/actions' directory in dependabot 'github-actions' ecosystem updates ([#2942](https://github.com/lies-exposed/lies.exposed/issues/2942)) ([6dc1d01](https://github.com/lies-exposed/lies.exposed/commit/6dc1d01449e7c9620eaa5c93de51042c3c58b650))
* no-cache for the docker-build-and-push action ([#2959](https://github.com/lies-exposed/lies.exposed/issues/2959)) ([b71c60e](https://github.com/lies-exposed/lies.exposed/commit/b71c60e43ae202003fef7d028823955804853c1e))
* removed 'actions: write' permission to release-please CI workflow ([#2958](https://github.com/lies-exposed/lies.exposed/issues/2958)) ([b257f80](https://github.com/lies-exposed/lies.exposed/commit/b257f800562bd8798a7f7713e200dd00ba38b889))
* **workspace:** updated copilot instructions ([#2929](https://github.com/lies-exposed/lies.exposed/issues/2929)) ([f22cf1a](https://github.com/lies-exposed/lies.exposed/commit/f22cf1af661d536134cb9ec27737eb8bbefd53eb))

## [0.1.1](https://github.com/lies-exposed/lies.exposed/compare/0.1.0...0.1.1) (2025-12-30)


### Miscellaneous

* **deps-dev:** bump @tanstack/eslint-plugin-query from 5.83.1 to 5.91.2. ([#2914](https://github.com/lies-exposed/lies.exposed/issues/2914)) ([fa76a51](https://github.com/lies-exposed/lies.exposed/commit/fa76a51b3aa16eeab73b091337958cce0d90bf52))
* empty the manifest entries ([#2921](https://github.com/lies-exposed/lies.exposed/issues/2921)) ([25c6581](https://github.com/lies-exposed/lies.exposed/commit/25c658149a0762cbc013f3fb5380d0d200844985))
* include 'worker' component in tag ([#2924](https://github.com/lies-exposed/lies.exposed/issues/2924)) ([8908374](https://github.com/lies-exposed/lies.exposed/commit/8908374073bcccce67ed1aad98b3005127166845))
* release please configuration for 0.1.1 ([#2922](https://github.com/lies-exposed/lies.exposed/issues/2922)) ([af5e724](https://github.com/lies-exposed/lies.exposed/commit/af5e724523e16c568186a4319eead49b294800e7))
* set initial-version for release-please to 0.1.0 ([#2919](https://github.com/lies-exposed/lies.exposed/issues/2919)) ([cc8ad2f](https://github.com/lies-exposed/lies.exposed/commit/cc8ad2f1223b7b385daca3bef44acfcbf22ac212))
* **storybook:** bump the storybook group from 10.1.10 to 10.1.11 ([#2912](https://github.com/lies-exposed/lies.exposed/issues/2912)) ([b9286ae](https://github.com/lies-exposed/lies.exposed/commit/b9286aefa5ac3039bfe9155a4fb9176a6d7e9f77))
* use changelog-type default for bootstrap ([#2920](https://github.com/lies-exposed/lies.exposed/issues/2920)) ([3e761cb](https://github.com/lies-exposed/lies.exposed/commit/3e761cbb6384501ceae5336916fed3ab59158edb))
* **workspace:** bump the vite group across 8 directories with 2 updates ([#2894](https://github.com/lies-exposed/lies.exposed/issues/2894)) ([9b335af](https://github.com/lies-exposed/lies.exposed/commit/9b335afd53d543e8225464c7cb93d62986bb8b9b))
* **workspace:** renamed storybook package to @liexp/storybook ([#2925](https://github.com/lies-exposed/lies.exposed/issues/2925)) ([0143865](https://github.com/lies-exposed/lies.exposed/commit/014386568140ef6c362f289936e036de07fe077c))
