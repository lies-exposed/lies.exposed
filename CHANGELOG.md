# Changelog

## [0.3.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.2.5...lies.exposed@0.3.0) (2026-02-11)


### Bug Fixes

* **workspace:** expose current version info ([#3166](https://github.com/lies-exposed/lies.exposed/issues/3166)) ([a2230f7](https://github.com/lies-exposed/lies.exposed/commit/a2230f7c37f90f0ced8dc272ccb861cd749e08bf))


### Miscellaneous

* bump storybook from 10.1.11 to 10.2.8 ([#3168](https://github.com/lies-exposed/lies.exposed/issues/3168)) ([8652d12](https://github.com/lies-exposed/lies.exposed/commit/8652d1219ce5877feb9a90bce51bdb2badc50620))
* ignore 'lib' and 'build' folders recursively to unload TS LSP server ([#3184](https://github.com/lies-exposed/lies.exposed/issues/3184)) ([f88b5d0](https://github.com/lies-exposed/lies.exposed/commit/f88b5d0b560a23fab8adc076f9de32e0c35ac89c))
* renamed cloudflared tunnel name to 'lies-exposed-tunnel' ([#3155](https://github.com/lies-exposed/lies.exposed/issues/3155)) ([f9d5f8a](https://github.com/lies-exposed/lies.exposed/commit/f9d5f8a19826273a91b943efd627d0b2ed89a817))
* **workspace:** knip issues with vitest configs ([#3183](https://github.com/lies-exposed/lies.exposed/issues/3183)) ([01180b8](https://github.com/lies-exposed/lies.exposed/commit/01180b83ada8d50165fce59869fcef49a632aa48))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))

## [0.2.5](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.1.13...lies.exposed@0.2.5) (2026-01-30)


### Bug Fixes

* **agent:** provide searchWebTools in agent service ([#3045](https://github.com/lies-exposed/lies.exposed/issues/3045)) ([1191a71](https://github.com/lies-exposed/lies.exposed/commit/1191a713da3eb66fa59f4ce275fc7f6e88a47693))
* **agent:** support Anthropic AI provider ([#3115](https://github.com/lies-exposed/lies.exposed/issues/3115)) ([2952200](https://github.com/lies-exposed/lies.exposed/commit/29522002dc161e57dbac13af0e9c317a839cb4c5))
* **ai-bot:** remove loadDocs flow in favor of agent tools ([#3048](https://github.com/lies-exposed/lies.exposed/issues/3048)) ([144bb66](https://github.com/lies-exposed/lies.exposed/commit/144bb6671520d893e6f1975f995e589412f00838))
* **backend:** added brave provider for web searches ([#3044](https://github.com/lies-exposed/lies.exposed/issues/3044)) ([e1723b5](https://github.com/lies-exposed/lies.exposed/commit/e1723b5869cc4745cb885f0b3cab463863adc0f4))
* **backend:** fix SPA fallback route not matching root path in Express 5 ([#2974](https://github.com/lies-exposed/lies.exposed/issues/2974)) ([ce813ed](https://github.com/lies-exposed/lies.exposed/commit/ce813ed96b603325b85cbd1684796f4dc370aab9))
* **backend:** vite server helper catch-all path ([#2965](https://github.com/lies-exposed/lies.exposed/issues/2965)) ([20d2f06](https://github.com/lies-exposed/lies.exposed/commit/20d2f06410c4e38e36675b542707fc27416a9995))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* **ui:** use react-hook-form hooks to keep TextWithSlugInput values in syn ([#2971](https://github.com/lies-exposed/lies.exposed/issues/2971)) ([88f3f2d](https://github.com/lies-exposed/lies.exposed/commit/88f3f2d4a06e8b3a5a13574ee8b3686486247df2))
* update CI workflows and dependabot config ([#2931](https://github.com/lies-exposed/lies.exposed/issues/2931)) ([0ad010e](https://github.com/lies-exposed/lies.exposed/commit/0ad010ed4cc6ae8a830d58879b5e9272bd093290))


### Miscellaneous

* added 'actions: write' permission to release-please CI workflow ([#2927](https://github.com/lies-exposed/lies.exposed/issues/2927)) ([0f13154](https://github.com/lies-exposed/lies.exposed/commit/0f13154e031d8adf05ae18f54ed62670f867a895))
* added prompt to address review comments ([#2990](https://github.com/lies-exposed/lies.exposed/issues/2990)) ([bdeedef](https://github.com/lies-exposed/lies.exposed/commit/bdeedefa9aaed9ee2894ce24e23cda39697501ae))
* **admin:** added vitest configuration for e2e tests ([#2968](https://github.com/lies-exposed/lies.exposed/issues/2968)) ([6f6dd39](https://github.com/lies-exposed/lies.exposed/commit/6f6dd39b909dd637f501d3d8030deecd0fbc8dfd))
* **admin:** kubernetes deploy configuration ([#2960](https://github.com/lies-exposed/lies.exposed/issues/2960)) ([3397b37](https://github.com/lies-exposed/lies.exposed/commit/3397b37c356e71d01d3173125b34365de1e7c2d3))
* **admin:** renamed service to 'admin' ([#3035](https://github.com/lies-exposed/lies.exposed/issues/3035)) ([b88833a](https://github.com/lies-exposed/lies.exposed/commit/b88833a6a915bd0d9e0da639b034642b614a01eb))
* **admin:** setup custom HMR port for server ([#3051](https://github.com/lies-exposed/lies.exposed/issues/3051)) ([99ef38c](https://github.com/lies-exposed/lies.exposed/commit/99ef38c1d3f8b299341ed2df4dc9197eda0ef4be))
* **agent:** added e2e test for chat stream endpoint ([#3109](https://github.com/lies-exposed/lies.exposed/issues/3109)) ([ec1ea38](https://github.com/lies-exposed/lies.exposed/commit/ec1ea3807265b573f4677733bbdf0ebf022c9ba5))
* **agent:** expose service running on port 3003 to port 80 ([#2976](https://github.com/lies-exposed/lies.exposed/issues/2976)) ([7bed688](https://github.com/lies-exposed/lies.exposed/commit/7bed688fd7c75aee8d3cdc05d7c63c2f8166d771))
* **agent:** use [@ts-endpoint](https://github.com/ts-endpoint) stream endpoint definition ([#3112](https://github.com/lies-exposed/lies.exposed/issues/3112)) ([52c265d](https://github.com/lies-exposed/lies.exposed/commit/52c265d95ac581d7f61a17da19ed9cdf71833ae7))
* **api:** removed puppeteer and puppeteer-extra deps and dead code ([#3149](https://github.com/lies-exposed/lies.exposed/issues/3149)) ([1a6ddab](https://github.com/lies-exposed/lies.exposed/commit/1a6ddabb6a28d42727b94954035f197b4f3646e5))
* **backend:** moved node SSR logic from @liexp/ui ([#2967](https://github.com/lies-exposed/lies.exposed/issues/2967)) ([a6ed9f0](https://github.com/lies-exposed/lies.exposed/commit/a6ed9f0579033fbf556e805ea1ed4dda46cef899))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* copy @liexp/eslint-config in dev layers of docker images ([#3125](https://github.com/lies-exposed/lies.exposed/issues/3125)) ([4b0c0c4](https://github.com/lies-exposed/lies.exposed/commit/4b0c0c43e2fb1aa2e2b68448174542eb657eaca6))
* deploy of admin-web service ([#2963](https://github.com/lies-exposed/lies.exposed/issues/2963)) ([956f071](https://github.com/lies-exposed/lies.exposed/commit/956f0713d15f65b3c2ab3ca9ec16eb1457c00900))
* **deps-dev:** bump @tanstack/eslint-plugin-query from 5.83.1 to 5.91.2. ([#2914](https://github.com/lies-exposed/lies.exposed/issues/2914)) ([fa76a51](https://github.com/lies-exposed/lies.exposed/commit/fa76a51b3aa16eeab73b091337958cce0d90bf52))
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
* **deps:** bump uuid from 11.1.0 to 13.0.0 ([#2940](https://github.com/lies-exposed/lies.exposed/issues/2940)) ([45a4e15](https://github.com/lies-exposed/lies.exposed/commit/45a4e15ec0bbfc5f0c8f803b3435c89708a5bb5f))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* **docs:** added comprehensive docs for packages and services ([#3122](https://github.com/lies-exposed/lies.exposed/issues/3122)) ([e7ea6fa](https://github.com/lies-exposed/lies.exposed/commit/e7ea6fa1786a14cd10b41f9da90c36a392836901))
* empty the manifest entries ([#2921](https://github.com/lies-exposed/lies.exposed/issues/2921)) ([25c6581](https://github.com/lies-exposed/lies.exposed/commit/25c658149a0762cbc013f3fb5380d0d200844985))
* ignore dependabot updates for node 25 types ([#3102](https://github.com/lies-exposed/lies.exposed/issues/3102)) ([1447d83](https://github.com/lies-exposed/lies.exposed/commit/1447d834c63bd33cca01e29284bafd2be4c9730e))
* include '.github/actions' directory in dependabot 'github-actions' ecosystem updates ([#2942](https://github.com/lies-exposed/lies.exposed/issues/2942)) ([6dc1d01](https://github.com/lies-exposed/lies.exposed/commit/6dc1d01449e7c9620eaa5c93de51042c3c58b650))
* include 'deps' and 'dev-deps' commit scope in workspace release changelog ([#3085](https://github.com/lies-exposed/lies.exposed/issues/3085)) ([f0485f2](https://github.com/lies-exposed/lies.exposed/commit/f0485f2656fa258687f5d11945c397b1a6990641))
* include 'worker' component in tag ([#2924](https://github.com/lies-exposed/lies.exposed/issues/2924)) ([8908374](https://github.com/lies-exposed/lies.exposed/commit/8908374073bcccce67ed1aad98b3005127166845))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* no-cache for the docker-build-and-push action ([#2959](https://github.com/lies-exposed/lies.exposed/issues/2959)) ([b71c60e](https://github.com/lies-exposed/lies.exposed/commit/b71c60e43ae202003fef7d028823955804853c1e))
* reference AGENTS.md directly in CLAUDE.md ([#3033](https://github.com/lies-exposed/lies.exposed/issues/3033)) ([c44e7fe](https://github.com/lies-exposed/lies.exposed/commit/c44e7fe1ad40c98732b173c6e0c9faaf810657ee))
* release  0.1.1 ([#2923](https://github.com/lies-exposed/lies.exposed/issues/2923)) ([a027e30](https://github.com/lies-exposed/lies.exposed/commit/a027e304508b1f02bad1db62d7471a8e0cd145ec))
* release  0.1.10 ([#3087](https://github.com/lies-exposed/lies.exposed/issues/3087)) ([533f416](https://github.com/lies-exposed/lies.exposed/commit/533f4165ee50af12d73fa1d6e36d43acd76957ee))
* release  0.1.11 ([#3110](https://github.com/lies-exposed/lies.exposed/issues/3110)) ([c90911d](https://github.com/lies-exposed/lies.exposed/commit/c90911d8a868e10c76b5c1204c3d9b6c89cd09fe))
* release  0.1.12 ([#3119](https://github.com/lies-exposed/lies.exposed/issues/3119)) ([f68b50a](https://github.com/lies-exposed/lies.exposed/commit/f68b50a33f518bdaf2cc1f0e6bbd3d610a1245a2))
* release  0.1.13 ([#3128](https://github.com/lies-exposed/lies.exposed/issues/3128)) ([12031de](https://github.com/lies-exposed/lies.exposed/commit/12031deda14ae5873eafbfddc46df96bf0f1f595))
* release  0.1.2 ([#2930](https://github.com/lies-exposed/lies.exposed/issues/2930)) ([c8bd7a9](https://github.com/lies-exposed/lies.exposed/commit/c8bd7a994c3f114807b00b8855a495e467dcf735))
* release  0.1.3 ([#2962](https://github.com/lies-exposed/lies.exposed/issues/2962)) ([8b5c010](https://github.com/lies-exposed/lies.exposed/commit/8b5c0104443fa67a48bf6f54ec2c9b65cb0662f7))
* release  0.1.4 ([#2964](https://github.com/lies-exposed/lies.exposed/issues/2964)) ([f506ebf](https://github.com/lies-exposed/lies.exposed/commit/f506ebfaea62f600e83be963ae872efba9c14917))
* release  0.1.5 ([#2975](https://github.com/lies-exposed/lies.exposed/issues/2975)) ([e674ffb](https://github.com/lies-exposed/lies.exposed/commit/e674ffb193fb2d78ee1762433d371cbe87725879))
* release  0.1.6 ([#2989](https://github.com/lies-exposed/lies.exposed/issues/2989)) ([f3a692b](https://github.com/lies-exposed/lies.exposed/commit/f3a692bc267c1c4d168c9bc02df5c307679dc843))
* release  0.1.7 ([#2999](https://github.com/lies-exposed/lies.exposed/issues/2999)) ([7b73dce](https://github.com/lies-exposed/lies.exposed/commit/7b73dce7b5e5aa202d8d972019f4676249ed7d54))
* release  0.1.8 ([#3026](https://github.com/lies-exposed/lies.exposed/issues/3026)) ([857453b](https://github.com/lies-exposed/lies.exposed/commit/857453b8c1b3960513723ab18b729a590cfe9dd6))
* release  0.1.9 ([#3047](https://github.com/lies-exposed/lies.exposed/issues/3047)) ([afa22b6](https://github.com/lies-exposed/lies.exposed/commit/afa22b62a34af2fe0d36f44e4e97ebeb450b3224))
* release please configuration for 0.1.1 ([#2922](https://github.com/lies-exposed/lies.exposed/issues/2922)) ([af5e724](https://github.com/lies-exposed/lies.exposed/commit/af5e724523e16c568186a4319eead49b294800e7))
* release-please unique tag ([#3151](https://github.com/lies-exposed/lies.exposed/issues/3151)) ([d2b852c](https://github.com/lies-exposed/lies.exposed/commit/d2b852c8ac126d96ccfccf59bef571c24c8cfb6c))
* removed 'actions: write' permission to release-please CI workflow ([#2958](https://github.com/lies-exposed/lies.exposed/issues/2958)) ([b257f80](https://github.com/lies-exposed/lies.exposed/commit/b257f800562bd8798a7f7713e200dd00ba38b889))
* removed path patterns for running pull-request workflow ([#3023](https://github.com/lies-exposed/lies.exposed/issues/3023)) ([ab0c64c](https://github.com/lies-exposed/lies.exposed/commit/ab0c64c3001b71dd0b41d3fe34aaa4a3cac4140c))
* set initial-version for release-please to 0.1.0 ([#2919](https://github.com/lies-exposed/lies.exposed/issues/2919)) ([cc8ad2f](https://github.com/lies-exposed/lies.exposed/commit/cc8ad2f1223b7b385daca3bef44acfcbf22ac212))
* **shared:** added unit tests for helpers and utils ([#3090](https://github.com/lies-exposed/lies.exposed/issues/3090)) ([f1a6f7a](https://github.com/lies-exposed/lies.exposed/commit/f1a6f7aad7c86906d293a4f9ee6d7e92bc1d71d9))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))
* split initial docs into sub documents and sub sections ([#3130](https://github.com/lies-exposed/lies.exposed/issues/3130)) ([1609fc7](https://github.com/lies-exposed/lies.exposed/commit/1609fc728dd60cb72690d4151c12ce73b6085507))
* **storybook:** bump the storybook group from 10.1.10 to 10.1.11 ([#2912](https://github.com/lies-exposed/lies.exposed/issues/2912)) ([b9286ae](https://github.com/lies-exposed/lies.exposed/commit/b9286aefa5ac3039bfe9155a4fb9176a6d7e9f77))
* **storybook:** keep track of .env.prod ([#3137](https://github.com/lies-exposed/lies.exposed/issues/3137)) ([05fc3d6](https://github.com/lies-exposed/lies.exposed/commit/05fc3d6ea7e257a874644dff1ce8484bc535a6a5))
* **storybook:** sync build output on minio and serve via nginx ([#3131](https://github.com/lies-exposed/lies.exposed/issues/3131)) ([194ccda](https://github.com/lies-exposed/lies.exposed/commit/194ccda0f8f2d7d3408f9d1cdb46ced05babb98f))
* use changelog-type default for bootstrap ([#2920](https://github.com/lies-exposed/lies.exposed/issues/2920)) ([3e761cb](https://github.com/lies-exposed/lies.exposed/commit/3e761cbb6384501ceae5336916fed3ab59158edb))
* **web:** added vitest configuration for e2e tests ([#2969](https://github.com/lies-exposed/lies.exposed/issues/2969)) ([01a18be](https://github.com/lies-exposed/lies.exposed/commit/01a18bead95bb71e842ccbd57441987f2934e295))
* **web:** removed unused files ([#3049](https://github.com/lies-exposed/lies.exposed/issues/3049)) ([591a382](https://github.com/lies-exposed/lies.exposed/commit/591a382ff290dc71b790d471f5c56d1b22231866))
* **worker:** proper mocks initialization for e2e tests ([#2998](https://github.com/lies-exposed/lies.exposed/issues/2998)) ([4619599](https://github.com/lies-exposed/lies.exposed/commit/4619599251bb8eca66c3a35ad17d10e0f9c3d2a9))
* **workspace:** added agent instruction to connect to prod cluster with kubectl ([#3000](https://github.com/lies-exposed/lies.exposed/issues/3000)) ([550c9b7](https://github.com/lies-exposed/lies.exposed/commit/550c9b772c545677ae48c2ac1de15a281bf98fae))
* **workspace:** added pg and playwright MCP server configurations ([#2977](https://github.com/lies-exposed/lies.exposed/issues/2977)) ([bcfc088](https://github.com/lies-exposed/lies.exposed/commit/bcfc088252c710967199673566f88f23c12a6263))
* **workspace:** added script to lint only changed file ([#3054](https://github.com/lies-exposed/lies.exposed/issues/3054)) ([ae6c2b3](https://github.com/lies-exposed/lies.exposed/commit/ae6c2b3696f11a51a1dc88a712eeefa9800fd763))
* **workspace:** always update root tag with release-please ([#2992](https://github.com/lies-exposed/lies.exposed/issues/2992)) ([b849a58](https://github.com/lies-exposed/lies.exposed/commit/b849a58eaa9a7ccda1cfa2c7466d98f9d164bbfd))
* **workspace:** avoid commenting the addressed comments in PR ([#3018](https://github.com/lies-exposed/lies.exposed/issues/3018)) ([5f828af](https://github.com/lies-exposed/lies.exposed/commit/5f828afdb4af793bd62081acc4df0715c462a6d2))
* **workspace:** bump @vitest/coverage-v8 from 4.0.4 to 4.0.16 ([#3022](https://github.com/lies-exposed/lies.exposed/issues/3022)) ([47b86a0](https://github.com/lies-exposed/lies.exposed/commit/47b86a0e900da93df633ef3efb14e30bf46a170a))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump nginx image for telegram.liexp.dev to 1.27.1-alpine ([#3065](https://github.com/lies-exposed/lies.exposed/issues/3065)) ([92cf396](https://github.com/lies-exposed/lies.exposed/commit/92cf39664727bf87b94d146f1c53a1c61111eef2))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
* **workspace:** bump supertest from 7.1.0 to 7.2.2 ([#3027](https://github.com/lies-exposed/lies.exposed/issues/3027)) ([7b7ece9](https://github.com/lies-exposed/lies.exposed/commit/7b7ece9e22aa502a13b44d2c3e5171803b32e0c1))
* **workspace:** bump the vite group across 8 directories with 2 updates ([#2894](https://github.com/lies-exposed/lies.exposed/issues/2894)) ([9b335af](https://github.com/lies-exposed/lies.exposed/commit/9b335afd53d543e8225464c7cb93d62986bb8b9b))
* **workspace:** ci workflow caching and actions improvements ([#3147](https://github.com/lies-exposed/lies.exposed/issues/3147)) ([1b06cd8](https://github.com/lies-exposed/lies.exposed/commit/1b06cd8df64f4c2e23430ec9e628482aceada95a))
* **workspace:** configure workspace MCP servers ([#2996](https://github.com/lies-exposed/lies.exposed/issues/2996)) ([6de314c](https://github.com/lies-exposed/lies.exposed/commit/6de314c567ea07bb95b60c8a9214b0a981fc75e9))
* **workspace:** deploy storybook only on release-please PR merge ([#3145](https://github.com/lies-exposed/lies.exposed/issues/3145)) ([2fccc38](https://github.com/lies-exposed/lies.exposed/commit/2fccc38ceb43d2d1581a53c357f342cb177e1228))
* **workspace:** disabled watch as default for running tests ([#2982](https://github.com/lies-exposed/lies.exposed/issues/2982)) ([abc2ea9](https://github.com/lies-exposed/lies.exposed/commit/abc2ea983764205742b91dfffaa5f404ad138e81))
* **workspace:** install tslib in dev deps ([#3050](https://github.com/lies-exposed/lies.exposed/issues/3050)) ([04449d3](https://github.com/lies-exposed/lies.exposed/commit/04449d397105a76742d10c9cfd0c67b033fbe99b))
* **workspace:** only lint and build changed packages on pre-push ([#2993](https://github.com/lies-exposed/lies.exposed/issues/2993)) ([6702c26](https://github.com/lies-exposed/lies.exposed/commit/6702c264806f60b79b52454ad9a0b1bee9261c08))
* **workspace:** pnpm overrides for zod@^4 ([#3042](https://github.com/lies-exposed/lies.exposed/issues/3042)) ([334ef1d](https://github.com/lies-exposed/lies.exposed/commit/334ef1d9ab455ba643a561e39daed4f1a8eda60e))
* **workspace:** reduced k8s services resources ([#3126](https://github.com/lies-exposed/lies.exposed/issues/3126)) ([68fe9d7](https://github.com/lies-exposed/lies.exposed/commit/68fe9d706263710e5713538f5d03d676312293ab))
* **workspace:** renamed storybook package to @liexp/storybook ([#2925](https://github.com/lies-exposed/lies.exposed/issues/2925)) ([0143865](https://github.com/lies-exposed/lies.exposed/commit/014386568140ef6c362f289936e036de07fe077c))
* **workspace:** run knip-report CI job when packages@liexp/* or services/* have detected changes ([#3004](https://github.com/lies-exposed/lies.exposed/issues/3004)) ([0020ca3](https://github.com/lies-exposed/lies.exposed/commit/0020ca3b62e27140c1f33379ea6889295ac7a2b4))
* **workspace:** set correct component selector for db-dump and db-prune jobs ([#3132](https://github.com/lies-exposed/lies.exposed/issues/3132)) ([029d461](https://github.com/lies-exposed/lies.exposed/commit/029d46113660a533e0bc922ae83ca993fe396de6))
* **workspace:** setup linked-versions plugin for release-please ([#3113](https://github.com/lies-exposed/lies.exposed/issues/3113)) ([51ab56f](https://github.com/lies-exposed/lies.exposed/commit/51ab56f2ebaaaefe351019d26021ccee1a004b81))
* **workspace:** support only current architecture with pnpm ([#3028](https://github.com/lies-exposed/lies.exposed/issues/3028)) ([ea983bc](https://github.com/lies-exposed/lies.exposed/commit/ea983bc5e2a50a008117b3c46ed1eb25b37fe62b))
* **workspace:** updated copilot instructions ([#2929](https://github.com/lies-exposed/lies.exposed/issues/2929)) ([f22cf1a](https://github.com/lies-exposed/lies.exposed/commit/f22cf1af661d536134cb9ec27737eb8bbefd53eb))

## [0.1.13](https://github.com/lies-exposed/lies.exposed/compare/0.1.12...0.1.13) (2026-01-28)


### Miscellaneous

* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))
* split initial docs into sub documents and sub sections ([#3130](https://github.com/lies-exposed/lies.exposed/issues/3130)) ([1609fc7](https://github.com/lies-exposed/lies.exposed/commit/1609fc728dd60cb72690d4151c12ce73b6085507))
* **storybook:** keep track of .env.prod ([#3137](https://github.com/lies-exposed/lies.exposed/issues/3137)) ([05fc3d6](https://github.com/lies-exposed/lies.exposed/commit/05fc3d6ea7e257a874644dff1ce8484bc535a6a5))
* **storybook:** sync build output on minio and serve via nginx ([#3131](https://github.com/lies-exposed/lies.exposed/issues/3131)) ([194ccda](https://github.com/lies-exposed/lies.exposed/commit/194ccda0f8f2d7d3408f9d1cdb46ced05babb98f))
* **workspace:** deploy storybook only on release-please PR merge ([#3145](https://github.com/lies-exposed/lies.exposed/issues/3145)) ([2fccc38](https://github.com/lies-exposed/lies.exposed/commit/2fccc38ceb43d2d1581a53c357f342cb177e1228))
* **workspace:** reduced k8s services resources ([#3126](https://github.com/lies-exposed/lies.exposed/issues/3126)) ([68fe9d7](https://github.com/lies-exposed/lies.exposed/commit/68fe9d706263710e5713538f5d03d676312293ab))
* **workspace:** set correct component selector for db-dump and db-prune jobs ([#3132](https://github.com/lies-exposed/lies.exposed/issues/3132)) ([029d461](https://github.com/lies-exposed/lies.exposed/commit/029d46113660a533e0bc922ae83ca993fe396de6))

## [0.1.12](https://github.com/lies-exposed/lies.exposed/compare/0.1.11...0.1.12) (2026-01-24)


### Bug Fixes

* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))


### Miscellaneous

* **docs:** added comprehensive docs for packages and services ([#3122](https://github.com/lies-exposed/lies.exposed/issues/3122)) ([e7ea6fa](https://github.com/lies-exposed/lies.exposed/commit/e7ea6fa1786a14cd10b41f9da90c36a392836901))

## [0.1.11](https://github.com/lies-exposed/lies.exposed/compare/0.1.10...0.1.11) (2026-01-23)


### Bug Fixes

* **agent:** support Anthropic AI provider ([#3115](https://github.com/lies-exposed/lies.exposed/issues/3115)) ([2952200](https://github.com/lies-exposed/lies.exposed/commit/29522002dc161e57dbac13af0e9c317a839cb4c5))


### Miscellaneous

* **agent:** added e2e test for chat stream endpoint ([#3109](https://github.com/lies-exposed/lies.exposed/issues/3109)) ([ec1ea38](https://github.com/lies-exposed/lies.exposed/commit/ec1ea3807265b573f4677733bbdf0ebf022c9ba5))
* **agent:** use [@ts-endpoint](https://github.com/ts-endpoint) stream endpoint definition ([#3112](https://github.com/lies-exposed/lies.exposed/issues/3112)) ([52c265d](https://github.com/lies-exposed/lies.exposed/commit/52c265d95ac581d7f61a17da19ed9cdf71833ae7))

## [0.1.10](https://github.com/lies-exposed/lies.exposed/compare/0.1.9...0.1.10) (2026-01-21)


### Miscellaneous

* **deps:** bump uuid from 11.1.0 to 13.0.0 ([#2940](https://github.com/lies-exposed/lies.exposed/issues/2940)) ([45a4e15](https://github.com/lies-exposed/lies.exposed/commit/45a4e15ec0bbfc5f0c8f803b3435c89708a5bb5f))
* ignore dependabot updates for node 25 types ([#3102](https://github.com/lies-exposed/lies.exposed/issues/3102)) ([1447d83](https://github.com/lies-exposed/lies.exposed/commit/1447d834c63bd33cca01e29284bafd2be4c9730e))
* include 'deps' and 'dev-deps' commit scope in workspace release changelog ([#3085](https://github.com/lies-exposed/lies.exposed/issues/3085)) ([f0485f2](https://github.com/lies-exposed/lies.exposed/commit/f0485f2656fa258687f5d11945c397b1a6990641))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* **shared:** added unit tests for helpers and utils ([#3090](https://github.com/lies-exposed/lies.exposed/issues/3090)) ([f1a6f7a](https://github.com/lies-exposed/lies.exposed/commit/f1a6f7aad7c86906d293a4f9ee6d7e92bc1d71d9))

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
