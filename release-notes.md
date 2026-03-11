:robot: I have created a release *beep* *boop*
---


<details><summary>@liexp/backend: 0.6.0</summary>

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...@liexp/backend@0.6.0) (2026-03-11)


### Features

* **admin:** implement frontend proxy integration (Phase 2) ([#2842](https://github.com/lies-exposed/lies.exposed/issues/2842)) ([1b9f2f7](https://github.com/lies-exposed/lies.exposed/commit/1b9f2f7271882863885e4ffb27b99c7e18f03252))
* **admin:** setup server ([#2840](https://github.com/lies-exposed/lies.exposed/issues/2840)) ([ea5d01d](https://github.com/lies-exposed/lies.exposed/commit/ea5d01d7b8d10423c2632dcb9611ad4f57bf70c5))
* **agent:** streamable chat endpoint ([#2845](https://github.com/lies-exposed/lies.exposed/issues/2845)) ([c7376ca](https://github.com/lies-exposed/lies.exposed/commit/c7376caab780cd66d3e7116471fbd6dd7fb2484a))
* **ai-bot:** use agent via http API ([#2809](https://github.com/lies-exposed/lies.exposed/issues/2809)) ([657ec21](https://github.com/lies-exposed/lies.exposed/commit/657ec218a45c861b06eb74a00310c4770ec435a3))
* **backend:** extract shared m2m auth infrastructure ([#2827](https://github.com/lies-exposed/lies.exposed/issues/2827)) ([72f2219](https://github.com/lies-exposed/lies.exposed/commit/72f2219ccdc64f81fc1797a446b7ce28edfdc05b))
* create actor relation ([#3167](https://github.com/lies-exposed/lies.exposed/issues/3167)) ([f251e56](https://github.com/lies-exposed/lies.exposed/commit/f251e56a8b360dae003b88601f5bbe03cdf4216e))


### Bug Fixes

* added more tools to get resources by id and added e2e tests ([cbd1492](https://github.com/lies-exposed/lies.exposed/commit/cbd1492348d8dcd23c94abe81d636f7ee0d1371e))
* **admin:** chat  tools and messages stream and UI adjustments ([#2981](https://github.com/lies-exposed/lies.exposed/issues/2981)) ([faa9068](https://github.com/lies-exposed/lies.exposed/commit/faa9068fdac40812d72d7c3661e6fa16aa8e2d5a))
* **admin:** filter links by events count ([#2978](https://github.com/lies-exposed/lies.exposed/issues/2978)) ([2baee88](https://github.com/lies-exposed/lies.exposed/commit/2baee882c054639ecc76437aaf7fd9589d6fa43a))
* **admin:** implement sorting for queue resources ([#3234](https://github.com/lies-exposed/lies.exposed/issues/3234)) ([9e2cb6b](https://github.com/lies-exposed/lies.exposed/commit/9e2cb6b264bf8afad3efef7bdc6ee38a25622429))
* advanced lazy-loading patterns for web bundle optimization ([#3235](https://github.com/lies-exposed/lies.exposed/issues/3235)) ([571c9b8](https://github.com/lies-exposed/lies.exposed/commit/571c9b8fca271601fa9e7d3c08f3c101a965a292))
* **agent:** add story CLI command group with spec tests ([#3351](https://github.com/lies-exposed/lies.exposed/issues/3351)) ([03aae78](https://github.com/lies-exposed/lies.exposed/commit/03aae782b20021988a19384bc0cd609c7e288e56))
* **agent:** agent supervisor ([#3344](https://github.com/lies-exposed/lies.exposed/issues/3344)) ([723675e](https://github.com/lies-exposed/lies.exposed/commit/723675e1f5b2e0c5474c40944239cf6b8b9cb9b7))
* **agent:** multiprovider AI agent configuration ([#3206](https://github.com/lies-exposed/lies.exposed/issues/3206)) ([06920b4](https://github.com/lies-exposed/lies.exposed/commit/06920b4bf246b7c22f5c5acc9f9cd8b4909a1e13))
* **agent:** provide cli tools to access platform resources ([#3332](https://github.com/lies-exposed/lies.exposed/issues/3332)) ([6ba161f](https://github.com/lies-exposed/lies.exposed/commit/6ba161fcc9dc132fdedc9d3b81a8b3432325dfc6))
* **agent:** provide searchWebTools in agent service ([#3045](https://github.com/lies-exposed/lies.exposed/issues/3045)) ([1191a71](https://github.com/lies-exposed/lies.exposed/commit/1191a713da3eb66fa59f4ce275fc7f6e88a47693))
* **agent:** support Anthropic AI provider ([#3115](https://github.com/lies-exposed/lies.exposed/issues/3115)) ([2952200](https://github.com/lies-exposed/lies.exposed/commit/29522002dc161e57dbac13af0e9c317a839cb4c5))
* **ai-bot:** create event from url queue job ([#3015](https://github.com/lies-exposed/lies.exposed/issues/3015)) ([b5bf5f2](https://github.com/lies-exposed/lies.exposed/commit/b5bf5f25761d3326bf1e93d375192eea2858f72b))
* **ai-bot:** created custom strategy for effect-to-zod schema compatibility with NGrok ([#2824](https://github.com/lies-exposed/lies.exposed/issues/2824)) ([8b3a0bc](https://github.com/lies-exposed/lies.exposed/commit/8b3a0bcbd2902fb5b7552598281f344ccbe74600))
* **ai-bot:** link metadata extraction and status filtering for admin  ([#3242](https://github.com/lies-exposed/lies.exposed/issues/3242)) ([8b2ce40](https://github.com/lies-exposed/lies.exposed/commit/8b2ce40aaf32c1c6798f282e49ff8e9e7335e015))
* **ai-bot:** remove loadDocs flow in favor of agent tools ([#3048](https://github.com/lies-exposed/lies.exposed/issues/3048)) ([144bb66](https://github.com/lies-exposed/lies.exposed/commit/144bb6671520d893e6f1975f995e589412f00838))
* **api:** actor and group avatar find tools ([#3213](https://github.com/lies-exposed/lies.exposed/issues/3213)) ([0f87695](https://github.com/lies-exposed/lies.exposed/commit/0f87695676d0beabbc2ed843e2515361b10155a2))
* **api:** add Redis response cache with HTTP Cache-Control headers ([#3241](https://github.com/lies-exposed/lies.exposed/issues/3241)) ([8bc2c0b](https://github.com/lies-exposed/lies.exposed/commit/8bc2c0b3e9a614d264aeb727a2422edad0b5f174))
* **api:** added 'getLink' MCP tool ([bf83a31](https://github.com/lies-exposed/lies.exposed/commit/bf83a310cefbe7f9cefc2321b323df7666643d37))
* **api:** added create and edit tools for every event type ([#2851](https://github.com/lies-exposed/lies.exposed/issues/2851)) ([f5e42a4](https://github.com/lies-exposed/lies.exposed/commit/f5e42a4ee39e3cebf5920daa873f1ac00f725b2e))
* **api:** added missing 'edit' MCP tools with e2e tests ([6ca4986](https://github.com/lies-exposed/lies.exposed/commit/6ca49865439a3715efa0e84384bc0976a75c8358))
* **api:** added missing 'get by id' MCP tools with e2e tests ([3f8b844](https://github.com/lies-exposed/lies.exposed/commit/3f8b844f77271aa7dd297ca7f7a20c47087e89ce))
* **api:** added tools to find and get nation entities ([#2983](https://github.com/lies-exposed/lies.exposed/issues/2983)) ([3e6de57](https://github.com/lies-exposed/lies.exposed/commit/3e6de57e4f0456a4892fc9facc010989540ecf81))
* **api:** don't apply cache to authenticated requests ([#3255](https://github.com/lies-exposed/lies.exposed/issues/3255)) ([7cea4ae](https://github.com/lies-exposed/lies.exposed/commit/7cea4ae0569452df643b52efd8e302a0f7990322))
* **api:** get event with deleted items for admins ([#3020](https://github.com/lies-exposed/lies.exposed/issues/3020)) ([0d10219](https://github.com/lies-exposed/lies.exposed/commit/0d102194a77d17278b31c44ff4b1fa9445e10390))
* **api:** merge events flow ([#3073](https://github.com/lies-exposed/lies.exposed/issues/3073)) ([03669c1](https://github.com/lies-exposed/lies.exposed/commit/03669c1fea5a2be404b531e00c1713c84fe137a2))
* **api:** prevent circular PARENT_CHILD relations crashing admin UI ([#3211](https://github.com/lies-exposed/lies.exposed/issues/3211)) ([7cad842](https://github.com/lies-exposed/lies.exposed/commit/7cad842a7d4c3560cdbb5427a9da261292dd320c))
* **api:** search improvements ([#3281](https://github.com/lies-exposed/lies.exposed/issues/3281)) ([9960c92](https://github.com/lies-exposed/lies.exposed/commit/9960c924c16ea78ed03e4c23b7268039b6889e89))
* **api:** stories validation ([#3270](https://github.com/lies-exposed/lies.exposed/issues/3270)) ([57dc553](https://github.com/lies-exposed/lies.exposed/commit/57dc553ede1a3f120d4dc3824aaf4a4b176f7f71))
* **backend:** account for timer imprecision in audit middleware test ([#2988](https://github.com/lies-exposed/lies.exposed/issues/2988)) ([1db46c6](https://github.com/lies-exposed/lies.exposed/commit/1db46c6066d318e8fc26bf3dfab7605527eb327d))
* **backend:** added brave provider for web searches ([#3044](https://github.com/lies-exposed/lies.exposed/issues/3044)) ([e1723b5](https://github.com/lies-exposed/lies.exposed/commit/e1723b5869cc4745cb885f0b3cab463863adc0f4))
* **backend:** added status to LinkEntity ([#3156](https://github.com/lies-exposed/lies.exposed/issues/3156)) ([71980bf](https://github.com/lies-exposed/lies.exposed/commit/71980bf2e401423c85cb1722e8cff338792b1864))
* **backend:** correct langchain imports and types ([fcc90ef](https://github.com/lies-exposed/lies.exposed/commit/fcc90efd4d65cf0c38f96e4c661160fd0d03b2a0))
* **backend:** fix SPA fallback route not matching root path in Express 5 ([#2974](https://github.com/lies-exposed/lies.exposed/issues/2974)) ([ce813ed](https://github.com/lies-exposed/lies.exposed/commit/ce813ed96b603325b85cbd1684796f4dc370aab9))
* **backend:** handle space TLS connection via env variable ([#2986](https://github.com/lies-exposed/lies.exposed/issues/2986)) ([ccfa27e](https://github.com/lies-exposed/lies.exposed/commit/ccfa27ed47281a7d7975c0d0506d342f3ba2468b))
* **backend:** prompt stringification to message string ([260f3ea](https://github.com/lies-exposed/lies.exposed/commit/260f3eadae5149fcaa693c0cb8951103f9403442))
* **backend:** reject PDF URLs as links and create media instead ([#3277](https://github.com/lies-exposed/lies.exposed/issues/3277)) ([dc7680c](https://github.com/lies-exposed/lies.exposed/commit/dc7680c8229b9288bd172ed88590217e46aba16a))
* **backend:** replace "as any" with proper types  ([#2839](https://github.com/lies-exposed/lies.exposed/issues/2839)) ([dc462d0](https://github.com/lies-exposed/lies.exposed/commit/dc462d037e714162e5556592bf09339620a53825))
* **backend:** use root option in res.sendFile for SPA fallback ([#3342](https://github.com/lies-exposed/lies.exposed/issues/3342)) ([b73bff5](https://github.com/lies-exposed/lies.exposed/commit/b73bff584ac99d250ae6f3fea8332ceb9ecc9b40))
* **backend:** vite server helper catch-all path ([#2965](https://github.com/lies-exposed/lies.exposed/issues/2965)) ([20d2f06](https://github.com/lies-exposed/lies.exposed/commit/20d2f06410c4e38e36675b542707fc27416a9995))
* **backend:** vite server helper logic with unit tests ([#2966](https://github.com/lies-exposed/lies.exposed/issues/2966)) ([2a26a0d](https://github.com/lies-exposed/lies.exposed/commit/2a26a0da947a617698d5e8663f107477b65a5442))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* io namespace imports ([#3216](https://github.com/lies-exposed/lies.exposed/issues/3216)) ([0efdfc6](https://github.com/lies-exposed/lies.exposed/commit/0efdfc67a6b43d34a874a3b6fda8169d10486948))
* **shared:** renamed Endpoints for agent to AgentEndpoints ([#3063](https://github.com/lies-exposed/lies.exposed/issues/3063)) ([5366305](https://github.com/lies-exposed/lies.exposed/commit/53663056c564a92b4ca01805f61edd849b000a26))
* **ui:** add link entity registration from BlockNote editor  ([#3264](https://github.com/lies-exposed/lies.exposed/issues/3264)) ([0c6ec5b](https://github.com/lies-exposed/lies.exposed/commit/0c6ec5b53b35cbd0b24f6883ef18b610702eb5a0))
* **ui:** improve actor family tree graph ([#3212](https://github.com/lies-exposed/lies.exposed/issues/3212)) ([513fc06](https://github.com/lies-exposed/lies.exposed/commit/513fc06dc3faa4a2ba7d00ff9a4be0b6f0bfd595))
* **ui:** use react-hook-form hooks to keep TextWithSlugInput values in syn ([#2971](https://github.com/lies-exposed/lies.exposed/issues/2971)) ([88f3f2d](https://github.com/lies-exposed/lies.exposed/commit/88f3f2d4a06e8b3a5a13574ee8b3686486247df2))
* web request errors  stats, event payloads, pub/sub, and AI job result handling ([#3228](https://github.com/lies-exposed/lies.exposed/issues/3228)) ([f724796](https://github.com/lies-exposed/lies.exposed/commit/f7247962b33bdd04811fcf23863cbba3320e9caf))
* **worker:** add backfill-link-publish-dates command ([#3317](https://github.com/lies-exposed/lies.exposed/issues/3317)) ([e33e26d](https://github.com/lies-exposed/lies.exposed/commit/e33e26d17560e2b544811822a0a540328a97f138))
* **worker:** remove premature UpdateEntitiesFromURL pub/sub and let ai-bot scheduler handle the job ([#3279](https://github.com/lies-exposed/lies.exposed/issues/3279)) ([508e19d](https://github.com/lies-exposed/lies.exposed/commit/508e19dbc35a5cc5c17d870750af44b4571d1c8b))
* **worker:** save links even on screenshot failure and always reply to user ([#3232](https://github.com/lies-exposed/lies.exposed/issues/3232)) ([c07a0d3](https://github.com/lies-exposed/lies.exposed/commit/c07a0d392273a1dd0bdf11ff2ad5b65da46b815d))
* **worker:** wikipedia api ([#3187](https://github.com/lies-exposed/lies.exposed/issues/3187)) ([f463543](https://github.com/lies-exposed/lies.exposed/commit/f463543e9406640d8f04d8acdf17836068263872))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))


### Miscellaneous

* **admin:** implement HMR for development server ([#3034](https://github.com/lies-exposed/lies.exposed/issues/3034)) ([13f4b42](https://github.com/lies-exposed/lies.exposed/commit/13f4b4256065f256272575d27892e6bcf9b310c9))
* **admin:** setup custom HMR port for server ([#3051](https://github.com/lies-exposed/lies.exposed/issues/3051)) ([99ef38c](https://github.com/lies-exposed/lies.exposed/commit/99ef38c1d3f8b299341ed2df4dc9197eda0ef4be))
* **agent:** added @langchain/xai dep ([a81eb88](https://github.com/lies-exposed/lies.exposed/commit/a81eb8894b1396c48d81d594fb64ad5ec6420920))
* **api:** drop orphan tables and rename event_v2 to event ([0b53cef](https://github.com/lies-exposed/lies.exposed/commit/0b53cefee01a0183a5783326b4473166f7314fbd)), closes [#3352](https://github.com/lies-exposed/lies.exposed/issues/3352)
* **api:** extract actor, area, link, and media tools into modular 1:1 pattern ([#2846](https://github.com/lies-exposed/lies.exposed/issues/2846)) ([58222c5](https://github.com/lies-exposed/lies.exposed/commit/58222c5c6b0f260d1086d0c6a9e68ac488c8f370))
* **api:** removed puppeteer and puppeteer-extra deps and dead code ([#3149](https://github.com/lies-exposed/lies.exposed/issues/3149)) ([1a6ddab](https://github.com/lies-exposed/lies.exposed/commit/1a6ddabb6a28d42727b94954035f197b4f3646e5))
* **api:** solved typecheck errors in test files ([#2991](https://github.com/lies-exposed/lies.exposed/issues/2991)) ([1bbc8e2](https://github.com/lies-exposed/lies.exposed/commit/1bbc8e2bc031d857eec2c13b340c9a4ce9493116))
* **backend:** added flow spec tests ([#3154](https://github.com/lies-exposed/lies.exposed/issues/3154)) ([bf69946](https://github.com/lies-exposed/lies.exposed/commit/bf699467455dd34bfe6614e5e57bbf5f3fc0c564))
* **backend:** moved node SSR logic from @liexp/ui ([#2967](https://github.com/lies-exposed/lies.exposed/issues/2967)) ([a6ed9f0](https://github.com/lies-exposed/lies.exposed/commit/a6ed9f0579033fbf556e805ea1ed4dda46cef899))
* **backend:** removed useless as any ([#2904](https://github.com/lies-exposed/lies.exposed/issues/2904)) ([a5c656b](https://github.com/lies-exposed/lies.exposed/commit/a5c656bffe6a0674480d7a0876f3cdf63aeb9075))
* **backend:** run database migrations on test global setup ([#3169](https://github.com/lies-exposed/lies.exposed/issues/3169)) ([d8d4e97](https://github.com/lies-exposed/lies.exposed/commit/d8d4e975e5161d6e0e53e17fcd8fffb7b769fd10))
* **backend:** vite server helper ([#2896](https://github.com/lies-exposed/lies.exposed/issues/2896)) ([cbcc76c](https://github.com/lies-exposed/lies.exposed/commit/cbcc76c180872dc59cde7f0410e9e325cfa48fae))
* bump eslint and related deps ([fe055a8](https://github.com/lies-exposed/lies.exposed/commit/fe055a8b704f8fc8511d7b22cc04751d8f8fc9a0))
* bump langchain from 1.0.6 to 1.2.1 ([3168ffa](https://github.com/lies-exposed/lies.exposed/commit/3168ffa932bd0c34707e693acf6b570ac1298e88))
* bump pnpm from 10.23.0 to 10.26.0 ([db8bdc6](https://github.com/lies-exposed/lies.exposed/commit/db8bdc69b1816dd2845fb54b004689db98d09064))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* bump pnpm to 10.23.0 ([d4a6ef0](https://github.com/lies-exposed/lies.exposed/commit/d4a6ef073804068182a8796b58c47469503898a3))
* **core:** fp module utils ([#3068](https://github.com/lies-exposed/lies.exposed/issues/3068)) ([1937350](https://github.com/lies-exposed/lies.exposed/commit/19373509798471fb3303c05af721479f71fa023b))
* **core:** replaced deprecated tselint.config with defineConfig from eslint ([#2817](https://github.com/lies-exposed/lies.exposed/issues/2817)) ([0266861](https://github.com/lies-exposed/lies.exposed/commit/026686115f656ea842faea5924a29d1f486c8503))
* deploy of admin-web service ([#2963](https://github.com/lies-exposed/lies.exposed/issues/2963)) ([956f071](https://github.com/lies-exposed/lies.exposed/commit/956f0713d15f65b3c2ab3ca9ec16eb1457c00900))
* **deps:** bump pdfjs-dist from 5.4.149 to 5.4.530 ([#2941](https://github.com/lies-exposed/lies.exposed/issues/2941)) ([3b64984](https://github.com/lies-exposed/lies.exposed/commit/3b64984ce77017e64481035ce98ef3411980cbc7))
* **deps:** bump typeorm from 0.3.27 to 0.3.28 ([#2937](https://github.com/lies-exposed/lies.exposed/issues/2937)) ([d4fb0d8](https://github.com/lies-exposed/lies.exposed/commit/d4fb0d80a1222e8c25942fac4e229b57bfa00576))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* errors refactor ([#3207](https://github.com/lies-exposed/lies.exposed/issues/3207)) ([ed74cee](https://github.com/lies-exposed/lies.exposed/commit/ed74ceea7c12764221f40d6f30f76c3a55e20373))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* moved queue implementation from fs to pg ([#3136](https://github.com/lies-exposed/lies.exposed/issues/3136)) ([5d9efc8](https://github.com/lies-exposed/lies.exposed/commit/5d9efc865751e6468b0e883a87005029f4e32802))
* refactor error logic ([#3129](https://github.com/lies-exposed/lies.exposed/issues/3129)) ([d04b8ff](https://github.com/lies-exposed/lies.exposed/commit/d04b8ffddb517d49feae3a22649e988bdc77658e))
* release  0.1.1 ([#2923](https://github.com/lies-exposed/lies.exposed/issues/2923)) ([a027e30](https://github.com/lies-exposed/lies.exposed/commit/a027e304508b1f02bad1db62d7471a8e0cd145ec))
* release  0.1.10 ([#3087](https://github.com/lies-exposed/lies.exposed/issues/3087)) ([533f416](https://github.com/lies-exposed/lies.exposed/commit/533f4165ee50af12d73fa1d6e36d43acd76957ee))
* release  0.1.11 ([#3110](https://github.com/lies-exposed/lies.exposed/issues/3110)) ([c90911d](https://github.com/lies-exposed/lies.exposed/commit/c90911d8a868e10c76b5c1204c3d9b6c89cd09fe))
* release  0.1.12 ([#3119](https://github.com/lies-exposed/lies.exposed/issues/3119)) ([f68b50a](https://github.com/lies-exposed/lies.exposed/commit/f68b50a33f518bdaf2cc1f0e6bbd3d610a1245a2))
* release  0.1.13 ([#3128](https://github.com/lies-exposed/lies.exposed/issues/3128)) ([12031de](https://github.com/lies-exposed/lies.exposed/commit/12031deda14ae5873eafbfddc46df96bf0f1f595))
* release  0.1.2 ([#2930](https://github.com/lies-exposed/lies.exposed/issues/2930)) ([c8bd7a9](https://github.com/lies-exposed/lies.exposed/commit/c8bd7a994c3f114807b00b8855a495e467dcf735))
* release  0.1.4 ([#2964](https://github.com/lies-exposed/lies.exposed/issues/2964)) ([f506ebf](https://github.com/lies-exposed/lies.exposed/commit/f506ebfaea62f600e83be963ae872efba9c14917))
* release  0.1.5 ([#2975](https://github.com/lies-exposed/lies.exposed/issues/2975)) ([e674ffb](https://github.com/lies-exposed/lies.exposed/commit/e674ffb193fb2d78ee1762433d371cbe87725879))
* release  0.1.6 ([#2989](https://github.com/lies-exposed/lies.exposed/issues/2989)) ([f3a692b](https://github.com/lies-exposed/lies.exposed/commit/f3a692bc267c1c4d168c9bc02df5c307679dc843))
* release  0.1.7 ([#2999](https://github.com/lies-exposed/lies.exposed/issues/2999)) ([7b73dce](https://github.com/lies-exposed/lies.exposed/commit/7b73dce7b5e5aa202d8d972019f4676249ed7d54))
* release  0.1.8 ([#3026](https://github.com/lies-exposed/lies.exposed/issues/3026)) ([857453b](https://github.com/lies-exposed/lies.exposed/commit/857453b8c1b3960513723ab18b729a590cfe9dd6))
* release  0.1.9 ([#3047](https://github.com/lies-exposed/lies.exposed/issues/3047)) ([afa22b6](https://github.com/lies-exposed/lies.exposed/commit/afa22b62a34af2fe0d36f44e4e97ebeb450b3224))
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* removed 'project' property from languageOptions.parserOptions in favor of 'projectService' ([be5db76](https://github.com/lies-exposed/lies.exposed/commit/be5db7664d703373013ca82b6dcbb849a088ddad))
* server logging of error details ([3eda9ba](https://github.com/lies-exposed/lies.exposed/commit/3eda9ba06e3bbb9f2b0f986383b1d610652464ff))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))
* **shared:** moved ai prompts from io package ([#3111](https://github.com/lies-exposed/lies.exposed/issues/3111)) ([3619422](https://github.com/lies-exposed/lies.exposed/commit/3619422b1c3d65cee35ca81a1e67a8afca91ac6f))
* **shared:** refactor event helpers ([#3067](https://github.com/lies-exposed/lies.exposed/issues/3067)) ([d9c5980](https://github.com/lies-exposed/lies.exposed/commit/d9c5980b68af7ca62f95b09922041613ac1e1677))
* **shared:** remove Project resource from the codebase ([#3348](https://github.com/lies-exposed/lies.exposed/issues/3348)) ([d781ab3](https://github.com/lies-exposed/lies.exposed/commit/d781ab3d239fbb6ff899f17c78cda900788ec3ab))
* **test:** defined documentary and quote event arbitraries ([c417d18](https://github.com/lies-exposed/lies.exposed/commit/c417d18cfcb997ce927964cf55b5f1850f9a1e18))
* **worker:** proper mocks initialization for e2e tests ([#2998](https://github.com/lies-exposed/lies.exposed/issues/2998)) ([4619599](https://github.com/lies-exposed/lies.exposed/commit/4619599251bb8eca66c3a35ad17d10e0f9c3d2a9))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
* **workspace:** bump the vite group across 8 directories with 2 updates ([#2894](https://github.com/lies-exposed/lies.exposed/issues/2894)) ([9b335af](https://github.com/lies-exposed/lies.exposed/commit/9b335afd53d543e8225464c7cb93d62986bb8b9b))
* **workspace:** removed fs direct import in flows ([#3150](https://github.com/lies-exposed/lies.exposed/issues/3150)) ([0aa2bcf](https://github.com/lies-exposed/lies.exposed/commit/0aa2bcf479cbce4efe87912e93171b473166d84b))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.6.0
    * @liexp/io bumped to 0.6.0
    * @liexp/shared bumped to 0.6.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.6.0
    * @liexp/test bumped to 0.6.0
</details>

<details><summary>@liexp/core: 0.6.0</summary>

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...@liexp/core@0.6.0) (2026-03-11)


### Bug Fixes

* advanced lazy-loading patterns for web bundle optimization ([#3235](https://github.com/lies-exposed/lies.exposed/issues/3235)) ([571c9b8](https://github.com/lies-exposed/lies.exposed/commit/571c9b8fca271601fa9e7d3c08f3c101a965a292))
* **core:** fix dotenv v17 ESM resolution in Vite config bundler ([#3327](https://github.com/lies-exposed/lies.exposed/issues/3327)) ([84843e1](https://github.com/lies-exposed/lies.exposed/commit/84843e112e774248d294a2afd85704258bd39d51))
* **core:** skip manualChunks rollupOptions in development mode ([#3316](https://github.com/lies-exposed/lies.exposed/issues/3316)) ([783f9c0](https://github.com/lies-exposed/lies.exposed/commit/783f9c0ba597de417c408616fe49c22c99bb0aef))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* **ui:** use react-hook-form hooks to keep TextWithSlugInput values in syn ([#2971](https://github.com/lies-exposed/lies.exposed/issues/2971)) ([88f3f2d](https://github.com/lies-exposed/lies.exposed/commit/88f3f2d4a06e8b3a5a13574ee8b3686486247df2))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))
* **workspace:** expose current version info ([#3166](https://github.com/lies-exposed/lies.exposed/issues/3166)) ([a2230f7](https://github.com/lies-exposed/lies.exposed/commit/a2230f7c37f90f0ced8dc272ccb861cd749e08bf))


### Miscellaneous

* **admin:** implement HMR for development server ([#3034](https://github.com/lies-exposed/lies.exposed/issues/3034)) ([13f4b42](https://github.com/lies-exposed/lies.exposed/commit/13f4b4256065f256272575d27892e6bcf9b310c9))
* **admin:** setup custom HMR port for server ([#3051](https://github.com/lies-exposed/lies.exposed/issues/3051)) ([99ef38c](https://github.com/lies-exposed/lies.exposed/commit/99ef38c1d3f8b299341ed2df4dc9197eda0ef4be))
* bump eslint and related deps ([fe055a8](https://github.com/lies-exposed/lies.exposed/commit/fe055a8b704f8fc8511d7b22cc04751d8f8fc9a0))
* bump pnpm from 10.23.0 to 10.26.0 ([db8bdc6](https://github.com/lies-exposed/lies.exposed/commit/db8bdc69b1816dd2845fb54b004689db98d09064))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* bump pnpm to 10.23.0 ([d4a6ef0](https://github.com/lies-exposed/lies.exposed/commit/d4a6ef073804068182a8796b58c47469503898a3))
* **core:** fp module utils ([#3068](https://github.com/lies-exposed/lies.exposed/issues/3068)) ([1937350](https://github.com/lies-exposed/lies.exposed/commit/19373509798471fb3303c05af721479f71fa023b))
* **core:** replaced deprecated tselint.config with defineConfig from eslint ([#2817](https://github.com/lies-exposed/lies.exposed/issues/2817)) ([0266861](https://github.com/lies-exposed/lies.exposed/commit/026686115f656ea842faea5924a29d1f486c8503))
* **core:** vite-tsconfig-paths peer dep to ^6 ([b61e015](https://github.com/lies-exposed/lies.exposed/commit/b61e015076fc9a3574c5928ef4377b52d529e2ac))
* **deps-dev:** bump @tanstack/eslint-plugin-query from 5.83.1 to 5.91.2. ([#2914](https://github.com/lies-exposed/lies.exposed/issues/2914)) ([fa76a51](https://github.com/lies-exposed/lies.exposed/commit/fa76a51b3aa16eeab73b091337958cce0d90bf52))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* release  0.1.1 ([#2923](https://github.com/lies-exposed/lies.exposed/issues/2923)) ([a027e30](https://github.com/lies-exposed/lies.exposed/commit/a027e304508b1f02bad1db62d7471a8e0cd145ec))
* release  0.1.12 ([#3119](https://github.com/lies-exposed/lies.exposed/issues/3119)) ([f68b50a](https://github.com/lies-exposed/lies.exposed/commit/f68b50a33f518bdaf2cc1f0e6bbd3d610a1245a2))
* release  0.1.13 ([#3128](https://github.com/lies-exposed/lies.exposed/issues/3128)) ([12031de](https://github.com/lies-exposed/lies.exposed/commit/12031deda14ae5873eafbfddc46df96bf0f1f595))
* release  0.1.4 ([#2964](https://github.com/lies-exposed/lies.exposed/issues/2964)) ([f506ebf](https://github.com/lies-exposed/lies.exposed/commit/f506ebfaea62f600e83be963ae872efba9c14917))
* release  0.1.8 ([#3026](https://github.com/lies-exposed/lies.exposed/issues/3026)) ([857453b](https://github.com/lies-exposed/lies.exposed/commit/857453b8c1b3960513723ab18b729a590cfe9dd6))
* release  0.1.9 ([#3047](https://github.com/lies-exposed/lies.exposed/issues/3047)) ([afa22b6](https://github.com/lies-exposed/lies.exposed/commit/afa22b62a34af2fe0d36f44e4e97ebeb450b3224))
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @liexp/eslint-config bumped to 0.6.0
</details>

<details><summary>@liexp/eslint-config: 0.6.0</summary>

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...@liexp/eslint-config@0.6.0) (2026-03-11)


### Bug Fixes

* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* io namespace imports ([#3216](https://github.com/lies-exposed/lies.exposed/issues/3216)) ([0efdfc6](https://github.com/lies-exposed/lies.exposed/commit/0efdfc67a6b43d34a874a3b6fda8169d10486948))


### Miscellaneous

* release  0.1.12 ([#3119](https://github.com/lies-exposed/lies.exposed/issues/3119)) ([f68b50a](https://github.com/lies-exposed/lies.exposed/commit/f68b50a33f518bdaf2cc1f0e6bbd3d610a1245a2))
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))
</details>

<details><summary>@liexp/io: 0.6.0</summary>

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...@liexp/io@0.6.0) (2026-03-11)


### Features

* create actor relation ([#3167](https://github.com/lies-exposed/lies.exposed/issues/3167)) ([f251e56](https://github.com/lies-exposed/lies.exposed/commit/f251e56a8b360dae003b88601f5bbe03cdf4216e))


### Bug Fixes

* **admin:** added descriptive labels for actor relation type values ([#3198](https://github.com/lies-exposed/lies.exposed/issues/3198)) ([a31d9fa](https://github.com/lies-exposed/lies.exposed/commit/a31d9fa438bae3fe0f3db03134f42a93a9f5fe4e))
* **admin:** implement sorting for queue resources ([#3234](https://github.com/lies-exposed/lies.exposed/issues/3234)) ([9e2cb6b](https://github.com/lies-exposed/lies.exposed/commit/9e2cb6b264bf8afad3efef7bdc6ee38a25622429))
* advanced lazy-loading patterns for web bundle optimization ([#3235](https://github.com/lies-exposed/lies.exposed/issues/3235)) ([571c9b8](https://github.com/lies-exposed/lies.exposed/commit/571c9b8fca271601fa9e7d3c08f3c101a965a292))
* **agent:** add story CLI command group with spec tests ([#3351](https://github.com/lies-exposed/lies.exposed/issues/3351)) ([03aae78](https://github.com/lies-exposed/lies.exposed/commit/03aae782b20021988a19384bc0cd609c7e288e56))
* **agent:** agent supervisor ([#3344](https://github.com/lies-exposed/lies.exposed/issues/3344)) ([723675e](https://github.com/lies-exposed/lies.exposed/commit/723675e1f5b2e0c5474c40944239cf6b8b9cb9b7))
* **agent:** multiprovider AI agent configuration ([#3206](https://github.com/lies-exposed/lies.exposed/issues/3206)) ([06920b4](https://github.com/lies-exposed/lies.exposed/commit/06920b4bf246b7c22f5c5acc9f9cd8b4909a1e13))
* **ai-bot:** add create event from multiple links feature ([#3098](https://github.com/lies-exposed/lies.exposed/issues/3098)) ([#3099](https://github.com/lies-exposed/lies.exposed/issues/3099)) ([8644ffc](https://github.com/lies-exposed/lies.exposed/commit/8644ffc883fd294e130cbcee3ef6865a9ca28628))
* **ai-bot:** create event from links prompt without json schema ([#3108](https://github.com/lies-exposed/lies.exposed/issues/3108)) ([60f47a7](https://github.com/lies-exposed/lies.exposed/commit/60f47a7bc94e5456843bc110fb9125c276f963ea))
* **ai-bot:** flow to update multiple entities from a link ([#3214](https://github.com/lies-exposed/lies.exposed/issues/3214)) ([d36a398](https://github.com/lies-exposed/lies.exposed/commit/d36a3987a390da3e6c482e6f64bcb5f9025440e8))
* **backend:** added status to LinkEntity ([#3156](https://github.com/lies-exposed/lies.exposed/issues/3156)) ([71980bf](https://github.com/lies-exposed/lies.exposed/commit/71980bf2e401423c85cb1722e8cff338792b1864))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* **io:** make url optional in EditLink schema ([#3362](https://github.com/lies-exposed/lies.exposed/issues/3362)) ([2fae15a](https://github.com/lies-exposed/lies.exposed/commit/2fae15a6d96945a10ef9654f3bdff5672293339f))
* mcp tools ([#3188](https://github.com/lies-exposed/lies.exposed/issues/3188)) ([3b9a8ce](https://github.com/lies-exposed/lies.exposed/commit/3b9a8ceefe7ee7510820d039a3fea4de29f58cbd))
* **ui:** add link entity registration from BlockNote editor  ([#3264](https://github.com/lies-exposed/lies.exposed/issues/3264)) ([0c6ec5b](https://github.com/lies-exposed/lies.exposed/commit/0c6ec5b53b35cbd0b24f6883ef18b610702eb5a0))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))


### Miscellaneous

* **deps:** bump uuid from 11.1.0 to 13.0.0 ([#2940](https://github.com/lies-exposed/lies.exposed/issues/2940)) ([45a4e15](https://github.com/lies-exposed/lies.exposed/commit/45a4e15ec0bbfc5f0c8f803b3435c89708a5bb5f))
* errors refactor ([#3207](https://github.com/lies-exposed/lies.exposed/issues/3207)) ([ed74cee](https://github.com/lies-exposed/lies.exposed/commit/ed74ceea7c12764221f40d6f30f76c3a55e20373))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* moved queue implementation from fs to pg ([#3136](https://github.com/lies-exposed/lies.exposed/issues/3136)) ([5d9efc8](https://github.com/lies-exposed/lies.exposed/commit/5d9efc865751e6468b0e883a87005029f4e32802))
* refactor error logic ([#3129](https://github.com/lies-exposed/lies.exposed/issues/3129)) ([d04b8ff](https://github.com/lies-exposed/lies.exposed/commit/d04b8ffddb517d49feae3a22649e988bdc77658e))
* release  0.1.10 ([#3087](https://github.com/lies-exposed/lies.exposed/issues/3087)) ([533f416](https://github.com/lies-exposed/lies.exposed/commit/533f4165ee50af12d73fa1d6e36d43acd76957ee))
* release  0.1.11 ([#3110](https://github.com/lies-exposed/lies.exposed/issues/3110)) ([c90911d](https://github.com/lies-exposed/lies.exposed/commit/c90911d8a868e10c76b5c1204c3d9b6c89cd09fe))
* release  0.1.12 ([#3119](https://github.com/lies-exposed/lies.exposed/issues/3119)) ([f68b50a](https://github.com/lies-exposed/lies.exposed/commit/f68b50a33f518bdaf2cc1f0e6bbd3d610a1245a2))
* release  0.1.13 ([#3128](https://github.com/lies-exposed/lies.exposed/issues/3128)) ([12031de](https://github.com/lies-exposed/lies.exposed/commit/12031deda14ae5873eafbfddc46df96bf0f1f595))
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* **shared:** remove Project resource from the codebase ([#3348](https://github.com/lies-exposed/lies.exposed/issues/3348)) ([d781ab3](https://github.com/lies-exposed/lies.exposed/commit/d781ab3d239fbb6ff899f17c78cda900788ec3ab))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.6.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.6.0
</details>

<details><summary>@liexp/shared: 0.6.0</summary>

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...@liexp/shared@0.6.0) (2026-03-11)


### Features

* added endpoint to merge events ([#3055](https://github.com/lies-exposed/lies.exposed/issues/3055)) ([46da181](https://github.com/lies-exposed/lies.exposed/commit/46da1812e13deae9b8d1736e7c2295372660a43b))
* **agent:** streamable chat endpoint ([#2845](https://github.com/lies-exposed/lies.exposed/issues/2845)) ([c7376ca](https://github.com/lies-exposed/lies.exposed/commit/c7376caab780cd66d3e7116471fbd6dd7fb2484a))
* **ai-bot:** extract thumbnailUrl from link metadata and create media on job completion ([#3245](https://github.com/lies-exposed/lies.exposed/issues/3245)) ([fe15601](https://github.com/lies-exposed/lies.exposed/commit/fe15601b9909fbf9e9f069f6ff59ba7679263e8e))
* **ai-bot:** use agent via http API ([#2809](https://github.com/lies-exposed/lies.exposed/issues/2809)) ([657ec21](https://github.com/lies-exposed/lies.exposed/commit/657ec218a45c861b06eb74a00310c4770ec435a3))
* create actor relation ([#3167](https://github.com/lies-exposed/lies.exposed/issues/3167)) ([f251e56](https://github.com/lies-exposed/lies.exposed/commit/f251e56a8b360dae003b88601f5bbe03cdf4216e))


### Bug Fixes

* **@liexp/shared:** replace "as any" with proper types ([c0b8dfa](https://github.com/lies-exposed/lies.exposed/commit/c0b8dfaf5dfe2574ce2578ba17b04d31f281304b))
* added more tools to get resources by id and added e2e tests ([cbd1492](https://github.com/lies-exposed/lies.exposed/commit/cbd1492348d8dcd23c94abe81d636f7ee0d1371e))
* **admin:** add queue stats card to dashboard ([#3223](https://github.com/lies-exposed/lies.exposed/issues/3223)) ([d533022](https://github.com/lies-exposed/lies.exposed/commit/d533022076cb1120c8842af589d1a6022e5472d8))
* **admin:** description with Tooltip for AI jobs ([#2994](https://github.com/lies-exposed/lies.exposed/issues/2994)) ([6b4847a](https://github.com/lies-exposed/lies.exposed/commit/6b4847a8f6383755e2d7bee57306db5b0287dc5a))
* **admin:** filter links by events count ([#2978](https://github.com/lies-exposed/lies.exposed/issues/2978)) ([2baee88](https://github.com/lies-exposed/lies.exposed/commit/2baee882c054639ecc76437aaf7fd9589d6fa43a))
* **agent:** add story CLI command group with spec tests ([#3351](https://github.com/lies-exposed/lies.exposed/issues/3351)) ([03aae78](https://github.com/lies-exposed/lies.exposed/commit/03aae782b20021988a19384bc0cd609c7e288e56))
* **agent:** agent supervisor ([#3344](https://github.com/lies-exposed/lies.exposed/issues/3344)) ([723675e](https://github.com/lies-exposed/lies.exposed/commit/723675e1f5b2e0c5474c40944239cf6b8b9cb9b7))
* **agent:** cli events sub-command ([#3370](https://github.com/lies-exposed/lies.exposed/issues/3370)) ([c615dc8](https://github.com/lies-exposed/lies.exposed/commit/c615dc8dbcbfde9cb8671f1c763eceda01472bb2))
* **agent:** multiprovider AI agent configuration ([#3206](https://github.com/lies-exposed/lies.exposed/issues/3206)) ([06920b4](https://github.com/lies-exposed/lies.exposed/commit/06920b4bf246b7c22f5c5acc9f9cd8b4909a1e13))
* **agent:** provide cli tools to access platform resources ([#3332](https://github.com/lies-exposed/lies.exposed/issues/3332)) ([6ba161f](https://github.com/lies-exposed/lies.exposed/commit/6ba161fcc9dc132fdedc9d3b81a8b3432325dfc6))
* **ai-bot:** create event from links with json schema ([#3123](https://github.com/lies-exposed/lies.exposed/issues/3123)) ([6a90c81](https://github.com/lies-exposed/lies.exposed/commit/6a90c81da9d860589f336f3d930d011273a32e23))
* **ai-bot:** create event from url queue job ([#3015](https://github.com/lies-exposed/lies.exposed/issues/3015)) ([b5bf5f2](https://github.com/lies-exposed/lies.exposed/commit/b5bf5f25761d3326bf1e93d375192eea2858f72b))
* **ai-bot:** created custom strategy for effect-to-zod schema compatibility with NGrok ([#2824](https://github.com/lies-exposed/lies.exposed/issues/2824)) ([8b3a0bc](https://github.com/lies-exposed/lies.exposed/commit/8b3a0bcbd2902fb5b7552598281f344ccbe74600))
* **ai-bot:** link metadata extraction and status filtering for admin  ([#3242](https://github.com/lies-exposed/lies.exposed/issues/3242)) ([8b2ce40](https://github.com/lies-exposed/lies.exposed/commit/8b2ce40aaf32c1c6798f282e49ff8e9e7335e015))
* **ai-bot:** update event flow with proper types and prompts ([#3025](https://github.com/lies-exposed/lies.exposed/issues/3025)) ([ba42afe](https://github.com/lies-exposed/lies.exposed/commit/ba42afef414865c5b70c902fb052e515a2d3ef6a))
* **api:** actors and groups events linking routes ([#3041](https://github.com/lies-exposed/lies.exposed/issues/3041)) ([4d31bcb](https://github.com/lies-exposed/lies.exposed/commit/4d31bcb720288d516fc98de679883a61b79bafea))
* **api:** added create and edit tools for every event type ([#2851](https://github.com/lies-exposed/lies.exposed/issues/2851)) ([f5e42a4](https://github.com/lies-exposed/lies.exposed/commit/f5e42a4ee39e3cebf5920daa873f1ac00f725b2e))
* **api:** added endpoint to merge actors ([#2984](https://github.com/lies-exposed/lies.exposed/issues/2984)) ([459df12](https://github.com/lies-exposed/lies.exposed/commit/459df124dbb2c7d73c3eb1e5418d00d11bfa6352))
* **api:** added extension to import ([#3133](https://github.com/lies-exposed/lies.exposed/issues/3133)) ([7666ccf](https://github.com/lies-exposed/lies.exposed/commit/7666ccfaec68b1f405a7c98ae4d56fa0d4dfaa0a))
* **api:** allow query param array length up to 200 ([#3356](https://github.com/lies-exposed/lies.exposed/issues/3356)) ([7761de3](https://github.com/lies-exposed/lies.exposed/commit/7761de3337bc9beed72ee7e7e31dca3825742a54))
* **api:** endpoints to link actors to events ([#3053](https://github.com/lies-exposed/lies.exposed/issues/3053)) ([78e9925](https://github.com/lies-exposed/lies.exposed/commit/78e9925c90d0fdde7d39a41db96d7a0642e5d135))
* **api:** get event with deleted items for admins ([#3020](https://github.com/lies-exposed/lies.exposed/issues/3020)) ([0d10219](https://github.com/lies-exposed/lies.exposed/commit/0d102194a77d17278b31c44ff4b1fa9445e10390))
* **api:** include relations in listed events when requested via query params ([#3032](https://github.com/lies-exposed/lies.exposed/issues/3032)) ([e9d85a7](https://github.com/lies-exposed/lies.exposed/commit/e9d85a796367ef7410b02ed0039fcdd26710e2fd))
* **api:** prevent circular PARENT_CHILD relations crashing admin UI ([#3211](https://github.com/lies-exposed/lies.exposed/issues/3211)) ([7cad842](https://github.com/lies-exposed/lies.exposed/commit/7cad842a7d4c3560cdbb5427a9da261292dd320c))
* **api:** stories validation ([#3270](https://github.com/lies-exposed/lies.exposed/issues/3270)) ([57dc553](https://github.com/lies-exposed/lies.exposed/commit/57dc553ede1a3f120d4dc3824aaf4a4b176f7f71))
* **backend:** reject PDF URLs as links and create media instead ([#3277](https://github.com/lies-exposed/lies.exposed/issues/3277)) ([dc7680c](https://github.com/lies-exposed/lies.exposed/commit/dc7680c8229b9288bd172ed88590217e46aba16a))
* chat providers and prompts ([#3208](https://github.com/lies-exposed/lies.exposed/issues/3208)) ([db9dbde](https://github.com/lies-exposed/lies.exposed/commit/db9dbdee889a3de0f8a358cb42d3090a305de07b))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* io namespace imports ([#3216](https://github.com/lies-exposed/lies.exposed/issues/3216)) ([0efdfc6](https://github.com/lies-exposed/lies.exposed/commit/0efdfc67a6b43d34a874a3b6fda8169d10486948))
* propertyindexsignature type conversion ([#3191](https://github.com/lies-exposed/lies.exposed/issues/3191)) ([9475d30](https://github.com/lies-exposed/lies.exposed/commit/9475d30312e4940235fc6edce7eb167d41d4006d))
* **shared:** added merge events helper ([#3072](https://github.com/lies-exposed/lies.exposed/issues/3072)) ([395e45b](https://github.com/lies-exposed/lies.exposed/commit/395e45be885a25a5a897d7dd21867f37362d7fe8))
* **shared:** make merge events helper function only accept NonEmptyArray ([#3134](https://github.com/lies-exposed/lies.exposed/issues/3134)) ([a8ae137](https://github.com/lies-exposed/lies.exposed/commit/a8ae1376345311c25f47b2e14cd9ca69fc11babd))
* **shared:** renamed Endpoints for agent to AgentEndpoints ([#3063](https://github.com/lies-exposed/lies.exposed/issues/3063)) ([5366305](https://github.com/lies-exposed/lies.exposed/commit/53663056c564a92b4ca01805f61edd849b000a26))
* **shared:** use proper common codecs for CLI schemas ([#3371](https://github.com/lies-exposed/lies.exposed/issues/3371)) ([e237ee5](https://github.com/lies-exposed/lies.exposed/commit/e237ee5d6acae99f49117459e4f23ce63ce913d0))
* **shared:** use proper UUID codec for relation ids in MCP schemas ([#3369](https://github.com/lies-exposed/lies.exposed/issues/3369)) ([e5f02c6](https://github.com/lies-exposed/lies.exposed/commit/e5f02c64de8c23611ba9269d66a34ecd3c3779a4))
* **shared:** use UUID for scientific study payload image ([#3066](https://github.com/lies-exposed/lies.exposed/issues/3066)) ([e069dee](https://github.com/lies-exposed/lies.exposed/commit/e069deefbe953c44ab94593dd6bdaf3bfe4a9543))
* **shared:** use v3 of zod for effect to zod conversion utils ([68c25e5](https://github.com/lies-exposed/lies.exposed/commit/68c25e525821b299f458de68dadc60f164797747))
* **ui:** add link entity registration from BlockNote editor  ([#3264](https://github.com/lies-exposed/lies.exposed/issues/3264)) ([0c6ec5b](https://github.com/lies-exposed/lies.exposed/commit/0c6ec5b53b35cbd0b24f6883ef18b610702eb5a0))
* **ui:** create event from link with AI button ([#3017](https://github.com/lies-exposed/lies.exposed/issues/3017)) ([8bf695e](https://github.com/lies-exposed/lies.exposed/commit/8bf695e2b24e7f4812ce46ffc476fd30f959b79b))
* **ui:** created UpdateEventQueueButton component ([#3030](https://github.com/lies-exposed/lies.exposed/issues/3030)) ([d23f7eb](https://github.com/lies-exposed/lies.exposed/commit/d23f7ebab3efbb2c32d65fe37d9af72624cf4645))
* **ui:** remove isLoading from OpenAIJobUtton ([#2997](https://github.com/lies-exposed/lies.exposed/issues/2997)) ([d873e4d](https://github.com/lies-exposed/lies.exposed/commit/d873e4d652d6b7194b5d94508c24cca503e50d71))
* **ui:** show event media relation in autocomplete input component ([#3031](https://github.com/lies-exposed/lies.exposed/issues/3031)) ([5f2257b](https://github.com/lies-exposed/lies.exposed/commit/5f2257b7e20ac1ad24069b264d8838a1715ed1fb))
* **worker:** add backfill-link-publish-dates command ([#3317](https://github.com/lies-exposed/lies.exposed/issues/3317)) ([e33e26d](https://github.com/lies-exposed/lies.exposed/commit/e33e26d17560e2b544811822a0a540328a97f138))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))


### Miscellaneous

* **agent:** use [@ts-endpoint](https://github.com/ts-endpoint) stream endpoint definition ([#3112](https://github.com/lies-exposed/lies.exposed/issues/3112)) ([52c265d](https://github.com/lies-exposed/lies.exposed/commit/52c265d95ac581d7f61a17da19ed9cdf71833ae7))
* bump [@blocknote](https://github.com/blocknote) group from 0.44.2 to 0.45.0 ([6bad161](https://github.com/lies-exposed/lies.exposed/commit/6bad161b71a5f50038dd91f73a22e969b6faca0f))
* bump eslint and related deps ([fe055a8](https://github.com/lies-exposed/lies.exposed/commit/fe055a8b704f8fc8511d7b22cc04751d8f8fc9a0))
* bump knip from 5.56.0 to 5.75.2 ([afc48eb](https://github.com/lies-exposed/lies.exposed/commit/afc48ebbd4ed9a40b99cab845625d95e184ff120))
* bump openai from 5.23.2 to 6.15.0 ([#2877](https://github.com/lies-exposed/lies.exposed/issues/2877)) ([8390c5c](https://github.com/lies-exposed/lies.exposed/commit/8390c5c41129eff37310d13a97442b44e355acfc))
* bump pnpm from 10.23.0 to 10.26.0 ([db8bdc6](https://github.com/lies-exposed/lies.exposed/commit/db8bdc69b1816dd2845fb54b004689db98d09064))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* bump pnpm to 10.23.0 ([d4a6ef0](https://github.com/lies-exposed/lies.exposed/commit/d4a6ef073804068182a8796b58c47469503898a3))
* **core:** fp module utils ([#3068](https://github.com/lies-exposed/lies.exposed/issues/3068)) ([1937350](https://github.com/lies-exposed/lies.exposed/commit/19373509798471fb3303c05af721479f71fa023b))
* **core:** replaced deprecated tselint.config with defineConfig from eslint ([#2817](https://github.com/lies-exposed/lies.exposed/issues/2817)) ([0266861](https://github.com/lies-exposed/lies.exposed/commit/026686115f656ea842faea5924a29d1f486c8503))
* **deps-dev:** bump @types/lodash from 4.17.20 to 4.17.21 ([#2939](https://github.com/lies-exposed/lies.exposed/issues/2939)) ([d027f03](https://github.com/lies-exposed/lies.exposed/commit/d027f033cf9a7c631e1434a23851d3cdc99dd3a4))
* **deps:** bump pdfjs-dist from 5.4.149 to 5.4.530 ([#2941](https://github.com/lies-exposed/lies.exposed/issues/2941)) ([3b64984](https://github.com/lies-exposed/lies.exposed/commit/3b64984ce77017e64481035ce98ef3411980cbc7))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* errors refactor ([#3207](https://github.com/lies-exposed/lies.exposed/issues/3207)) ([ed74cee](https://github.com/lies-exposed/lies.exposed/commit/ed74ceea7c12764221f40d6f30f76c3a55e20373))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* moved queue implementation from fs to pg ([#3136](https://github.com/lies-exposed/lies.exposed/issues/3136)) ([5d9efc8](https://github.com/lies-exposed/lies.exposed/commit/5d9efc865751e6468b0e883a87005029f4e32802))
* refactor error logic ([#3129](https://github.com/lies-exposed/lies.exposed/issues/3129)) ([d04b8ff](https://github.com/lies-exposed/lies.exposed/commit/d04b8ffddb517d49feae3a22649e988bdc77658e))
* release  0.1.1 ([#2923](https://github.com/lies-exposed/lies.exposed/issues/2923)) ([a027e30](https://github.com/lies-exposed/lies.exposed/commit/a027e304508b1f02bad1db62d7471a8e0cd145ec))
* release  0.1.10 ([#3087](https://github.com/lies-exposed/lies.exposed/issues/3087)) ([533f416](https://github.com/lies-exposed/lies.exposed/commit/533f4165ee50af12d73fa1d6e36d43acd76957ee))
* release  0.1.11 ([#3110](https://github.com/lies-exposed/lies.exposed/issues/3110)) ([c90911d](https://github.com/lies-exposed/lies.exposed/commit/c90911d8a868e10c76b5c1204c3d9b6c89cd09fe))
* release  0.1.12 ([#3119](https://github.com/lies-exposed/lies.exposed/issues/3119)) ([f68b50a](https://github.com/lies-exposed/lies.exposed/commit/f68b50a33f518bdaf2cc1f0e6bbd3d610a1245a2))
* release  0.1.13 ([#3128](https://github.com/lies-exposed/lies.exposed/issues/3128)) ([12031de](https://github.com/lies-exposed/lies.exposed/commit/12031deda14ae5873eafbfddc46df96bf0f1f595))
* release  0.1.2 ([#2930](https://github.com/lies-exposed/lies.exposed/issues/2930)) ([c8bd7a9](https://github.com/lies-exposed/lies.exposed/commit/c8bd7a994c3f114807b00b8855a495e467dcf735))
* release  0.1.4 ([#2964](https://github.com/lies-exposed/lies.exposed/issues/2964)) ([f506ebf](https://github.com/lies-exposed/lies.exposed/commit/f506ebfaea62f600e83be963ae872efba9c14917))
* release  0.1.5 ([#2975](https://github.com/lies-exposed/lies.exposed/issues/2975)) ([e674ffb](https://github.com/lies-exposed/lies.exposed/commit/e674ffb193fb2d78ee1762433d371cbe87725879))
* release  0.1.6 ([#2989](https://github.com/lies-exposed/lies.exposed/issues/2989)) ([f3a692b](https://github.com/lies-exposed/lies.exposed/commit/f3a692bc267c1c4d168c9bc02df5c307679dc843))
* release  0.1.7 ([#2999](https://github.com/lies-exposed/lies.exposed/issues/2999)) ([7b73dce](https://github.com/lies-exposed/lies.exposed/commit/7b73dce7b5e5aa202d8d972019f4676249ed7d54))
* release  0.1.8 ([#3026](https://github.com/lies-exposed/lies.exposed/issues/3026)) ([857453b](https://github.com/lies-exposed/lies.exposed/commit/857453b8c1b3960513723ab18b729a590cfe9dd6))
* release  0.1.9 ([#3047](https://github.com/lies-exposed/lies.exposed/issues/3047)) ([afa22b6](https://github.com/lies-exposed/lies.exposed/commit/afa22b62a34af2fe0d36f44e4e97ebeb450b3224))
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* removed 'project' property from languageOptions.parserOptions in favor of 'projectService' ([be5db76](https://github.com/lies-exposed/lies.exposed/commit/be5db7664d703373013ca82b6dcbb849a088ddad))
* server logging of error details ([3eda9ba](https://github.com/lies-exposed/lies.exposed/commit/3eda9ba06e3bbb9f2b0f986383b1d610652464ff))
* **shared:** added spec tests for event helpers ([#3069](https://github.com/lies-exposed/lies.exposed/issues/3069)) ([9fa9f27](https://github.com/lies-exposed/lies.exposed/commit/9fa9f272f1ca0bbbdbff4b0289c84ac9fc4b92cc))
* **shared:** added unit tests for helpers and utils ([#3090](https://github.com/lies-exposed/lies.exposed/issues/3090)) ([f1a6f7a](https://github.com/lies-exposed/lies.exposed/commit/f1a6f7aad7c86906d293a4f9ee6d7e92bc1d71d9))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))
* **shared:** moved ai prompts from io package ([#3111](https://github.com/lies-exposed/lies.exposed/issues/3111)) ([3619422](https://github.com/lies-exposed/lies.exposed/commit/3619422b1c3d65cee35ca81a1e67a8afca91ac6f))
* **shared:** refactor event helpers ([#3067](https://github.com/lies-exposed/lies.exposed/issues/3067)) ([d9c5980](https://github.com/lies-exposed/lies.exposed/commit/d9c5980b68af7ca62f95b09922041613ac1e1677))
* **shared:** remove Project resource from the codebase ([#3348](https://github.com/lies-exposed/lies.exposed/issues/3348)) ([d781ab3](https://github.com/lies-exposed/lies.exposed/commit/d781ab3d239fbb6ff899f17c78cda900788ec3ab))
* **test:** defined documentary and quote event arbitraries ([c417d18](https://github.com/lies-exposed/lies.exposed/commit/c417d18cfcb997ce927964cf55b5f1850f9a1e18))
* typeorm pglite transaction isolation for e2e tests ([#2995](https://github.com/lies-exposed/lies.exposed/issues/2995)) ([0d4b307](https://github.com/lies-exposed/lies.exposed/commit/0d4b307089f1cc11b7741b2d4b4b5e8325d69119))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
* **workspace:** bump the vite group across 8 directories with 2 updates ([#2894](https://github.com/lies-exposed/lies.exposed/issues/2894)) ([9b335af](https://github.com/lies-exposed/lies.exposed/commit/9b335afd53d543e8225464c7cb93d62986bb8b9b))
* **workspace:** pnpm overrides for zod@^4 ([#3042](https://github.com/lies-exposed/lies.exposed/issues/3042)) ([334ef1d](https://github.com/lies-exposed/lies.exposed/commit/334ef1d9ab455ba643a561e39daed4f1a8eda60e))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.6.0
    * @liexp/io bumped to 0.6.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.6.0
    * @liexp/test bumped to 0.6.0
</details>

<details><summary>@liexp/storybook: 0.6.0</summary>

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...@liexp/storybook@0.6.0) (2026-03-11)


### Features

* **admin:** implement frontend proxy integration (Phase 2) ([#2842](https://github.com/lies-exposed/lies.exposed/issues/2842)) ([1b9f2f7](https://github.com/lies-exposed/lies.exposed/commit/1b9f2f7271882863885e4ffb27b99c7e18f03252))
* **agent:** streamable chat endpoint ([#2845](https://github.com/lies-exposed/lies.exposed/issues/2845)) ([c7376ca](https://github.com/lies-exposed/lies.exposed/commit/c7376caab780cd66d3e7116471fbd6dd7fb2484a))
* create actor relation ([#3167](https://github.com/lies-exposed/lies.exposed/issues/3167)) ([f251e56](https://github.com/lies-exposed/lies.exposed/commit/f251e56a8b360dae003b88601f5bbe03cdf4216e))


### Bug Fixes

* **agent:** add story CLI command group with spec tests ([#3351](https://github.com/lies-exposed/lies.exposed/issues/3351)) ([03aae78](https://github.com/lies-exposed/lies.exposed/commit/03aae782b20021988a19384bc0cd609c7e288e56))
* **agent:** agent supervisor ([#3344](https://github.com/lies-exposed/lies.exposed/issues/3344)) ([723675e](https://github.com/lies-exposed/lies.exposed/commit/723675e1f5b2e0c5474c40944239cf6b8b9cb9b7))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* io namespace imports ([#3216](https://github.com/lies-exposed/lies.exposed/issues/3216)) ([0efdfc6](https://github.com/lies-exposed/lies.exposed/commit/0efdfc67a6b43d34a874a3b6fda8169d10486948))
* **ui:** global search command palette (Ctrl+K) ([#3324](https://github.com/lies-exposed/lies.exposed/issues/3324)) ([24ab24a](https://github.com/lies-exposed/lies.exposed/commit/24ab24a9628bcd258784a08381e0bbab7473465e))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))


### Miscellaneous

* bump eslint and related deps ([fe055a8](https://github.com/lies-exposed/lies.exposed/commit/fe055a8b704f8fc8511d7b22cc04751d8f8fc9a0))
* bump pnpm from 10.23.0 to 10.26.0 ([db8bdc6](https://github.com/lies-exposed/lies.exposed/commit/db8bdc69b1816dd2845fb54b004689db98d09064))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* bump pnpm to 10.23.0 ([d4a6ef0](https://github.com/lies-exposed/lies.exposed/commit/d4a6ef073804068182a8796b58c47469503898a3))
* bump storybook from 10.1.11 to 10.2.8 ([#3168](https://github.com/lies-exposed/lies.exposed/issues/3168)) ([8652d12](https://github.com/lies-exposed/lies.exposed/commit/8652d1219ce5877feb9a90bce51bdb2badc50620))
* **core:** replaced deprecated tselint.config with defineConfig from eslint ([#2817](https://github.com/lies-exposed/lies.exposed/issues/2817)) ([0266861](https://github.com/lies-exposed/lies.exposed/commit/026686115f656ea842faea5924a29d1f486c8503))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
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
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* removed 'project' property from languageOptions.parserOptions in favor of 'projectService' ([be5db76](https://github.com/lies-exposed/lies.exposed/commit/be5db7664d703373013ca82b6dcbb849a088ddad))
* **shared:** refactor event helpers ([#3067](https://github.com/lies-exposed/lies.exposed/issues/3067)) ([d9c5980](https://github.com/lies-exposed/lies.exposed/commit/d9c5980b68af7ca62f95b09922041613ac1e1677))
* **shared:** remove Project resource from the codebase ([#3348](https://github.com/lies-exposed/lies.exposed/issues/3348)) ([d781ab3](https://github.com/lies-exposed/lies.exposed/commit/d781ab3d239fbb6ff899f17c78cda900788ec3ab))
* **storybook:** added stories for ErrorBox component ([#3101](https://github.com/lies-exposed/lies.exposed/issues/3101)) ([2f68ced](https://github.com/lies-exposed/lies.exposed/commit/2f68ced04151d8dfabb2ce046998a35b1b85ec8e))
* **storybook:** bump eslint-plugin-storybook from 9 to 10 ([03199f2](https://github.com/lies-exposed/lies.exposed/commit/03199f252ef2507e8b44f501aca3dfbfbf380dc5))
* **storybook:** bump the storybook group from 10.1.10 to 10.1.11 ([#2912](https://github.com/lies-exposed/lies.exposed/issues/2912)) ([b9286ae](https://github.com/lies-exposed/lies.exposed/commit/b9286aefa5ac3039bfe9155a4fb9176a6d7e9f77))
* **storybook:** keep track of .env.prod ([#3137](https://github.com/lies-exposed/lies.exposed/issues/3137)) ([05fc3d6](https://github.com/lies-exposed/lies.exposed/commit/05fc3d6ea7e257a874644dff1ce8484bc535a6a5))
* **storybook:** reorganize stories into proper folder hierarchy ([#3322](https://github.com/lies-exposed/lies.exposed/issues/3322)) ([5285b10](https://github.com/lies-exposed/lies.exposed/commit/5285b10eda0acf836b4fdbc14e3a6ed8975ec826))
* update release-please config for v0.1.0 releases ([#2898](https://github.com/lies-exposed/lies.exposed/issues/2898)) ([cd0acf9](https://github.com/lies-exposed/lies.exposed/commit/cd0acf915dab59cb25a40e7857223faca138c2fe))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
* **workspace:** renamed storybook package to @liexp/storybook ([#2925](https://github.com/lies-exposed/lies.exposed/issues/2925)) ([0143865](https://github.com/lies-exposed/lies.exposed/commit/014386568140ef6c362f289936e036de07fe077c))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/io bumped to 0.6.0
    * @liexp/shared bumped to 0.6.0
    * @liexp/test bumped to 0.6.0
    * @liexp/ui bumped to 0.6.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.6.0
</details>

<details><summary>@liexp/test: 0.6.0</summary>

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...@liexp/test@0.6.0) (2026-03-11)


### Bug Fixes

* **@liexp/test:** replace "as any" with proper types ([84a8133](https://github.com/lies-exposed/lies.exposed/commit/84a8133e71c2c88d72f4e4e329d5f9a332f0b3f9))
* **agent:** add story CLI command group with spec tests ([#3351](https://github.com/lies-exposed/lies.exposed/issues/3351)) ([03aae78](https://github.com/lies-exposed/lies.exposed/commit/03aae782b20021988a19384bc0cd609c7e288e56))
* **agent:** provide cli tools to access platform resources ([#3332](https://github.com/lies-exposed/lies.exposed/issues/3332)) ([6ba161f](https://github.com/lies-exposed/lies.exposed/commit/6ba161fcc9dc132fdedc9d3b81a8b3432325dfc6))
* **api:** added create and edit tools for every event type ([#2851](https://github.com/lies-exposed/lies.exposed/issues/2851)) ([f5e42a4](https://github.com/lies-exposed/lies.exposed/commit/f5e42a4ee39e3cebf5920daa873f1ac00f725b2e))
* **api:** added tools to find and get nation entities ([#2983](https://github.com/lies-exposed/lies.exposed/issues/2983)) ([3e6de57](https://github.com/lies-exposed/lies.exposed/commit/3e6de57e4f0456a4892fc9facc010989540ecf81))
* **api:** get event with deleted items for admins ([#3020](https://github.com/lies-exposed/lies.exposed/issues/3020)) ([0d10219](https://github.com/lies-exposed/lies.exposed/commit/0d102194a77d17278b31c44ff4b1fa9445e10390))
* chat providers and prompts ([#3208](https://github.com/lies-exposed/lies.exposed/issues/3208)) ([db9dbde](https://github.com/lies-exposed/lies.exposed/commit/db9dbdee889a3de0f8a358cb42d3090a305de07b))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* io namespace imports ([#3216](https://github.com/lies-exposed/lies.exposed/issues/3216)) ([0efdfc6](https://github.com/lies-exposed/lies.exposed/commit/0efdfc67a6b43d34a874a3b6fda8169d10486948))
* **shared:** use UUID for scientific study payload image ([#3066](https://github.com/lies-exposed/lies.exposed/issues/3066)) ([e069dee](https://github.com/lies-exposed/lies.exposed/commit/e069deefbe953c44ab94593dd6bdaf3bfe4a9543))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))


### Miscellaneous

* bump eslint and related deps ([fe055a8](https://github.com/lies-exposed/lies.exposed/commit/fe055a8b704f8fc8511d7b22cc04751d8f8fc9a0))
* bump pnpm from 10.23.0 to 10.26.0 ([db8bdc6](https://github.com/lies-exposed/lies.exposed/commit/db8bdc69b1816dd2845fb54b004689db98d09064))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* bump pnpm to 10.23.0 ([d4a6ef0](https://github.com/lies-exposed/lies.exposed/commit/d4a6ef073804068182a8796b58c47469503898a3))
* **core:** replaced deprecated tselint.config with defineConfig from eslint ([#2817](https://github.com/lies-exposed/lies.exposed/issues/2817)) ([0266861](https://github.com/lies-exposed/lies.exposed/commit/026686115f656ea842faea5924a29d1f486c8503))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* moved queue implementation from fs to pg ([#3136](https://github.com/lies-exposed/lies.exposed/issues/3136)) ([5d9efc8](https://github.com/lies-exposed/lies.exposed/commit/5d9efc865751e6468b0e883a87005029f4e32802))
* release  0.1.1 ([#2923](https://github.com/lies-exposed/lies.exposed/issues/2923)) ([a027e30](https://github.com/lies-exposed/lies.exposed/commit/a027e304508b1f02bad1db62d7471a8e0cd145ec))
* release  0.1.10 ([#3087](https://github.com/lies-exposed/lies.exposed/issues/3087)) ([533f416](https://github.com/lies-exposed/lies.exposed/commit/533f4165ee50af12d73fa1d6e36d43acd76957ee))
* release  0.1.11 ([#3110](https://github.com/lies-exposed/lies.exposed/issues/3110)) ([c90911d](https://github.com/lies-exposed/lies.exposed/commit/c90911d8a868e10c76b5c1204c3d9b6c89cd09fe))
* release  0.1.12 ([#3119](https://github.com/lies-exposed/lies.exposed/issues/3119)) ([f68b50a](https://github.com/lies-exposed/lies.exposed/commit/f68b50a33f518bdaf2cc1f0e6bbd3d610a1245a2))
* release  0.1.13 ([#3128](https://github.com/lies-exposed/lies.exposed/issues/3128)) ([12031de](https://github.com/lies-exposed/lies.exposed/commit/12031deda14ae5873eafbfddc46df96bf0f1f595))
* release  0.1.2 ([#2930](https://github.com/lies-exposed/lies.exposed/issues/2930)) ([c8bd7a9](https://github.com/lies-exposed/lies.exposed/commit/c8bd7a994c3f114807b00b8855a495e467dcf735))
* release  0.1.4 ([#2964](https://github.com/lies-exposed/lies.exposed/issues/2964)) ([f506ebf](https://github.com/lies-exposed/lies.exposed/commit/f506ebfaea62f600e83be963ae872efba9c14917))
* release  0.1.5 ([#2975](https://github.com/lies-exposed/lies.exposed/issues/2975)) ([e674ffb](https://github.com/lies-exposed/lies.exposed/commit/e674ffb193fb2d78ee1762433d371cbe87725879))
* release  0.1.6 ([#2989](https://github.com/lies-exposed/lies.exposed/issues/2989)) ([f3a692b](https://github.com/lies-exposed/lies.exposed/commit/f3a692bc267c1c4d168c9bc02df5c307679dc843))
* release  0.1.7 ([#2999](https://github.com/lies-exposed/lies.exposed/issues/2999)) ([7b73dce](https://github.com/lies-exposed/lies.exposed/commit/7b73dce7b5e5aa202d8d972019f4676249ed7d54))
* release  0.1.8 ([#3026](https://github.com/lies-exposed/lies.exposed/issues/3026)) ([857453b](https://github.com/lies-exposed/lies.exposed/commit/857453b8c1b3960513723ab18b729a590cfe9dd6))
* release  0.1.9 ([#3047](https://github.com/lies-exposed/lies.exposed/issues/3047)) ([afa22b6](https://github.com/lies-exposed/lies.exposed/commit/afa22b62a34af2fe0d36f44e4e97ebeb450b3224))
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* removed 'project' property from languageOptions.parserOptions in favor of 'projectService' ([be5db76](https://github.com/lies-exposed/lies.exposed/commit/be5db7664d703373013ca82b6dcbb849a088ddad))
* **shared:** remove Project resource from the codebase ([#3348](https://github.com/lies-exposed/lies.exposed/issues/3348)) ([d781ab3](https://github.com/lies-exposed/lies.exposed/commit/d781ab3d239fbb6ff899f17c78cda900788ec3ab))
* **test:** defined documentary and quote event arbitraries ([c417d18](https://github.com/lies-exposed/lies.exposed/commit/c417d18cfcb997ce927964cf55b5f1850f9a1e18))
* **web:** added vitest configuration for e2e tests ([#2969](https://github.com/lies-exposed/lies.exposed/issues/2969)) ([01a18be](https://github.com/lies-exposed/lies.exposed/commit/01a18bead95bb71e842ccbd57441987f2934e295))
* **worker:** proper mocks initialization for e2e tests ([#2998](https://github.com/lies-exposed/lies.exposed/issues/2998)) ([4619599](https://github.com/lies-exposed/lies.exposed/commit/4619599251bb8eca66c3a35ad17d10e0f9c3d2a9))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/io bumped to 0.6.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.6.0
</details>

<details><summary>@liexp/ui: 0.6.0</summary>

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...@liexp/ui@0.6.0) (2026-03-11)


### Features

* added endpoint to merge events ([#3055](https://github.com/lies-exposed/lies.exposed/issues/3055)) ([46da181](https://github.com/lies-exposed/lies.exposed/commit/46da1812e13deae9b8d1736e7c2295372660a43b))
* **admin:** implement frontend proxy integration (Phase 2) ([#2842](https://github.com/lies-exposed/lies.exposed/issues/2842)) ([1b9f2f7](https://github.com/lies-exposed/lies.exposed/commit/1b9f2f7271882863885e4ffb27b99c7e18f03252))
* **agent:** streamable chat endpoint ([#2845](https://github.com/lies-exposed/lies.exposed/issues/2845)) ([c7376ca](https://github.com/lies-exposed/lies.exposed/commit/c7376caab780cd66d3e7116471fbd6dd7fb2484a))
* create actor relation ([#3167](https://github.com/lies-exposed/lies.exposed/issues/3167)) ([f251e56](https://github.com/lies-exposed/lies.exposed/commit/f251e56a8b360dae003b88601f5bbe03cdf4216e))


### Bug Fixes

* admin links page mobile responsiveness ([#3218](https://github.com/lies-exposed/lies.exposed/issues/3218)) ([b62d6b6](https://github.com/lies-exposed/lies.exposed/commit/b62d6b6cd5b1a06efc345a732942355bb03ebaba))
* **admin:** add cretor to link approval rules and a set-me-as author button ([#3300](https://github.com/lies-exposed/lies.exposed/issues/3300)) ([292fc2c](https://github.com/lies-exposed/lies.exposed/commit/292fc2cdc7cdd368c75554792772cce4478e7f05))
* **admin:** add relationship palette to admin theme to fix EntitreeGraph crash ([#3280](https://github.com/lies-exposed/lies.exposed/issues/3280)) ([0e9f651](https://github.com/lies-exposed/lies.exposed/commit/0e9f651c3624895f707732609bca0dcfd5f2ad64))
* **admin:** auto-populate publishDate from date embedded in link URL ([#3282](https://github.com/lies-exposed/lies.exposed/issues/3282)) ([3f74659](https://github.com/lies-exposed/lies.exposed/commit/3f74659a190e9226a09d9ea7292f19d75cb2bcfa))
* **admin:** chat  tools and messages stream and UI adjustments ([#2981](https://github.com/lies-exposed/lies.exposed/issues/2981)) ([faa9068](https://github.com/lies-exposed/lies.exposed/commit/faa9068fdac40812d72d7c3661e6fa16aa8e2d5a))
* **admin:** create entities with either new media or existing one ([#2985](https://github.com/lies-exposed/lies.exposed/issues/2985)) ([63302bf](https://github.com/lies-exposed/lies.exposed/commit/63302bf638482501b5d13d02bedb1a87cc833877))
* **admin:** description with Tooltip for AI jobs ([#2994](https://github.com/lies-exposed/lies.exposed/issues/2994)) ([6b4847a](https://github.com/lies-exposed/lies.exposed/commit/6b4847a8f6383755e2d7bee57306db5b0287dc5a))
* **admin:** filter links by events count ([#2978](https://github.com/lies-exposed/lies.exposed/issues/2978)) ([2baee88](https://github.com/lies-exposed/lies.exposed/commit/2baee882c054639ecc76437aaf7fd9589d6fa43a))
* **admin:** fix ids[] array limit and excerpt empty string ([#3357](https://github.com/lies-exposed/lies.exposed/issues/3357)) ([4e5bb94](https://github.com/lies-exposed/lies.exposed/commit/4e5bb94a564fe173ae05cffe8da0496fc91063a9))
* **admin:** fix link list media alignment ([#3319](https://github.com/lies-exposed/lies.exposed/issues/3319)) ([e98c135](https://github.com/lies-exposed/lies.exposed/commit/e98c135f873e6a9bcafa69de5f276cc68f25d571))
* **admin:** missing sidebar pages icons and fixed colors ([#3135](https://github.com/lies-exposed/lies.exposed/issues/3135)) ([96f7d18](https://github.com/lies-exposed/lies.exposed/commit/96f7d18d2ae7d1187eaa17a5f872372cd4438590))
* **admin:** preserve link image in all direct useUpdate calls  ([#3323](https://github.com/lies-exposed/lies.exposed/issues/3323)) ([049e554](https://github.com/lies-exposed/lies.exposed/commit/049e554a9e7dfb0856c085cb1c467c95353b4dab))
* **admin:** unauthorized errors redirect ([#3193](https://github.com/lies-exposed/lies.exposed/issues/3193)) ([6aaffc6](https://github.com/lies-exposed/lies.exposed/commit/6aaffc6b17aba36c99a825c0ee0741caaf7d08a1))
* advanced lazy-loading patterns for web bundle optimization ([#3235](https://github.com/lies-exposed/lies.exposed/issues/3235)) ([571c9b8](https://github.com/lies-exposed/lies.exposed/commit/571c9b8fca271601fa9e7d3c08f3c101a965a292))
* **agent:** add story CLI command group with spec tests ([#3351](https://github.com/lies-exposed/lies.exposed/issues/3351)) ([03aae78](https://github.com/lies-exposed/lies.exposed/commit/03aae782b20021988a19384bc0cd609c7e288e56))
* **agent:** agent supervisor ([#3344](https://github.com/lies-exposed/lies.exposed/issues/3344)) ([723675e](https://github.com/lies-exposed/lies.exposed/commit/723675e1f5b2e0c5474c40944239cf6b8b9cb9b7))
* **agent:** multiprovider AI agent configuration ([#3206](https://github.com/lies-exposed/lies.exposed/issues/3206)) ([06920b4](https://github.com/lies-exposed/lies.exposed/commit/06920b4bf246b7c22f5c5acc9f9cd8b4909a1e13))
* **ai-bot:** add create event from multiple links feature ([#3098](https://github.com/lies-exposed/lies.exposed/issues/3098)) ([#3099](https://github.com/lies-exposed/lies.exposed/issues/3099)) ([8644ffc](https://github.com/lies-exposed/lies.exposed/commit/8644ffc883fd294e130cbcee3ef6865a9ca28628))
* **ai-bot:** link metadata extraction and status filtering for admin  ([#3242](https://github.com/lies-exposed/lies.exposed/issues/3242)) ([8b2ce40](https://github.com/lies-exposed/lies.exposed/commit/8b2ce40aaf32c1c6798f282e49ff8e9e7335e015))
* **api:** added endpoint to merge actors ([#2984](https://github.com/lies-exposed/lies.exposed/issues/2984)) ([459df12](https://github.com/lies-exposed/lies.exposed/commit/459df124dbb2c7d73c3eb1e5418d00d11bfa6352))
* **api:** added tools to find and get nation entities ([#2983](https://github.com/lies-exposed/lies.exposed/issues/2983)) ([3e6de57](https://github.com/lies-exposed/lies.exposed/commit/3e6de57e4f0456a4892fc9facc010989540ecf81))
* **api:** endpoints to link actors to events ([#3053](https://github.com/lies-exposed/lies.exposed/issues/3053)) ([78e9925](https://github.com/lies-exposed/lies.exposed/commit/78e9925c90d0fdde7d39a41db96d7a0642e5d135))
* **api:** include relations in listed events when requested via query params ([#3032](https://github.com/lies-exposed/lies.exposed/issues/3032)) ([e9d85a7](https://github.com/lies-exposed/lies.exposed/commit/e9d85a796367ef7410b02ed0039fcdd26710e2fd))
* **api:** prevent circular PARENT_CHILD relations crashing admin UI ([#3211](https://github.com/lies-exposed/lies.exposed/issues/3211)) ([7cad842](https://github.com/lies-exposed/lies.exposed/commit/7cad842a7d4c3560cdbb5427a9da261292dd320c))
* **api:** stories validation ([#3270](https://github.com/lies-exposed/lies.exposed/issues/3270)) ([57dc553](https://github.com/lies-exposed/lies.exposed/commit/57dc553ede1a3f120d4dc3824aaf4a4b176f7f71))
* **backend:** added status to LinkEntity ([#3156](https://github.com/lies-exposed/lies.exposed/issues/3156)) ([71980bf](https://github.com/lies-exposed/lies.exposed/commit/71980bf2e401423c85cb1722e8cff338792b1864))
* chat providers and prompts ([#3208](https://github.com/lies-exposed/lies.exposed/issues/3208)) ([db9dbde](https://github.com/lies-exposed/lies.exposed/commit/db9dbdee889a3de0f8a358cb42d3090a305de07b))
* **core:** fix dotenv v17 ESM resolution in Vite config bundler ([#3327](https://github.com/lies-exposed/lies.exposed/issues/3327)) ([84843e1](https://github.com/lies-exposed/lies.exposed/commit/84843e112e774248d294a2afd85704258bd39d51))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* mcp tools ([#3188](https://github.com/lies-exposed/lies.exposed/issues/3188)) ([3b9a8ce](https://github.com/lies-exposed/lies.exposed/commit/3b9a8ceefe7ee7510820d039a3fea4de29f58cbd))
* **ui:** add 'copy' button to ChatUI assistant message ([fe66b2b](https://github.com/lies-exposed/lies.exposed/commit/fe66b2b12a8e4c9657c5db9edc6656bffbf70abe))
* **ui:** add AIInstructionButton component ([#3062](https://github.com/lies-exposed/lies.exposed/issues/3062)) ([a09c400](https://github.com/lies-exposed/lies.exposed/commit/a09c400c966298f45f1cb663eb9ca5027f44351e))
* **ui:** add link entity registration from BlockNote editor  ([#3264](https://github.com/lies-exposed/lies.exposed/issues/3264)) ([0c6ec5b](https://github.com/lies-exposed/lies.exposed/commit/0c6ec5b53b35cbd0b24f6883ef18b610702eb5a0))
* **ui:** chat compatibility with dark theme ([#3331](https://github.com/lies-exposed/lies.exposed/issues/3331)) ([22fe9a3](https://github.com/lies-exposed/lies.exposed/commit/22fe9a3f2ed4dac904f645e40918fb3f242a9db5))
* **ui:** create event from link with AI button ([#3017](https://github.com/lies-exposed/lies.exposed/issues/3017)) ([8bf695e](https://github.com/lies-exposed/lies.exposed/commit/8bf695e2b24e7f4812ce46ffc476fd30f959b79b))
* **ui:** create event from link with redirect to new event ([#3001](https://github.com/lies-exposed/lies.exposed/issues/3001)) ([d097d0d](https://github.com/lies-exposed/lies.exposed/commit/d097d0df035aba3d05939463e5cdbd8d873bc4fc))
* **ui:** created UpdateEventQueueButton component ([#3030](https://github.com/lies-exposed/lies.exposed/issues/3030)) ([d23f7eb](https://github.com/lies-exposed/lies.exposed/commit/d23f7ebab3efbb2c32d65fe37d9af72624cf4645))
* **ui:** defined EventTypeSelect component ([#3071](https://github.com/lies-exposed/lies.exposed/issues/3071)) ([a75baad](https://github.com/lies-exposed/lies.exposed/commit/a75baad174b9b4f9ba9ba75a2cb2831abebc3bee))
* **ui:** global search command palette (Ctrl+K) ([#3324](https://github.com/lies-exposed/lies.exposed/issues/3324)) ([24ab24a](https://github.com/lies-exposed/lies.exposed/commit/24ab24a9628bcd258784a08381e0bbab7473465e))
* **ui:** handle empty event relations in EventRelations component ([#3152](https://github.com/lies-exposed/lies.exposed/issues/3152)) ([95a7638](https://github.com/lies-exposed/lies.exposed/commit/95a7638c84a478d82a0b94d6532e4d3fc0b08d19))
* **ui:** improve actor family tree graph ([#3212](https://github.com/lies-exposed/lies.exposed/issues/3212)) ([513fc06](https://github.com/lies-exposed/lies.exposed/commit/513fc06dc3faa4a2ba7d00ff9a4be0b6f0bfd595))
* **ui:** link edit approve button ([#3274](https://github.com/lies-exposed/lies.exposed/issues/3274)) ([c5abc9f](https://github.com/lies-exposed/lies.exposed/commit/c5abc9f5d831b0a772c0758aa1854c6eb79b5e22))
* **ui:** media upload progress bar value conversion ([#2841](https://github.com/lies-exposed/lies.exposed/issues/2841)) ([91b78ce](https://github.com/lies-exposed/lies.exposed/commit/91b78ced171043510eeef38601909111c489f260))
* **ui:** openai job button with icons instead of text ([#3046](https://github.com/lies-exposed/lies.exposed/issues/3046)) ([2b657ee](https://github.com/lies-exposed/lies.exposed/commit/2b657ee5fe2c6e9541f8502eee10d35f798b8ea3))
* **ui:** remove isLoading from OpenAIJobUtton ([#2997](https://github.com/lies-exposed/lies.exposed/issues/2997)) ([d873e4d](https://github.com/lies-exposed/lies.exposed/commit/d873e4d652d6b7194b5d94508c24cca503e50d71))
* **ui:** set min width for link datagrid function field ([#3117](https://github.com/lies-exposed/lies.exposed/issues/3117)) ([c25387b](https://github.com/lies-exposed/lies.exposed/commit/c25387b6bbf40289c1514a77698dfc1a73de46ee))
* **ui:** show event media relation in autocomplete input component ([#3031](https://github.com/lies-exposed/lies.exposed/issues/3031)) ([5f2257b](https://github.com/lies-exposed/lies.exposed/commit/5f2257b7e20ac1ad24069b264d8838a1715ed1fb))
* **ui:** use form control in TextWithSlugInput ([#3114](https://github.com/lies-exposed/lies.exposed/issues/3114)) ([91044ca](https://github.com/lies-exposed/lies.exposed/commit/91044ca972a55f69000b367a8f5cf493b3a0a142))
* **ui:** use react-hook-form hooks to keep TextWithSlugInput values in syn ([#2971](https://github.com/lies-exposed/lies.exposed/issues/2971)) ([88f3f2d](https://github.com/lies-exposed/lies.exposed/commit/88f3f2d4a06e8b3a5a13574ee8b3686486247df2))
* **web:** actor page layout ([#3233](https://github.com/lies-exposed/lies.exposed/issues/3233)) ([17de206](https://github.com/lies-exposed/lies.exposed/commit/17de206df17e9de318b741bfd22c3a39f626e0a4))
* **web:** improve media page layout and home page media grid ([#3325](https://github.com/lies-exposed/lies.exposed/issues/3325)) ([52b440d](https://github.com/lies-exposed/lies.exposed/commit/52b440d303e60591cb2ddb1c14c9c8f936a40e03))
* **web:** keep only one fixed dimension for react-virutalized CellMeasurerCache ([#2961](https://github.com/lies-exposed/lies.exposed/issues/2961)) ([b5ae7aa](https://github.com/lies-exposed/lies.exposed/commit/b5ae7aab2a0994a289c1d789c1bceb83299d2f73))
* **web:** mobile layout refactor ([#3229](https://github.com/lies-exposed/lies.exposed/issues/3229)) ([1d5125f](https://github.com/lies-exposed/lies.exposed/commit/1d5125fb841c4b33f856c8d86b52066f991cc49c))
* **web:** mobile layout responsiveness ([#3221](https://github.com/lies-exposed/lies.exposed/issues/3221)) ([55bbb04](https://github.com/lies-exposed/lies.exposed/commit/55bbb046a4e5ee397516c6c324233d504ed16655))
* **web:** mobile responsiveness ([#3231](https://github.com/lies-exposed/lies.exposed/issues/3231)) ([df71064](https://github.com/lies-exposed/lies.exposed/commit/df710640c2322f69dc2620161dae7eb43bad37ea))
* **web:** route matching order ([#3226](https://github.com/lies-exposed/lies.exposed/issues/3226)) ([4521a0e](https://github.com/lies-exposed/lies.exposed/commit/4521a0e01f42de0c79909b3fd9a894e382f7d2c6))
* **worker:** add backfill-link-publish-dates command ([#3317](https://github.com/lies-exposed/lies.exposed/issues/3317)) ([e33e26d](https://github.com/lies-exposed/lies.exposed/commit/e33e26d17560e2b544811822a0a540328a97f138))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))
* **workspace:** expose current version info ([#3166](https://github.com/lies-exposed/lies.exposed/issues/3166)) ([a2230f7](https://github.com/lies-exposed/lies.exposed/commit/a2230f7c37f90f0ced8dc272ccb861cd749e08bf))


### Miscellaneous

* **admin:** implement HMR for development server ([#3034](https://github.com/lies-exposed/lies.exposed/issues/3034)) ([13f4b42](https://github.com/lies-exposed/lies.exposed/commit/13f4b4256065f256272575d27892e6bcf9b310c9))
* **admin:** moved hooks and context to @liexp/ui ([#3064](https://github.com/lies-exposed/lies.exposed/issues/3064)) ([3f9d3b5](https://github.com/lies-exposed/lies.exposed/commit/3f9d3b54e186a476216161624f50069d4a5835c5))
* **agent:** use [@ts-endpoint](https://github.com/ts-endpoint) stream endpoint definition ([#3112](https://github.com/lies-exposed/lies.exposed/issues/3112)) ([52c265d](https://github.com/lies-exposed/lies.exposed/commit/52c265d95ac581d7f61a17da19ed9cdf71833ae7))
* **backend:** moved node SSR logic from @liexp/ui ([#2967](https://github.com/lies-exposed/lies.exposed/issues/2967)) ([a6ed9f0](https://github.com/lies-exposed/lies.exposed/commit/a6ed9f0579033fbf556e805ea1ed4dda46cef899))
* bump [@blocknote](https://github.com/blocknote) group from 0.44.2 to 0.45.0 ([6bad161](https://github.com/lies-exposed/lies.exposed/commit/6bad161b71a5f50038dd91f73a22e969b6faca0f))
* bump eslint and related deps ([fe055a8](https://github.com/lies-exposed/lies.exposed/commit/fe055a8b704f8fc8511d7b22cc04751d8f8fc9a0))
* bump openai from 5.23.2 to 6.15.0 ([#2877](https://github.com/lies-exposed/lies.exposed/issues/2877)) ([8390c5c](https://github.com/lies-exposed/lies.exposed/commit/8390c5c41129eff37310d13a97442b44e355acfc))
* bump pnpm from 10.23.0 to 10.26.0 ([db8bdc6](https://github.com/lies-exposed/lies.exposed/commit/db8bdc69b1816dd2845fb54b004689db98d09064))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* bump pnpm to 10.23.0 ([d4a6ef0](https://github.com/lies-exposed/lies.exposed/commit/d4a6ef073804068182a8796b58c47469503898a3))
* **core:** fp module utils ([#3068](https://github.com/lies-exposed/lies.exposed/issues/3068)) ([1937350](https://github.com/lies-exposed/lies.exposed/commit/19373509798471fb3303c05af721479f71fa023b))
* **core:** replaced deprecated tselint.config with defineConfig from eslint ([#2817](https://github.com/lies-exposed/lies.exposed/issues/2817)) ([0266861](https://github.com/lies-exposed/lies.exposed/commit/026686115f656ea842faea5924a29d1f486c8503))
* **deps-dev:** bump @types/d3-sankey from 0.12.4 to 0.12.5 ([#2938](https://github.com/lies-exposed/lies.exposed/issues/2938)) ([07de970](https://github.com/lies-exposed/lies.exposed/commit/07de97005cfc29b05b869d7eb048aa25945c0553))
* **deps-dev:** bump @types/lodash from 4.17.20 to 4.17.21 ([#2939](https://github.com/lies-exposed/lies.exposed/issues/2939)) ([d027f03](https://github.com/lies-exposed/lies.exposed/commit/d027f033cf9a7c631e1434a23851d3cdc99dd3a4))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* errors refactor ([#3207](https://github.com/lies-exposed/lies.exposed/issues/3207)) ([ed74cee](https://github.com/lies-exposed/lies.exposed/commit/ed74ceea7c12764221f40d6f30f76c3a55e20373))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* refactor error logic ([#3129](https://github.com/lies-exposed/lies.exposed/issues/3129)) ([d04b8ff](https://github.com/lies-exposed/lies.exposed/commit/d04b8ffddb517d49feae3a22649e988bdc77658e))
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
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* removed 'project' property from languageOptions.parserOptions in favor of 'projectService' ([be5db76](https://github.com/lies-exposed/lies.exposed/commit/be5db7664d703373013ca82b6dcbb849a088ddad))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))
* **shared:** moved ai prompts from io package ([#3111](https://github.com/lies-exposed/lies.exposed/issues/3111)) ([3619422](https://github.com/lies-exposed/lies.exposed/commit/3619422b1c3d65cee35ca81a1e67a8afca91ac6f))
* **shared:** refactor event helpers ([#3067](https://github.com/lies-exposed/lies.exposed/issues/3067)) ([d9c5980](https://github.com/lies-exposed/lies.exposed/commit/d9c5980b68af7ca62f95b09922041613ac1e1677))
* **shared:** remove Project resource from the codebase ([#3348](https://github.com/lies-exposed/lies.exposed/issues/3348)) ([d781ab3](https://github.com/lies-exposed/lies.exposed/commit/d781ab3d239fbb6ff899f17c78cda900788ec3ab))
* **storybook:** added stories for ErrorBox component ([#3101](https://github.com/lies-exposed/lies.exposed/issues/3101)) ([2f68ced](https://github.com/lies-exposed/lies.exposed/commit/2f68ced04151d8dfabb2ce046998a35b1b85ec8e))
* **ui:** admin form component environment setup ([#3121](https://github.com/lies-exposed/lies.exposed/issues/3121)) ([60d4dd8](https://github.com/lies-exposed/lies.exposed/commit/60d4dd85d37ed553b9debfd73b017ccb62d7f754))
* **ui:** bump @fortawesome/react-fontawesome from 0.2.2 to 3.1.1 ([#2863](https://github.com/lies-exposed/lies.exposed/issues/2863)) ([4303124](https://github.com/lies-exposed/lies.exposed/commit/43031243f4710563c2f7278be1e6caad6075c6f8))
* **workspace:** added design system definition and documentation ([#3220](https://github.com/lies-exposed/lies.exposed/issues/3220)) ([0399f5c](https://github.com/lies-exposed/lies.exposed/commit/0399f5ce1961a6e944a140eedff05f69dd165524))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
* **workspace:** bump the vite group across 8 directories with 2 updates ([#2894](https://github.com/lies-exposed/lies.exposed/issues/2894)) ([9b335af](https://github.com/lies-exposed/lies.exposed/commit/9b335afd53d543e8225464c7cb93d62986bb8b9b))
* **workspace:** knip issues with vitest configs ([#3183](https://github.com/lies-exposed/lies.exposed/issues/3183)) ([01180b8](https://github.com/lies-exposed/lies.exposed/commit/01180b83ada8d50165fce59869fcef49a632aa48))
* **workspace:** only lint and build changed packages on pre-push ([#2993](https://github.com/lies-exposed/lies.exposed/issues/2993)) ([6702c26](https://github.com/lies-exposed/lies.exposed/commit/6702c264806f60b79b52454ad9a0b1bee9261c08))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.6.0
    * @liexp/io bumped to 0.6.0
    * @liexp/shared bumped to 0.6.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.6.0
</details>

<details><summary>admin: 0.6.0</summary>

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...admin@0.6.0) (2026-03-11)


### Features

* added endpoint to merge events ([#3055](https://github.com/lies-exposed/lies.exposed/issues/3055)) ([46da181](https://github.com/lies-exposed/lies.exposed/commit/46da1812e13deae9b8d1736e7c2295372660a43b))
* create actor relation ([#3167](https://github.com/lies-exposed/lies.exposed/issues/3167)) ([f251e56](https://github.com/lies-exposed/lies.exposed/commit/f251e56a8b360dae003b88601f5bbe03cdf4216e))


### Bug Fixes

* admin links page mobile responsiveness ([#3218](https://github.com/lies-exposed/lies.exposed/issues/3218)) ([b62d6b6](https://github.com/lies-exposed/lies.exposed/commit/b62d6b6cd5b1a06efc345a732942355bb03ebaba))
* **admin:** add queue stats card to dashboard ([#3223](https://github.com/lies-exposed/lies.exposed/issues/3223)) ([d533022](https://github.com/lies-exposed/lies.exposed/commit/d533022076cb1120c8842af589d1a6022e5472d8))
* **admin:** add relationship palette to admin theme to fix EntitreeGraph crash ([#3280](https://github.com/lies-exposed/lies.exposed/issues/3280)) ([0e9f651](https://github.com/lies-exposed/lies.exposed/commit/0e9f651c3624895f707732609bca0dcfd5f2ad64))
* **admin:** added descriptive labels for actor relation type values ([#3198](https://github.com/lies-exposed/lies.exposed/issues/3198)) ([a31d9fa](https://github.com/lies-exposed/lies.exposed/commit/a31d9fa438bae3fe0f3db03134f42a93a9f5fe4e))
* **admin:** dark theme palette ([#3222](https://github.com/lies-exposed/lies.exposed/issues/3222)) ([a000065](https://github.com/lies-exposed/lies.exposed/commit/a00006513826e557a5b2a81a0f67fb38cfbaf2a5))
* **admin:** fix ids[] array limit and excerpt empty string ([#3357](https://github.com/lies-exposed/lies.exposed/issues/3357)) ([4e5bb94](https://github.com/lies-exposed/lies.exposed/commit/4e5bb94a564fe173ae05cffe8da0496fc91063a9))
* **admin:** implement sorting for queue resources ([#3234](https://github.com/lies-exposed/lies.exposed/issues/3234)) ([9e2cb6b](https://github.com/lies-exposed/lies.exposed/commit/9e2cb6b264bf8afad3efef7bdc6ee38a25622429))
* **admin:** missing sidebar pages icons and fixed colors ([#3135](https://github.com/lies-exposed/lies.exposed/issues/3135)) ([96f7d18](https://github.com/lies-exposed/lies.exposed/commit/96f7d18d2ae7d1187eaa17a5f872372cd4438590))
* **admin:** unauthorized errors redirect ([#3193](https://github.com/lies-exposed/lies.exposed/issues/3193)) ([6aaffc6](https://github.com/lies-exposed/lies.exposed/commit/6aaffc6b17aba36c99a825c0ee0741caaf7d08a1))
* advanced lazy-loading patterns for web bundle optimization ([#3235](https://github.com/lies-exposed/lies.exposed/issues/3235)) ([571c9b8](https://github.com/lies-exposed/lies.exposed/commit/571c9b8fca271601fa9e7d3c08f3c101a965a292))
* **agent:** agent supervisor ([#3344](https://github.com/lies-exposed/lies.exposed/issues/3344)) ([723675e](https://github.com/lies-exposed/lies.exposed/commit/723675e1f5b2e0c5474c40944239cf6b8b9cb9b7))
* **agent:** multiprovider AI agent configuration ([#3206](https://github.com/lies-exposed/lies.exposed/issues/3206)) ([06920b4](https://github.com/lies-exposed/lies.exposed/commit/06920b4bf246b7c22f5c5acc9f9cd8b4909a1e13))
* **agent:** provide cli tools to access platform resources ([#3332](https://github.com/lies-exposed/lies.exposed/issues/3332)) ([6ba161f](https://github.com/lies-exposed/lies.exposed/commit/6ba161fcc9dc132fdedc9d3b81a8b3432325dfc6))
* **api:** endpoints to link actors to events ([#3053](https://github.com/lies-exposed/lies.exposed/issues/3053)) ([78e9925](https://github.com/lies-exposed/lies.exposed/commit/78e9925c90d0fdde7d39a41db96d7a0642e5d135))
* **api:** prevent circular PARENT_CHILD relations crashing admin UI ([#3211](https://github.com/lies-exposed/lies.exposed/issues/3211)) ([7cad842](https://github.com/lies-exposed/lies.exposed/commit/7cad842a7d4c3560cdbb5427a9da261292dd320c))
* chat providers and prompts ([#3208](https://github.com/lies-exposed/lies.exposed/issues/3208)) ([db9dbde](https://github.com/lies-exposed/lies.exposed/commit/db9dbdee889a3de0f8a358cb42d3090a305de07b))
* **core:** fix dotenv v17 ESM resolution in Vite config bundler ([#3327](https://github.com/lies-exposed/lies.exposed/issues/3327)) ([84843e1](https://github.com/lies-exposed/lies.exposed/commit/84843e112e774248d294a2afd85704258bd39d51))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* io namespace imports ([#3216](https://github.com/lies-exposed/lies.exposed/issues/3216)) ([0efdfc6](https://github.com/lies-exposed/lies.exposed/commit/0efdfc67a6b43d34a874a3b6fda8169d10486948))
* mcp tools ([#3188](https://github.com/lies-exposed/lies.exposed/issues/3188)) ([3b9a8ce](https://github.com/lies-exposed/lies.exposed/commit/3b9a8ceefe7ee7510820d039a3fea4de29f58cbd))
* **shared:** make merge events helper function only accept NonEmptyArray ([#3134](https://github.com/lies-exposed/lies.exposed/issues/3134)) ([a8ae137](https://github.com/lies-exposed/lies.exposed/commit/a8ae1376345311c25f47b2e14cd9ca69fc11babd))
* **shared:** renamed Endpoints for agent to AgentEndpoints ([#3063](https://github.com/lies-exposed/lies.exposed/issues/3063)) ([5366305](https://github.com/lies-exposed/lies.exposed/commit/53663056c564a92b4ca01805f61edd849b000a26))
* **ui:** improve actor family tree graph ([#3212](https://github.com/lies-exposed/lies.exposed/issues/3212)) ([513fc06](https://github.com/lies-exposed/lies.exposed/commit/513fc06dc3faa4a2ba7d00ff9a4be0b6f0bfd595))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))
* **workspace:** expose current version info ([#3166](https://github.com/lies-exposed/lies.exposed/issues/3166)) ([a2230f7](https://github.com/lies-exposed/lies.exposed/commit/a2230f7c37f90f0ced8dc272ccb861cd749e08bf))


### Miscellaneous

* **admin:** moved hooks and context to @liexp/ui ([#3064](https://github.com/lies-exposed/lies.exposed/issues/3064)) ([3f9d3b5](https://github.com/lies-exposed/lies.exposed/commit/3f9d3b54e186a476216161624f50069d4a5835c5))
* **admin:** renamed service to 'admin' ([#3035](https://github.com/lies-exposed/lies.exposed/issues/3035)) ([b88833a](https://github.com/lies-exposed/lies.exposed/commit/b88833a6a915bd0d9e0da639b034642b614a01eb))
* **admin:** setup custom HMR port for server ([#3051](https://github.com/lies-exposed/lies.exposed/issues/3051)) ([99ef38c](https://github.com/lies-exposed/lies.exposed/commit/99ef38c1d3f8b299341ed2df4dc9197eda0ef4be))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* increase agent chat timeout to 3min ([#3195](https://github.com/lies-exposed/lies.exposed/issues/3195)) ([0bf8c1a](https://github.com/lies-exposed/lies.exposed/commit/0bf8c1ade90c17654a9d4d8fd0229439287102f2))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* refactor error logic ([#3129](https://github.com/lies-exposed/lies.exposed/issues/3129)) ([d04b8ff](https://github.com/lies-exposed/lies.exposed/commit/d04b8ffddb517d49feae3a22649e988bdc77658e))
* release  0.1.10 ([#3087](https://github.com/lies-exposed/lies.exposed/issues/3087)) ([533f416](https://github.com/lies-exposed/lies.exposed/commit/533f4165ee50af12d73fa1d6e36d43acd76957ee))
* release  0.1.11 ([#3110](https://github.com/lies-exposed/lies.exposed/issues/3110)) ([c90911d](https://github.com/lies-exposed/lies.exposed/commit/c90911d8a868e10c76b5c1204c3d9b6c89cd09fe))
* release  0.1.12 ([#3119](https://github.com/lies-exposed/lies.exposed/issues/3119)) ([f68b50a](https://github.com/lies-exposed/lies.exposed/commit/f68b50a33f518bdaf2cc1f0e6bbd3d610a1245a2))
* release  0.1.13 ([#3128](https://github.com/lies-exposed/lies.exposed/issues/3128)) ([12031de](https://github.com/lies-exposed/lies.exposed/commit/12031deda14ae5873eafbfddc46df96bf0f1f595))
* release  0.1.8 ([#3026](https://github.com/lies-exposed/lies.exposed/issues/3026)) ([857453b](https://github.com/lies-exposed/lies.exposed/commit/857453b8c1b3960513723ab18b729a590cfe9dd6))
* release  0.1.9 ([#3047](https://github.com/lies-exposed/lies.exposed/issues/3047)) ([afa22b6](https://github.com/lies-exposed/lies.exposed/commit/afa22b62a34af2fe0d36f44e4e97ebeb450b3224))
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))
* typeorm pglite transaction isolation for e2e tests ([#2995](https://github.com/lies-exposed/lies.exposed/issues/2995)) ([0d4b307](https://github.com/lies-exposed/lies.exposed/commit/0d4b307089f1cc11b7741b2d4b4b5e8325d69119))
* **workspace:** added design system definition and documentation ([#3220](https://github.com/lies-exposed/lies.exposed/issues/3220)) ([0399f5c](https://github.com/lies-exposed/lies.exposed/commit/0399f5ce1961a6e944a140eedff05f69dd165524))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
* **workspace:** enable PWA installation for web and admin services ([#3200](https://github.com/lies-exposed/lies.exposed/issues/3200)) ([830cb5e](https://github.com/lies-exposed/lies.exposed/commit/830cb5e31865964a937f1a632e5250e9c64796e2))
* **workspace:** knip issues with vitest configs ([#3183](https://github.com/lies-exposed/lies.exposed/issues/3183)) ([01180b8](https://github.com/lies-exposed/lies.exposed/commit/01180b83ada8d50165fce59869fcef49a632aa48))
* **workspace:** local https certificate ([#3219](https://github.com/lies-exposed/lies.exposed/issues/3219)) ([b7b597a](https://github.com/lies-exposed/lies.exposed/commit/b7b597ab4fbde0d977e9d1674be78364539d9b0e))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.6.0
    * @liexp/core bumped to 0.6.0
    * @liexp/io bumped to 0.6.0
    * @liexp/shared bumped to 0.6.0
    * @liexp/ui bumped to 0.6.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.6.0
    * @liexp/test bumped to 0.6.0
</details>

<details><summary>agent: 0.6.0</summary>

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...agent@0.6.0) (2026-03-11)


### Features

* **admin:** implement frontend proxy integration (Phase 2) ([#2842](https://github.com/lies-exposed/lies.exposed/issues/2842)) ([1b9f2f7](https://github.com/lies-exposed/lies.exposed/commit/1b9f2f7271882863885e4ffb27b99c7e18f03252))
* **admin:** setup server ([#2840](https://github.com/lies-exposed/lies.exposed/issues/2840)) ([ea5d01d](https://github.com/lies-exposed/lies.exposed/commit/ea5d01d7b8d10423c2632dcb9611ad4f57bf70c5))
* **agent:** retry MCP initializeConnections on startup failure ([#3189](https://github.com/lies-exposed/lies.exposed/issues/3189)) ([23e1510](https://github.com/lies-exposed/lies.exposed/commit/23e151065c2b51034ea4d9df3bca058685ca09af))
* **agent:** streamable chat endpoint ([#2845](https://github.com/lies-exposed/lies.exposed/issues/2845)) ([c7376ca](https://github.com/lies-exposed/lies.exposed/commit/c7376caab780cd66d3e7116471fbd6dd7fb2484a))
* **ai-bot:** use agent via http API ([#2809](https://github.com/lies-exposed/lies.exposed/issues/2809)) ([657ec21](https://github.com/lies-exposed/lies.exposed/commit/657ec218a45c861b06eb74a00310c4770ec435a3))


### Bug Fixes

* **admin:** chat  tools and messages stream and UI adjustments ([#2981](https://github.com/lies-exposed/lies.exposed/issues/2981)) ([faa9068](https://github.com/lies-exposed/lies.exposed/commit/faa9068fdac40812d72d7c3661e6fa16aa8e2d5a))
* **agent:** add story CLI command group with spec tests ([#3351](https://github.com/lies-exposed/lies.exposed/issues/3351)) ([03aae78](https://github.com/lies-exposed/lies.exposed/commit/03aae782b20021988a19384bc0cd609c7e288e56))
* **agent:** agent supervisor ([#3344](https://github.com/lies-exposed/lies.exposed/issues/3344)) ([723675e](https://github.com/lies-exposed/lies.exposed/commit/723675e1f5b2e0c5474c40944239cf6b8b9cb9b7))
* **agent:** cli events sub-command ([#3370](https://github.com/lies-exposed/lies.exposed/issues/3370)) ([c615dc8](https://github.com/lies-exposed/lies.exposed/commit/c615dc8dbcbfde9cb8671f1c763eceda01472bb2))
* **agent:** improve CLI error visibility and IOError formatting ([#3366](https://github.com/lies-exposed/lies.exposed/issues/3366)) ([98b0cf4](https://github.com/lies-exposed/lies.exposed/commit/98b0cf430403f39d80216edb78c913999f49a2a9))
* **agent:** include RESEARCHER.md in Docker image ([#3359](https://github.com/lies-exposed/lies.exposed/issues/3359)) ([f8469df](https://github.com/lies-exposed/lies.exposed/commit/f8469df06c14b63c65f3fa795cc562582f0f3875))
* **agent:** increase chat stream recursion limit from 25 to 50 ([#3363](https://github.com/lies-exposed/lies.exposed/issues/3363)) ([4cf3cb2](https://github.com/lies-exposed/lies.exposed/commit/4cf3cb2d8a479c9949cabdb04d442676c2553e07))
* **agent:** multiprovider AI agent configuration ([#3206](https://github.com/lies-exposed/lies.exposed/issues/3206)) ([06920b4](https://github.com/lies-exposed/lies.exposed/commit/06920b4bf246b7c22f5c5acc9f9cd8b4909a1e13))
* **agent:** provide cli tools to access platform resources ([#3332](https://github.com/lies-exposed/lies.exposed/issues/3332)) ([6ba161f](https://github.com/lies-exposed/lies.exposed/commit/6ba161fcc9dc132fdedc9d3b81a8b3432325dfc6))
* **agent:** provide searchWebTools in agent service ([#3045](https://github.com/lies-exposed/lies.exposed/issues/3045)) ([1191a71](https://github.com/lies-exposed/lies.exposed/commit/1191a713da3eb66fa59f4ce275fc7f6e88a47693))
* **agent:** reconnect to api MCP server automatically on fail ([#3002](https://github.com/lies-exposed/lies.exposed/issues/3002)) ([343d2cc](https://github.com/lies-exposed/lies.exposed/commit/343d2ccc6e219294b1da61473c57b48794a475d7))
* **agent:** support Anthropic AI provider ([#3115](https://github.com/lies-exposed/lies.exposed/issues/3115)) ([2952200](https://github.com/lies-exposed/lies.exposed/commit/29522002dc161e57dbac13af0e9c317a839cb4c5))
* **ai-bot:** created custom strategy for effect-to-zod schema compatibility with NGrok ([#2824](https://github.com/lies-exposed/lies.exposed/issues/2824)) ([8b3a0bc](https://github.com/lies-exposed/lies.exposed/commit/8b3a0bcbd2902fb5b7552598281f344ccbe74600))
* **api:** actor tools schema 'memberId' and 'nationalities' possibly undefined ([#3209](https://github.com/lies-exposed/lies.exposed/issues/3209)) ([03dd92a](https://github.com/lies-exposed/lies.exposed/commit/03dd92ae28f31a17248feba550ca6365eae68083))
* **api:** added create and edit tools for every event type ([#2851](https://github.com/lies-exposed/lies.exposed/issues/2851)) ([f5e42a4](https://github.com/lies-exposed/lies.exposed/commit/f5e42a4ee39e3cebf5920daa873f1ac00f725b2e))
* **backend:** added brave provider for web searches ([#3044](https://github.com/lies-exposed/lies.exposed/issues/3044)) ([e1723b5](https://github.com/lies-exposed/lies.exposed/commit/e1723b5869cc4745cb885f0b3cab463863adc0f4))
* chat providers and prompts ([#3208](https://github.com/lies-exposed/lies.exposed/issues/3208)) ([db9dbde](https://github.com/lies-exposed/lies.exposed/commit/db9dbdee889a3de0f8a358cb42d3090a305de07b))
* **core:** fix dotenv v17 ESM resolution in Vite config bundler ([#3327](https://github.com/lies-exposed/lies.exposed/issues/3327)) ([84843e1](https://github.com/lies-exposed/lies.exposed/commit/84843e112e774248d294a2afd85704258bd39d51))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* **io:** make url optional in EditLink schema ([#3362](https://github.com/lies-exposed/lies.exposed/issues/3362)) ([2fae15a](https://github.com/lies-exposed/lies.exposed/commit/2fae15a6d96945a10ef9654f3bdff5672293339f))
* mcp tools ([#3188](https://github.com/lies-exposed/lies.exposed/issues/3188)) ([3b9a8ce](https://github.com/lies-exposed/lies.exposed/commit/3b9a8ceefe7ee7510820d039a3fea4de29f58cbd))
* **shared:** renamed Endpoints for agent to AgentEndpoints ([#3063](https://github.com/lies-exposed/lies.exposed/issues/3063)) ([5366305](https://github.com/lies-exposed/lies.exposed/commit/53663056c564a92b4ca01805f61edd849b000a26))
* **shared:** use proper common codecs for CLI schemas ([#3371](https://github.com/lies-exposed/lies.exposed/issues/3371)) ([e237ee5](https://github.com/lies-exposed/lies.exposed/commit/e237ee5d6acae99f49117459e4f23ce63ce913d0))
* **shared:** use proper UUID codec for relation ids in MCP schemas ([#3369](https://github.com/lies-exposed/lies.exposed/issues/3369)) ([e5f02c6](https://github.com/lies-exposed/lies.exposed/commit/e5f02c64de8c23611ba9269d66a34ecd3c3779a4))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))


### Miscellaneous

* **agent:** added @langchain/xai dep ([a81eb88](https://github.com/lies-exposed/lies.exposed/commit/a81eb8894b1396c48d81d594fb64ad5ec6420920))
* **agent:** added e2e test for chat stream endpoint ([#3109](https://github.com/lies-exposed/lies.exposed/issues/3109)) ([ec1ea38](https://github.com/lies-exposed/lies.exposed/commit/ec1ea3807265b573f4677733bbdf0ebf022c9ba5))
* **agent:** use [@ts-endpoint](https://github.com/ts-endpoint) stream endpoint definition ([#3112](https://github.com/lies-exposed/lies.exposed/issues/3112)) ([52c265d](https://github.com/lies-exposed/lies.exposed/commit/52c265d95ac581d7f61a17da19ed9cdf71833ae7))
* **api:** removed puppeteer and puppeteer-extra deps and dead code ([#3149](https://github.com/lies-exposed/lies.exposed/issues/3149)) ([1a6ddab](https://github.com/lies-exposed/lies.exposed/commit/1a6ddabb6a28d42727b94954035f197b4f3646e5))
* bump eslint and related deps ([fe055a8](https://github.com/lies-exposed/lies.exposed/commit/fe055a8b704f8fc8511d7b22cc04751d8f8fc9a0))
* bump express to 5.2.1 ([d6d4c18](https://github.com/lies-exposed/lies.exposed/commit/d6d4c1885140e00846836e908f321ab9bb5f18e5))
* bump langchain from 1.0.6 to 1.2.1 ([3168ffa](https://github.com/lies-exposed/lies.exposed/commit/3168ffa932bd0c34707e693acf6b570ac1298e88))
* bump pnpm from 10.23.0 to 10.26.0 ([db8bdc6](https://github.com/lies-exposed/lies.exposed/commit/db8bdc69b1816dd2845fb54b004689db98d09064))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* bump pnpm to 10.23.0 ([d4a6ef0](https://github.com/lies-exposed/lies.exposed/commit/d4a6ef073804068182a8796b58c47469503898a3))
* **core:** replaced deprecated tselint.config with defineConfig from eslint ([#2817](https://github.com/lies-exposed/lies.exposed/issues/2817)) ([0266861](https://github.com/lies-exposed/lies.exposed/commit/026686115f656ea842faea5924a29d1f486c8503))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* errors refactor ([#3207](https://github.com/lies-exposed/lies.exposed/issues/3207)) ([ed74cee](https://github.com/lies-exposed/lies.exposed/commit/ed74ceea7c12764221f40d6f30f76c3a55e20373))
* increase agent chat timeout to 3min ([#3195](https://github.com/lies-exposed/lies.exposed/issues/3195)) ([0bf8c1a](https://github.com/lies-exposed/lies.exposed/commit/0bf8c1ade90c17654a9d4d8fd0229439287102f2))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* release  0.1.1 ([#2923](https://github.com/lies-exposed/lies.exposed/issues/2923)) ([a027e30](https://github.com/lies-exposed/lies.exposed/commit/a027e304508b1f02bad1db62d7471a8e0cd145ec))
* release  0.1.10 ([#3087](https://github.com/lies-exposed/lies.exposed/issues/3087)) ([533f416](https://github.com/lies-exposed/lies.exposed/commit/533f4165ee50af12d73fa1d6e36d43acd76957ee))
* release  0.1.11 ([#3110](https://github.com/lies-exposed/lies.exposed/issues/3110)) ([c90911d](https://github.com/lies-exposed/lies.exposed/commit/c90911d8a868e10c76b5c1204c3d9b6c89cd09fe))
* release  0.1.12 ([#3119](https://github.com/lies-exposed/lies.exposed/issues/3119)) ([f68b50a](https://github.com/lies-exposed/lies.exposed/commit/f68b50a33f518bdaf2cc1f0e6bbd3d610a1245a2))
* release  0.1.13 ([#3128](https://github.com/lies-exposed/lies.exposed/issues/3128)) ([12031de](https://github.com/lies-exposed/lies.exposed/commit/12031deda14ae5873eafbfddc46df96bf0f1f595))
* release  0.1.2 ([#2930](https://github.com/lies-exposed/lies.exposed/issues/2930)) ([c8bd7a9](https://github.com/lies-exposed/lies.exposed/commit/c8bd7a994c3f114807b00b8855a495e467dcf735))
* release  0.1.4 ([#2964](https://github.com/lies-exposed/lies.exposed/issues/2964)) ([f506ebf](https://github.com/lies-exposed/lies.exposed/commit/f506ebfaea62f600e83be963ae872efba9c14917))
* release  0.1.5 ([#2975](https://github.com/lies-exposed/lies.exposed/issues/2975)) ([e674ffb](https://github.com/lies-exposed/lies.exposed/commit/e674ffb193fb2d78ee1762433d371cbe87725879))
* release  0.1.6 ([#2989](https://github.com/lies-exposed/lies.exposed/issues/2989)) ([f3a692b](https://github.com/lies-exposed/lies.exposed/commit/f3a692bc267c1c4d168c9bc02df5c307679dc843))
* release  0.1.7 ([#2999](https://github.com/lies-exposed/lies.exposed/issues/2999)) ([7b73dce](https://github.com/lies-exposed/lies.exposed/commit/7b73dce7b5e5aa202d8d972019f4676249ed7d54))
* release  0.1.8 ([#3026](https://github.com/lies-exposed/lies.exposed/issues/3026)) ([857453b](https://github.com/lies-exposed/lies.exposed/commit/857453b8c1b3960513723ab18b729a590cfe9dd6))
* release  0.1.9 ([#3047](https://github.com/lies-exposed/lies.exposed/issues/3047)) ([afa22b6](https://github.com/lies-exposed/lies.exposed/commit/afa22b62a34af2fe0d36f44e4e97ebeb450b3224))
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* removed 'project' property from languageOptions.parserOptions in favor of 'projectService' ([be5db76](https://github.com/lies-exposed/lies.exposed/commit/be5db7664d703373013ca82b6dcbb849a088ddad))
* server logging of error details ([3eda9ba](https://github.com/lies-exposed/lies.exposed/commit/3eda9ba06e3bbb9f2b0f986383b1d610652464ff))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))
* solve knip report errors ([4fdf617](https://github.com/lies-exposed/lies.exposed/commit/4fdf617fbe7d464c64a104f38013a4d768e71f39))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
* **workspace:** disable type generation for services build ([#3224](https://github.com/lies-exposed/lies.exposed/issues/3224)) ([4dc573f](https://github.com/lies-exposed/lies.exposed/commit/4dc573f90a5963d2784ecfc460647ad260828194))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.6.0
    * @liexp/core bumped to 0.6.0
    * @liexp/io bumped to 0.6.0
    * @liexp/shared bumped to 0.6.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.6.0
    * @liexp/test bumped to 0.6.0
</details>

<details><summary>ai-bot: 0.6.0</summary>

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...ai-bot@0.6.0) (2026-03-11)


### Features

* **ai-bot:** extract thumbnailUrl from link metadata and create media on job completion ([#3245](https://github.com/lies-exposed/lies.exposed/issues/3245)) ([fe15601](https://github.com/lies-exposed/lies.exposed/commit/fe15601b9909fbf9e9f069f6ff59ba7679263e8e))
* **ai-bot:** use agent via http API ([#2809](https://github.com/lies-exposed/lies.exposed/issues/2809)) ([657ec21](https://github.com/lies-exposed/lies.exposed/commit/657ec218a45c861b06eb74a00310c4770ec435a3))


### Bug Fixes

* **admin:** description with Tooltip for AI jobs ([#2994](https://github.com/lies-exposed/lies.exposed/issues/2994)) ([6b4847a](https://github.com/lies-exposed/lies.exposed/commit/6b4847a8f6383755e2d7bee57306db5b0287dc5a))
* **ai-bot:** add create event from multiple links feature ([#3098](https://github.com/lies-exposed/lies.exposed/issues/3098)) ([#3099](https://github.com/lies-exposed/lies.exposed/issues/3099)) ([8644ffc](https://github.com/lies-exposed/lies.exposed/commit/8644ffc883fd294e130cbcee3ef6865a9ca28628))
* **ai-bot:** create event from links prompt without json schema ([#3108](https://github.com/lies-exposed/lies.exposed/issues/3108)) ([60f47a7](https://github.com/lies-exposed/lies.exposed/commit/60f47a7bc94e5456843bc110fb9125c276f963ea))
* **ai-bot:** create event from links with json schema ([#3123](https://github.com/lies-exposed/lies.exposed/issues/3123)) ([6a90c81](https://github.com/lies-exposed/lies.exposed/commit/6a90c81da9d860589f336f3d930d011273a32e23))
* **ai-bot:** create event from url queue job ([#3015](https://github.com/lies-exposed/lies.exposed/issues/3015)) ([b5bf5f2](https://github.com/lies-exposed/lies.exposed/commit/b5bf5f25761d3326bf1e93d375192eea2858f72b))
* **ai-bot:** created custom strategy for effect-to-zod schema compatibility with NGrok ([#2824](https://github.com/lies-exposed/lies.exposed/issues/2824)) ([8b3a0bc](https://github.com/lies-exposed/lies.exposed/commit/8b3a0bcbd2902fb5b7552598281f344ccbe74600))
* **ai-bot:** flow to update multiple entities from a link ([#3214](https://github.com/lies-exposed/lies.exposed/issues/3214)) ([d36a398](https://github.com/lies-exposed/lies.exposed/commit/d36a3987a390da3e6c482e6f64bcb5f9025440e8))
* **ai-bot:** link metadata extraction and status filtering for admin  ([#3242](https://github.com/lies-exposed/lies.exposed/issues/3242)) ([8b2ce40](https://github.com/lies-exposed/lies.exposed/commit/8b2ce40aaf32c1c6798f282e49ff8e9e7335e015))
* **ai-bot:** remove loadDocs flow in favor of agent tools ([#3048](https://github.com/lies-exposed/lies.exposed/issues/3048)) ([144bb66](https://github.com/lies-exposed/lies.exposed/commit/144bb6671520d893e6f1975f995e589412f00838))
* **ai-bot:** update event flow with proper types and prompts ([#3025](https://github.com/lies-exposed/lies.exposed/issues/3025)) ([ba42afe](https://github.com/lies-exposed/lies.exposed/commit/ba42afef414865c5b70c902fb052e515a2d3ef6a))
* **backend:** added status to LinkEntity ([#3156](https://github.com/lies-exposed/lies.exposed/issues/3156)) ([71980bf](https://github.com/lies-exposed/lies.exposed/commit/71980bf2e401423c85cb1722e8cff338792b1864))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* io namespace imports ([#3216](https://github.com/lies-exposed/lies.exposed/issues/3216)) ([0efdfc6](https://github.com/lies-exposed/lies.exposed/commit/0efdfc67a6b43d34a874a3b6fda8169d10486948))
* **shared:** renamed Endpoints for agent to AgentEndpoints ([#3063](https://github.com/lies-exposed/lies.exposed/issues/3063)) ([5366305](https://github.com/lies-exposed/lies.exposed/commit/53663056c564a92b4ca01805f61edd849b000a26))
* **ui:** remove isLoading from OpenAIJobUtton ([#2997](https://github.com/lies-exposed/lies.exposed/issues/2997)) ([d873e4d](https://github.com/lies-exposed/lies.exposed/commit/d873e4d652d6b7194b5d94508c24cca503e50d71))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))


### Miscellaneous

* bump eslint and related deps ([fe055a8](https://github.com/lies-exposed/lies.exposed/commit/fe055a8b704f8fc8511d7b22cc04751d8f8fc9a0))
* bump langchain from 1.0.6 to 1.2.1 ([3168ffa](https://github.com/lies-exposed/lies.exposed/commit/3168ffa932bd0c34707e693acf6b570ac1298e88))
* bump openai from 5.23.2 to 6.15.0 ([#2877](https://github.com/lies-exposed/lies.exposed/issues/2877)) ([8390c5c](https://github.com/lies-exposed/lies.exposed/commit/8390c5c41129eff37310d13a97442b44e355acfc))
* bump pnpm from 10.23.0 to 10.26.0 ([db8bdc6](https://github.com/lies-exposed/lies.exposed/commit/db8bdc69b1816dd2845fb54b004689db98d09064))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* bump pnpm to 10.23.0 ([d4a6ef0](https://github.com/lies-exposed/lies.exposed/commit/d4a6ef073804068182a8796b58c47469503898a3))
* **core:** replaced deprecated tselint.config with defineConfig from eslint ([#2817](https://github.com/lies-exposed/lies.exposed/issues/2817)) ([0266861](https://github.com/lies-exposed/lies.exposed/commit/026686115f656ea842faea5924a29d1f486c8503))
* **deps:** bump pdfjs-dist from 5.4.149 to 5.4.530 ([#2941](https://github.com/lies-exposed/lies.exposed/issues/2941)) ([3b64984](https://github.com/lies-exposed/lies.exposed/commit/3b64984ce77017e64481035ce98ef3411980cbc7))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* errors refactor ([#3207](https://github.com/lies-exposed/lies.exposed/issues/3207)) ([ed74cee](https://github.com/lies-exposed/lies.exposed/commit/ed74ceea7c12764221f40d6f30f76c3a55e20373))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* moved queue implementation from fs to pg ([#3136](https://github.com/lies-exposed/lies.exposed/issues/3136)) ([5d9efc8](https://github.com/lies-exposed/lies.exposed/commit/5d9efc865751e6468b0e883a87005029f4e32802))
* refactor error logic ([#3129](https://github.com/lies-exposed/lies.exposed/issues/3129)) ([d04b8ff](https://github.com/lies-exposed/lies.exposed/commit/d04b8ffddb517d49feae3a22649e988bdc77658e))
* release  0.1.1 ([#2923](https://github.com/lies-exposed/lies.exposed/issues/2923)) ([a027e30](https://github.com/lies-exposed/lies.exposed/commit/a027e304508b1f02bad1db62d7471a8e0cd145ec))
* release  0.1.10 ([#3087](https://github.com/lies-exposed/lies.exposed/issues/3087)) ([533f416](https://github.com/lies-exposed/lies.exposed/commit/533f4165ee50af12d73fa1d6e36d43acd76957ee))
* release  0.1.11 ([#3110](https://github.com/lies-exposed/lies.exposed/issues/3110)) ([c90911d](https://github.com/lies-exposed/lies.exposed/commit/c90911d8a868e10c76b5c1204c3d9b6c89cd09fe))
* release  0.1.12 ([#3119](https://github.com/lies-exposed/lies.exposed/issues/3119)) ([f68b50a](https://github.com/lies-exposed/lies.exposed/commit/f68b50a33f518bdaf2cc1f0e6bbd3d610a1245a2))
* release  0.1.13 ([#3128](https://github.com/lies-exposed/lies.exposed/issues/3128)) ([12031de](https://github.com/lies-exposed/lies.exposed/commit/12031deda14ae5873eafbfddc46df96bf0f1f595))
* release  0.1.2 ([#2930](https://github.com/lies-exposed/lies.exposed/issues/2930)) ([c8bd7a9](https://github.com/lies-exposed/lies.exposed/commit/c8bd7a994c3f114807b00b8855a495e467dcf735))
* release  0.1.4 ([#2964](https://github.com/lies-exposed/lies.exposed/issues/2964)) ([f506ebf](https://github.com/lies-exposed/lies.exposed/commit/f506ebfaea62f600e83be963ae872efba9c14917))
* release  0.1.5 ([#2975](https://github.com/lies-exposed/lies.exposed/issues/2975)) ([e674ffb](https://github.com/lies-exposed/lies.exposed/commit/e674ffb193fb2d78ee1762433d371cbe87725879))
* release  0.1.6 ([#2989](https://github.com/lies-exposed/lies.exposed/issues/2989)) ([f3a692b](https://github.com/lies-exposed/lies.exposed/commit/f3a692bc267c1c4d168c9bc02df5c307679dc843))
* release  0.1.7 ([#2999](https://github.com/lies-exposed/lies.exposed/issues/2999)) ([7b73dce](https://github.com/lies-exposed/lies.exposed/commit/7b73dce7b5e5aa202d8d972019f4676249ed7d54))
* release  0.1.8 ([#3026](https://github.com/lies-exposed/lies.exposed/issues/3026)) ([857453b](https://github.com/lies-exposed/lies.exposed/commit/857453b8c1b3960513723ab18b729a590cfe9dd6))
* release  0.1.9 ([#3047](https://github.com/lies-exposed/lies.exposed/issues/3047)) ([afa22b6](https://github.com/lies-exposed/lies.exposed/commit/afa22b62a34af2fe0d36f44e4e97ebeb450b3224))
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* removed 'project' property from languageOptions.parserOptions in favor of 'projectService' ([be5db76](https://github.com/lies-exposed/lies.exposed/commit/be5db7664d703373013ca82b6dcbb849a088ddad))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))
* **shared:** moved ai prompts from io package ([#3111](https://github.com/lies-exposed/lies.exposed/issues/3111)) ([3619422](https://github.com/lies-exposed/lies.exposed/commit/3619422b1c3d65cee35ca81a1e67a8afca91ac6f))
* **shared:** refactor event helpers ([#3067](https://github.com/lies-exposed/lies.exposed/issues/3067)) ([d9c5980](https://github.com/lies-exposed/lies.exposed/commit/d9c5980b68af7ca62f95b09922041613ac1e1677))
* solve knip report errors ([4fdf617](https://github.com/lies-exposed/lies.exposed/commit/4fdf617fbe7d464c64a104f38013a4d768e71f39))
* update release-please config for v0.1.0 releases ([#2898](https://github.com/lies-exposed/lies.exposed/issues/2898)) ([cd0acf9](https://github.com/lies-exposed/lies.exposed/commit/cd0acf915dab59cb25a40e7857223faca138c2fe))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.6.0
    * @liexp/core bumped to 0.6.0
    * @liexp/io bumped to 0.6.0
    * @liexp/shared bumped to 0.6.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.6.0
</details>

<details><summary>api: 0.6.0</summary>

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...api@0.6.0) (2026-03-11)


### Features

* added endpoint to merge events ([#3055](https://github.com/lies-exposed/lies.exposed/issues/3055)) ([46da181](https://github.com/lies-exposed/lies.exposed/commit/46da1812e13deae9b8d1736e7c2295372660a43b))
* **admin:** setup server ([#2840](https://github.com/lies-exposed/lies.exposed/issues/2840)) ([ea5d01d](https://github.com/lies-exposed/lies.exposed/commit/ea5d01d7b8d10423c2632dcb9611ad4f57bf70c5))
* **agent:** streamable chat endpoint ([#2845](https://github.com/lies-exposed/lies.exposed/issues/2845)) ([c7376ca](https://github.com/lies-exposed/lies.exposed/commit/c7376caab780cd66d3e7116471fbd6dd7fb2484a))
* **backend:** extract shared m2m auth infrastructure ([#2827](https://github.com/lies-exposed/lies.exposed/issues/2827)) ([72f2219](https://github.com/lies-exposed/lies.exposed/commit/72f2219ccdc64f81fc1797a446b7ce28edfdc05b))
* create actor relation ([#3167](https://github.com/lies-exposed/lies.exposed/issues/3167)) ([f251e56](https://github.com/lies-exposed/lies.exposed/commit/f251e56a8b360dae003b88601f5bbe03cdf4216e))


### Bug Fixes

* added more tools to get resources by id and added e2e tests ([cbd1492](https://github.com/lies-exposed/lies.exposed/commit/cbd1492348d8dcd23c94abe81d636f7ee0d1371e))
* **admin:** add queue stats card to dashboard ([#3223](https://github.com/lies-exposed/lies.exposed/issues/3223)) ([d533022](https://github.com/lies-exposed/lies.exposed/commit/d533022076cb1120c8842af589d1a6022e5472d8))
* **admin:** filter links by events count ([#2978](https://github.com/lies-exposed/lies.exposed/issues/2978)) ([2baee88](https://github.com/lies-exposed/lies.exposed/commit/2baee882c054639ecc76437aaf7fd9589d6fa43a))
* **admin:** implement sorting for queue resources ([#3234](https://github.com/lies-exposed/lies.exposed/issues/3234)) ([9e2cb6b](https://github.com/lies-exposed/lies.exposed/commit/9e2cb6b264bf8afad3efef7bdc6ee38a25622429))
* **agent:** add story CLI command group with spec tests ([#3351](https://github.com/lies-exposed/lies.exposed/issues/3351)) ([03aae78](https://github.com/lies-exposed/lies.exposed/commit/03aae782b20021988a19384bc0cd609c7e288e56))
* **agent:** provide cli tools to access platform resources ([#3332](https://github.com/lies-exposed/lies.exposed/issues/3332)) ([6ba161f](https://github.com/lies-exposed/lies.exposed/commit/6ba161fcc9dc132fdedc9d3b81a8b3432325dfc6))
* **agent:** provide searchWebTools in agent service ([#3045](https://github.com/lies-exposed/lies.exposed/issues/3045)) ([1191a71](https://github.com/lies-exposed/lies.exposed/commit/1191a713da3eb66fa59f4ce275fc7f6e88a47693))
* **ai-bot:** create event from url queue job ([#3015](https://github.com/lies-exposed/lies.exposed/issues/3015)) ([b5bf5f2](https://github.com/lies-exposed/lies.exposed/commit/b5bf5f25761d3326bf1e93d375192eea2858f72b))
* **ai-bot:** created custom strategy for effect-to-zod schema compatibility with NGrok ([#2824](https://github.com/lies-exposed/lies.exposed/issues/2824)) ([8b3a0bc](https://github.com/lies-exposed/lies.exposed/commit/8b3a0bcbd2902fb5b7552598281f344ccbe74600))
* **ai-bot:** link metadata extraction and status filtering for admin  ([#3242](https://github.com/lies-exposed/lies.exposed/issues/3242)) ([8b2ce40](https://github.com/lies-exposed/lies.exposed/commit/8b2ce40aaf32c1c6798f282e49ff8e9e7335e015))
* **api:** actor and group avatar find tools ([#3213](https://github.com/lies-exposed/lies.exposed/issues/3213)) ([0f87695](https://github.com/lies-exposed/lies.exposed/commit/0f87695676d0beabbc2ed843e2515361b10155a2))
* **api:** actor tools schema 'memberId' and 'nationalities' possibly undefined ([#3209](https://github.com/lies-exposed/lies.exposed/issues/3209)) ([03dd92a](https://github.com/lies-exposed/lies.exposed/commit/03dd92ae28f31a17248feba550ca6365eae68083))
* **api:** actors and groups events linking routes ([#3041](https://github.com/lies-exposed/lies.exposed/issues/3041)) ([4d31bcb](https://github.com/lies-exposed/lies.exposed/commit/4d31bcb720288d516fc98de679883a61b79bafea))
* **api:** add Redis response cache with HTTP Cache-Control headers ([#3241](https://github.com/lies-exposed/lies.exposed/issues/3241)) ([8bc2c0b](https://github.com/lies-exposed/lies.exposed/commit/8bc2c0b3e9a614d264aeb727a2422edad0b5f174))
* **api:** added 'getLink' MCP tool ([bf83a31](https://github.com/lies-exposed/lies.exposed/commit/bf83a310cefbe7f9cefc2321b323df7666643d37))
* **api:** added create and edit tools for every event type ([#2851](https://github.com/lies-exposed/lies.exposed/issues/2851)) ([f5e42a4](https://github.com/lies-exposed/lies.exposed/commit/f5e42a4ee39e3cebf5920daa873f1ac00f725b2e))
* **api:** added endpoint to merge actors ([#2984](https://github.com/lies-exposed/lies.exposed/issues/2984)) ([459df12](https://github.com/lies-exposed/lies.exposed/commit/459df124dbb2c7d73c3eb1e5418d00d11bfa6352))
* **api:** added migration for new 'openai-update-entities-from-url' queue type ([#3271](https://github.com/lies-exposed/lies.exposed/issues/3271)) ([1bb0265](https://github.com/lies-exposed/lies.exposed/commit/1bb02651981a4b956a8a68ae003b774830ac1537))
* **api:** added missing 'edit' MCP tools with e2e tests ([6ca4986](https://github.com/lies-exposed/lies.exposed/commit/6ca49865439a3715efa0e84384bc0976a75c8358))
* **api:** added missing 'get by id' MCP tools with e2e tests ([3f8b844](https://github.com/lies-exposed/lies.exposed/commit/3f8b844f77271aa7dd297ca7f7a20c47087e89ce))
* **api:** added missing description to getGroup MCP tool ([#3016](https://github.com/lies-exposed/lies.exposed/issues/3016)) ([42bf2c8](https://github.com/lies-exposed/lies.exposed/commit/42bf2c82e8367a83858882a639c785d8d52bfd51))
* **api:** added tools to find and get nation entities ([#2983](https://github.com/lies-exposed/lies.exposed/issues/2983)) ([3e6de57](https://github.com/lies-exposed/lies.exposed/commit/3e6de57e4f0456a4892fc9facc010989540ecf81))
* **api:** allow query param array length up to 200 ([#3356](https://github.com/lies-exposed/lies.exposed/issues/3356)) ([7761de3](https://github.com/lies-exposed/lies.exposed/commit/7761de3337bc9beed72ee7e7e31dca3825742a54))
* **api:** allow service client to create media without a DB user row ([#3361](https://github.com/lies-exposed/lies.exposed/issues/3361)) ([aacb8ec](https://github.com/lies-exposed/lies.exposed/commit/aacb8ece77af25f6afe4cf20afcc03d9088a39cb))
* **api:** endpoints to link actors to events ([#3053](https://github.com/lies-exposed/lies.exposed/issues/3053)) ([78e9925](https://github.com/lies-exposed/lies.exposed/commit/78e9925c90d0fdde7d39a41db96d7a0642e5d135))
* **api:** event hard delete ([#3024](https://github.com/lies-exposed/lies.exposed/issues/3024)) ([c27656f](https://github.com/lies-exposed/lies.exposed/commit/c27656f01331e1bfcbc7c2ffca37960796b54c5d))
* **api:** get event with deleted items for admins ([#3020](https://github.com/lies-exposed/lies.exposed/issues/3020)) ([0d10219](https://github.com/lies-exposed/lies.exposed/commit/0d102194a77d17278b31c44ff4b1fa9445e10390))
* **api:** include relations in listed events when requested via query params ([#3032](https://github.com/lies-exposed/lies.exposed/issues/3032)) ([e9d85a7](https://github.com/lies-exposed/lies.exposed/commit/e9d85a796367ef7410b02ed0039fcdd26710e2fd))
* **api:** merge events flow ([#3073](https://github.com/lies-exposed/lies.exposed/issues/3073)) ([03669c1](https://github.com/lies-exposed/lies.exposed/commit/03669c1fea5a2be404b531e00c1713c84fe137a2))
* **api:** prevent circular PARENT_CHILD relations crashing admin UI ([#3211](https://github.com/lies-exposed/lies.exposed/issues/3211)) ([7cad842](https://github.com/lies-exposed/lies.exposed/commit/7cad842a7d4c3560cdbb5427a9da261292dd320c))
* **api:** prevent unintended null writes in media and link edit flows ([#3368](https://github.com/lies-exposed/lies.exposed/issues/3368)) ([8be31f6](https://github.com/lies-exposed/lies.exposed/commit/8be31f69409fb27e63fcedb37cc51f91a9b308d7))
* **api:** set timeout to 30s for get metadata client ([#3003](https://github.com/lies-exposed/lies.exposed/issues/3003)) ([21037df](https://github.com/lies-exposed/lies.exposed/commit/21037dffdb4db88b6c48e88f79b5e1083831f803))
* **api:** stories validation ([#3270](https://github.com/lies-exposed/lies.exposed/issues/3270)) ([57dc553](https://github.com/lies-exposed/lies.exposed/commit/57dc553ede1a3f120d4dc3824aaf4a4b176f7f71))
* **backend:** added status to LinkEntity ([#3156](https://github.com/lies-exposed/lies.exposed/issues/3156)) ([71980bf](https://github.com/lies-exposed/lies.exposed/commit/71980bf2e401423c85cb1722e8cff338792b1864))
* **backend:** correct langchain imports and types ([fcc90ef](https://github.com/lies-exposed/lies.exposed/commit/fcc90efd4d65cf0c38f96e4c661160fd0d03b2a0))
* **backend:** handle space TLS connection via env variable ([#2986](https://github.com/lies-exposed/lies.exposed/issues/2986)) ([ccfa27e](https://github.com/lies-exposed/lies.exposed/commit/ccfa27ed47281a7d7975c0d0506d342f3ba2468b))
* enable CORS credentials for authenticated requests between admin and api services ([#3192](https://github.com/lies-exposed/lies.exposed/issues/3192)) ([b7963d3](https://github.com/lies-exposed/lies.exposed/commit/b7963d3aa546bf2e56c41442134725791fb3af8d))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* io namespace imports ([#3216](https://github.com/lies-exposed/lies.exposed/issues/3216)) ([0efdfc6](https://github.com/lies-exposed/lies.exposed/commit/0efdfc67a6b43d34a874a3b6fda8169d10486948))
* **io:** make url optional in EditLink schema ([#3362](https://github.com/lies-exposed/lies.exposed/issues/3362)) ([2fae15a](https://github.com/lies-exposed/lies.exposed/commit/2fae15a6d96945a10ef9654f3bdff5672293339f))
* mcp tools ([#3188](https://github.com/lies-exposed/lies.exposed/issues/3188)) ([3b9a8ce](https://github.com/lies-exposed/lies.exposed/commit/3b9a8ceefe7ee7510820d039a3fea4de29f58cbd))
* **shared:** make merge events helper function only accept NonEmptyArray ([#3134](https://github.com/lies-exposed/lies.exposed/issues/3134)) ([a8ae137](https://github.com/lies-exposed/lies.exposed/commit/a8ae1376345311c25f47b2e14cd9ca69fc11babd))
* **ui:** add link entity registration from BlockNote editor  ([#3264](https://github.com/lies-exposed/lies.exposed/issues/3264)) ([0c6ec5b](https://github.com/lies-exposed/lies.exposed/commit/0c6ec5b53b35cbd0b24f6883ef18b610702eb5a0))
* **ui:** improve actor family tree graph ([#3212](https://github.com/lies-exposed/lies.exposed/issues/3212)) ([513fc06](https://github.com/lies-exposed/lies.exposed/commit/513fc06dc3faa4a2ba7d00ff9a4be0b6f0bfd595))
* web request errors  stats, event payloads, pub/sub, and AI job result handling ([#3228](https://github.com/lies-exposed/lies.exposed/issues/3228)) ([f724796](https://github.com/lies-exposed/lies.exposed/commit/f7247962b33bdd04811fcf23863cbba3320e9caf))
* **worker:** remove premature UpdateEntitiesFromURL pub/sub and let ai-bot scheduler handle the job ([#3279](https://github.com/lies-exposed/lies.exposed/issues/3279)) ([508e19d](https://github.com/lies-exposed/lies.exposed/commit/508e19dbc35a5cc5c17d870750af44b4571d1c8b))
* **worker:** wikipedia api ([#3187](https://github.com/lies-exposed/lies.exposed/issues/3187)) ([f463543](https://github.com/lies-exposed/lies.exposed/commit/f463543e9406640d8f04d8acdf17836068263872))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))
* **workspace:** expose current version info ([#3166](https://github.com/lies-exposed/lies.exposed/issues/3166)) ([a2230f7](https://github.com/lies-exposed/lies.exposed/commit/a2230f7c37f90f0ced8dc272ccb861cd749e08bf))


### Miscellaneous

* **api:** drop orphan tables and rename event_v2 to event ([0b53cef](https://github.com/lies-exposed/lies.exposed/commit/0b53cefee01a0183a5783326b4473166f7314fbd)), closes [#3352](https://github.com/lies-exposed/lies.exposed/issues/3352)
* **api:** explicit import of vitest sdk in tests ([b4c106c](https://github.com/lies-exposed/lies.exposed/commit/b4c106c8236ae0f675f35a2e28d4d7346b941690))
* **api:** extract actor, area, link, and media tools into modular 1:1 pattern ([#2846](https://github.com/lies-exposed/lies.exposed/issues/2846)) ([58222c5](https://github.com/lies-exposed/lies.exposed/commit/58222c5c6b0f260d1086d0c6a9e68ac488c8f370))
* **api:** move config folder creation to proper method ([#3146](https://github.com/lies-exposed/lies.exposed/issues/3146)) ([4bd8375](https://github.com/lies-exposed/lies.exposed/commit/4bd8375f6f7a0161a7d4e9b949da7b6fc1ed4de7))
* **api:** removed puppeteer and puppeteer-extra deps and dead code ([#3149](https://github.com/lies-exposed/lies.exposed/issues/3149)) ([1a6ddab](https://github.com/lies-exposed/lies.exposed/commit/1a6ddabb6a28d42727b94954035f197b4f3646e5))
* **api:** removed unused exports from event tools helpers ([e34d7a2](https://github.com/lies-exposed/lies.exposed/commit/e34d7a249b7e1783a31d9637cfae772cc92f8a1e))
* **api:** solved typecheck errors in test files ([#2991](https://github.com/lies-exposed/lies.exposed/issues/2991)) ([1bbc8e2](https://github.com/lies-exposed/lies.exposed/commit/1bbc8e2bc031d857eec2c13b340c9a4ce9493116))
* bump eslint and related deps ([fe055a8](https://github.com/lies-exposed/lies.exposed/commit/fe055a8b704f8fc8511d7b22cc04751d8f8fc9a0))
* bump express to 5.2.1 ([d6d4c18](https://github.com/lies-exposed/lies.exposed/commit/d6d4c1885140e00846836e908f321ab9bb5f18e5))
* bump pnpm from 10.23.0 to 10.26.0 ([db8bdc6](https://github.com/lies-exposed/lies.exposed/commit/db8bdc69b1816dd2845fb54b004689db98d09064))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* bump pnpm to 10.23.0 ([d4a6ef0](https://github.com/lies-exposed/lies.exposed/commit/d4a6ef073804068182a8796b58c47469503898a3))
* **core:** fp module utils ([#3068](https://github.com/lies-exposed/lies.exposed/issues/3068)) ([1937350](https://github.com/lies-exposed/lies.exposed/commit/19373509798471fb3303c05af721479f71fa023b))
* **core:** replaced deprecated tselint.config with defineConfig from eslint ([#2817](https://github.com/lies-exposed/lies.exposed/issues/2817)) ([0266861](https://github.com/lies-exposed/lies.exposed/commit/026686115f656ea842faea5924a29d1f486c8503))
* **deps:** bump typeorm from 0.3.27 to 0.3.28 ([#2937](https://github.com/lies-exposed/lies.exposed/issues/2937)) ([d4fb0d8](https://github.com/lies-exposed/lies.exposed/commit/d4fb0d80a1222e8c25942fac4e229b57bfa00576))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* errors refactor ([#3207](https://github.com/lies-exposed/lies.exposed/issues/3207)) ([ed74cee](https://github.com/lies-exposed/lies.exposed/commit/ed74ceea7c12764221f40d6f30f76c3a55e20373))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* moved queue implementation from fs to pg ([#3136](https://github.com/lies-exposed/lies.exposed/issues/3136)) ([5d9efc8](https://github.com/lies-exposed/lies.exposed/commit/5d9efc865751e6468b0e883a87005029f4e32802))
* refactor error logic ([#3129](https://github.com/lies-exposed/lies.exposed/issues/3129)) ([d04b8ff](https://github.com/lies-exposed/lies.exposed/commit/d04b8ffddb517d49feae3a22649e988bdc77658e))
* release  0.1.1 ([#2923](https://github.com/lies-exposed/lies.exposed/issues/2923)) ([a027e30](https://github.com/lies-exposed/lies.exposed/commit/a027e304508b1f02bad1db62d7471a8e0cd145ec))
* release  0.1.10 ([#3087](https://github.com/lies-exposed/lies.exposed/issues/3087)) ([533f416](https://github.com/lies-exposed/lies.exposed/commit/533f4165ee50af12d73fa1d6e36d43acd76957ee))
* release  0.1.11 ([#3110](https://github.com/lies-exposed/lies.exposed/issues/3110)) ([c90911d](https://github.com/lies-exposed/lies.exposed/commit/c90911d8a868e10c76b5c1204c3d9b6c89cd09fe))
* release  0.1.12 ([#3119](https://github.com/lies-exposed/lies.exposed/issues/3119)) ([f68b50a](https://github.com/lies-exposed/lies.exposed/commit/f68b50a33f518bdaf2cc1f0e6bbd3d610a1245a2))
* release  0.1.13 ([#3128](https://github.com/lies-exposed/lies.exposed/issues/3128)) ([12031de](https://github.com/lies-exposed/lies.exposed/commit/12031deda14ae5873eafbfddc46df96bf0f1f595))
* release  0.1.2 ([#2930](https://github.com/lies-exposed/lies.exposed/issues/2930)) ([c8bd7a9](https://github.com/lies-exposed/lies.exposed/commit/c8bd7a994c3f114807b00b8855a495e467dcf735))
* release  0.1.4 ([#2964](https://github.com/lies-exposed/lies.exposed/issues/2964)) ([f506ebf](https://github.com/lies-exposed/lies.exposed/commit/f506ebfaea62f600e83be963ae872efba9c14917))
* release  0.1.5 ([#2975](https://github.com/lies-exposed/lies.exposed/issues/2975)) ([e674ffb](https://github.com/lies-exposed/lies.exposed/commit/e674ffb193fb2d78ee1762433d371cbe87725879))
* release  0.1.6 ([#2989](https://github.com/lies-exposed/lies.exposed/issues/2989)) ([f3a692b](https://github.com/lies-exposed/lies.exposed/commit/f3a692bc267c1c4d168c9bc02df5c307679dc843))
* release  0.1.7 ([#2999](https://github.com/lies-exposed/lies.exposed/issues/2999)) ([7b73dce](https://github.com/lies-exposed/lies.exposed/commit/7b73dce7b5e5aa202d8d972019f4676249ed7d54))
* release  0.1.8 ([#3026](https://github.com/lies-exposed/lies.exposed/issues/3026)) ([857453b](https://github.com/lies-exposed/lies.exposed/commit/857453b8c1b3960513723ab18b729a590cfe9dd6))
* release  0.1.9 ([#3047](https://github.com/lies-exposed/lies.exposed/issues/3047)) ([afa22b6](https://github.com/lies-exposed/lies.exposed/commit/afa22b62a34af2fe0d36f44e4e97ebeb450b3224))
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* removed 'project' property from languageOptions.parserOptions in favor of 'projectService' ([be5db76](https://github.com/lies-exposed/lies.exposed/commit/be5db7664d703373013ca82b6dcbb849a088ddad))
* server logging of error details ([3eda9ba](https://github.com/lies-exposed/lies.exposed/commit/3eda9ba06e3bbb9f2b0f986383b1d610652464ff))
* set platform for api and worker docker services ([a094750](https://github.com/lies-exposed/lies.exposed/commit/a0947500358b5bbc4e7e4daf6311110f011ede4c))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))
* **shared:** refactor event helpers ([#3067](https://github.com/lies-exposed/lies.exposed/issues/3067)) ([d9c5980](https://github.com/lies-exposed/lies.exposed/commit/d9c5980b68af7ca62f95b09922041613ac1e1677))
* **shared:** remove Project resource from the codebase ([#3348](https://github.com/lies-exposed/lies.exposed/issues/3348)) ([d781ab3](https://github.com/lies-exposed/lies.exposed/commit/d781ab3d239fbb6ff899f17c78cda900788ec3ab))
* typeorm pglite transaction isolation for e2e tests ([#2995](https://github.com/lies-exposed/lies.exposed/issues/2995)) ([0d4b307](https://github.com/lies-exposed/lies.exposed/commit/0d4b307089f1cc11b7741b2d4b4b5e8325d69119))
* updated localai models and use GPU Intel v3 image ([#3196](https://github.com/lies-exposed/lies.exposed/issues/3196)) ([46a3dd6](https://github.com/lies-exposed/lies.exposed/commit/46a3dd686187c0f158436bf3fce971179b58dff8))
* **worker:** proper mocks initialization for e2e tests ([#2998](https://github.com/lies-exposed/lies.exposed/issues/2998)) ([4619599](https://github.com/lies-exposed/lies.exposed/commit/4619599251bb8eca66c3a35ad17d10e0f9c3d2a9))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
* **workspace:** bump supertest from 7.1.0 to 7.2.2 ([#3027](https://github.com/lies-exposed/lies.exposed/issues/3027)) ([7b7ece9](https://github.com/lies-exposed/lies.exposed/commit/7b7ece9e22aa502a13b44d2c3e5171803b32e0c1))
* **workspace:** bump the vite group across 8 directories with 2 updates ([#2894](https://github.com/lies-exposed/lies.exposed/issues/2894)) ([9b335af](https://github.com/lies-exposed/lies.exposed/commit/9b335afd53d543e8225464c7cb93d62986bb8b9b))
* **workspace:** disable type generation for services build ([#3224](https://github.com/lies-exposed/lies.exposed/issues/3224)) ([4dc573f](https://github.com/lies-exposed/lies.exposed/commit/4dc573f90a5963d2784ecfc460647ad260828194))
* **workspace:** disabled watch as default for running tests ([#2982](https://github.com/lies-exposed/lies.exposed/issues/2982)) ([abc2ea9](https://github.com/lies-exposed/lies.exposed/commit/abc2ea983764205742b91dfffaa5f404ad138e81))
* **workspace:** removed fs direct import in flows ([#3150](https://github.com/lies-exposed/lies.exposed/issues/3150)) ([0aa2bcf](https://github.com/lies-exposed/lies.exposed/commit/0aa2bcf479cbce4efe87912e93171b473166d84b))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.6.0
    * @liexp/core bumped to 0.6.0
    * @liexp/io bumped to 0.6.0
    * @liexp/shared bumped to 0.6.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.6.0
    * @liexp/test bumped to 0.6.0
</details>

<details><summary>lies.exposed: 0.6.0</summary>

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...lies.exposed@0.6.0) (2026-03-11)


### Features

* **admin:** implement frontend proxy integration (Phase 2) ([#2842](https://github.com/lies-exposed/lies.exposed/issues/2842)) ([1b9f2f7](https://github.com/lies-exposed/lies.exposed/commit/1b9f2f7271882863885e4ffb27b99c7e18f03252))
* **admin:** setup server ([#2840](https://github.com/lies-exposed/lies.exposed/issues/2840)) ([ea5d01d](https://github.com/lies-exposed/lies.exposed/commit/ea5d01d7b8d10423c2632dcb9611ad4f57bf70c5))
* **ai-bot:** use agent via http API ([#2809](https://github.com/lies-exposed/lies.exposed/issues/2809)) ([657ec21](https://github.com/lies-exposed/lies.exposed/commit/657ec218a45c861b06eb74a00310c4770ec435a3))
* **backend:** extract shared m2m auth infrastructure ([#2827](https://github.com/lies-exposed/lies.exposed/issues/2827)) ([72f2219](https://github.com/lies-exposed/lies.exposed/commit/72f2219ccdc64f81fc1797a446b7ce28edfdc05b))


### Bug Fixes

* added more tools to get resources by id and added e2e tests ([cbd1492](https://github.com/lies-exposed/lies.exposed/commit/cbd1492348d8dcd23c94abe81d636f7ee0d1371e))
* **admin:** dark theme palette ([#3222](https://github.com/lies-exposed/lies.exposed/issues/3222)) ([a000065](https://github.com/lies-exposed/lies.exposed/commit/a00006513826e557a5b2a81a0f67fb38cfbaf2a5))
* **admin:** fix ids[] array limit and excerpt empty string ([#3357](https://github.com/lies-exposed/lies.exposed/issues/3357)) ([4e5bb94](https://github.com/lies-exposed/lies.exposed/commit/4e5bb94a564fe173ae05cffe8da0496fc91063a9))
* **admin:** implement sorting for queue resources ([#3234](https://github.com/lies-exposed/lies.exposed/issues/3234)) ([9e2cb6b](https://github.com/lies-exposed/lies.exposed/commit/9e2cb6b264bf8afad3efef7bdc6ee38a25622429))
* advanced lazy-loading patterns for web bundle optimization ([#3235](https://github.com/lies-exposed/lies.exposed/issues/3235)) ([571c9b8](https://github.com/lies-exposed/lies.exposed/commit/571c9b8fca271601fa9e7d3c08f3c101a965a292))
* **agent:** cli events sub-command ([#3370](https://github.com/lies-exposed/lies.exposed/issues/3370)) ([c615dc8](https://github.com/lies-exposed/lies.exposed/commit/c615dc8dbcbfde9cb8671f1c763eceda01472bb2))
* **agent:** improve CLI error visibility and IOError formatting ([#3366](https://github.com/lies-exposed/lies.exposed/issues/3366)) ([98b0cf4](https://github.com/lies-exposed/lies.exposed/commit/98b0cf430403f39d80216edb78c913999f49a2a9))
* **agent:** multiprovider AI agent configuration ([#3206](https://github.com/lies-exposed/lies.exposed/issues/3206)) ([06920b4](https://github.com/lies-exposed/lies.exposed/commit/06920b4bf246b7c22f5c5acc9f9cd8b4909a1e13))
* **agent:** provide cli tools to access platform resources ([#3332](https://github.com/lies-exposed/lies.exposed/issues/3332)) ([6ba161f](https://github.com/lies-exposed/lies.exposed/commit/6ba161fcc9dc132fdedc9d3b81a8b3432325dfc6))
* **agent:** provide searchWebTools in agent service ([#3045](https://github.com/lies-exposed/lies.exposed/issues/3045)) ([1191a71](https://github.com/lies-exposed/lies.exposed/commit/1191a713da3eb66fa59f4ce275fc7f6e88a47693))
* **agent:** support Anthropic AI provider ([#3115](https://github.com/lies-exposed/lies.exposed/issues/3115)) ([2952200](https://github.com/lies-exposed/lies.exposed/commit/29522002dc161e57dbac13af0e9c317a839cb4c5))
* **ai-bot:** created custom strategy for effect-to-zod schema compatibility with NGrok ([#2824](https://github.com/lies-exposed/lies.exposed/issues/2824)) ([8b3a0bc](https://github.com/lies-exposed/lies.exposed/commit/8b3a0bcbd2902fb5b7552598281f344ccbe74600))
* **ai-bot:** remove loadDocs flow in favor of agent tools ([#3048](https://github.com/lies-exposed/lies.exposed/issues/3048)) ([144bb66](https://github.com/lies-exposed/lies.exposed/commit/144bb6671520d893e6f1975f995e589412f00838))
* **api:** actor and group avatar find tools ([#3213](https://github.com/lies-exposed/lies.exposed/issues/3213)) ([0f87695](https://github.com/lies-exposed/lies.exposed/commit/0f87695676d0beabbc2ed843e2515361b10155a2))
* **api:** added missing 'get by id' MCP tools with e2e tests ([3f8b844](https://github.com/lies-exposed/lies.exposed/commit/3f8b844f77271aa7dd297ca7f7a20c47087e89ce))
* **api:** allow query param array length up to 200 ([#3356](https://github.com/lies-exposed/lies.exposed/issues/3356)) ([7761de3](https://github.com/lies-exposed/lies.exposed/commit/7761de3337bc9beed72ee7e7e31dca3825742a54))
* **backend:** added brave provider for web searches ([#3044](https://github.com/lies-exposed/lies.exposed/issues/3044)) ([e1723b5](https://github.com/lies-exposed/lies.exposed/commit/e1723b5869cc4745cb885f0b3cab463863adc0f4))
* **backend:** fix SPA fallback route not matching root path in Express 5 ([#2974](https://github.com/lies-exposed/lies.exposed/issues/2974)) ([ce813ed](https://github.com/lies-exposed/lies.exposed/commit/ce813ed96b603325b85cbd1684796f4dc370aab9))
* **backend:** vite server helper catch-all path ([#2965](https://github.com/lies-exposed/lies.exposed/issues/2965)) ([20d2f06](https://github.com/lies-exposed/lies.exposed/commit/20d2f06410c4e38e36675b542707fc27416a9995))
* chat providers and prompts ([#3208](https://github.com/lies-exposed/lies.exposed/issues/3208)) ([db9dbde](https://github.com/lies-exposed/lies.exposed/commit/db9dbdee889a3de0f8a358cb42d3090a305de07b))
* **core:** fix dotenv v17 ESM resolution in Vite config bundler ([#3327](https://github.com/lies-exposed/lies.exposed/issues/3327)) ([84843e1](https://github.com/lies-exposed/lies.exposed/commit/84843e112e774248d294a2afd85704258bd39d51))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* io namespace imports ([#3216](https://github.com/lies-exposed/lies.exposed/issues/3216)) ([0efdfc6](https://github.com/lies-exposed/lies.exposed/commit/0efdfc67a6b43d34a874a3b6fda8169d10486948))
* mcp tools ([#3188](https://github.com/lies-exposed/lies.exposed/issues/3188)) ([3b9a8ce](https://github.com/lies-exposed/lies.exposed/commit/3b9a8ceefe7ee7510820d039a3fea4de29f58cbd))
* optimize ESLint cache to improve CI performance ([#3190](https://github.com/lies-exposed/lies.exposed/issues/3190)) ([fa2b3f7](https://github.com/lies-exposed/lies.exposed/commit/fa2b3f702d0b185e622992b1aa8855d409337f1e))
* **ui:** use react-hook-form hooks to keep TextWithSlugInput values in syn ([#2971](https://github.com/lies-exposed/lies.exposed/issues/2971)) ([88f3f2d](https://github.com/lies-exposed/lies.exposed/commit/88f3f2d4a06e8b3a5a13574ee8b3686486247df2))
* update CI workflows and dependabot config ([#2931](https://github.com/lies-exposed/lies.exposed/issues/2931)) ([0ad010e](https://github.com/lies-exposed/lies.exposed/commit/0ad010ed4cc6ae8a830d58879b5e9272bd093290))
* update README badges to match actual workflow names and fix broken link ([#3197](https://github.com/lies-exposed/lies.exposed/issues/3197)) ([1d73a79](https://github.com/lies-exposed/lies.exposed/commit/1d73a7902b873a5320eb055fa18c38cafcba5ec9))
* web request errors  stats, event payloads, pub/sub, and AI job result handling ([#3228](https://github.com/lies-exposed/lies.exposed/issues/3228)) ([f724796](https://github.com/lies-exposed/lies.exposed/commit/f7247962b33bdd04811fcf23863cbba3320e9caf))
* **web:** mobile layout refactor ([#3229](https://github.com/lies-exposed/lies.exposed/issues/3229)) ([1d5125f](https://github.com/lies-exposed/lies.exposed/commit/1d5125fb841c4b33f856c8d86b52066f991cc49c))
* **web:** route matching order ([#3226](https://github.com/lies-exposed/lies.exposed/issues/3226)) ([4521a0e](https://github.com/lies-exposed/lies.exposed/commit/4521a0e01f42de0c79909b3fd9a894e382f7d2c6))
* **worker:** increase worker pod memory limits for Puppeteer operations ([#3185](https://github.com/lies-exposed/lies.exposed/issues/3185)) ([a70f109](https://github.com/lies-exposed/lies.exposed/commit/a70f109782f2250e48961de3ba0487f8104f7f38))
* **worker:** wikipedia api ([#3187](https://github.com/lies-exposed/lies.exposed/issues/3187)) ([f463543](https://github.com/lies-exposed/lies.exposed/commit/f463543e9406640d8f04d8acdf17836068263872))
* **workspace:** expose current version info ([#3166](https://github.com/lies-exposed/lies.exposed/issues/3166)) ([a2230f7](https://github.com/lies-exposed/lies.exposed/commit/a2230f7c37f90f0ced8dc272ccb861cd749e08bf))
* **workspace:** include pnpm-lock.yaml in build-packages cache hash ([#3326](https://github.com/lies-exposed/lies.exposed/issues/3326)) ([c0c3cac](https://github.com/lies-exposed/lies.exposed/commit/c0c3caceb4e5e4fec3f9f1f1eebf8dae545f66ab))


### Miscellaneous

* add explicit knip entry points to fix false positives in git worktrees ([#3278](https://github.com/lies-exposed/lies.exposed/issues/3278)) ([73656c0](https://github.com/lies-exposed/lies.exposed/commit/73656c0b04d5ff0e00bf390cb227acb6c2c7bd67))
* add express-rate-limit to pnpm-lock.yaml ([a46db20](https://github.com/lies-exposed/lies.exposed/commit/a46db20862fd653f9fbe184ffc2c5fbde2b661c2))
* add release-please configuration ([#2918](https://github.com/lies-exposed/lies.exposed/issues/2918)) ([afdea2c](https://github.com/lies-exposed/lies.exposed/commit/afdea2cfd9e06fff05dfacdbe471312a60b56110))
* added 'actions: write' permission to release-please CI workflow ([#2927](https://github.com/lies-exposed/lies.exposed/issues/2927)) ([0f13154](https://github.com/lies-exposed/lies.exposed/commit/0f13154e031d8adf05ae18f54ed62670f867a895))
* added "release-as: 0.1.0" to release-please config ([#2899](https://github.com/lies-exposed/lies.exposed/issues/2899)) ([2a16257](https://github.com/lies-exposed/lies.exposed/commit/2a16257cd9a92460c45dd7b71be89e7748706d62))
* added CLAUDE.md ([6f2d43c](https://github.com/lies-exposed/lies.exposed/commit/6f2d43c232587d3a6538e78d5740e05e19de0d5e))
* added prompt to address review comments ([#2990](https://github.com/lies-exposed/lies.exposed/issues/2990)) ([bdeedef](https://github.com/lies-exposed/lies.exposed/commit/bdeedefa9aaed9ee2894ce24e23cda39697501ae))
* **admin:** added vitest configuration for e2e tests ([#2968](https://github.com/lies-exposed/lies.exposed/issues/2968)) ([6f6dd39](https://github.com/lies-exposed/lies.exposed/commit/6f6dd39b909dd637f501d3d8030deecd0fbc8dfd))
* **admin:** import useLocation from react-router ([8d74f31](https://github.com/lies-exposed/lies.exposed/commit/8d74f313ed3a5d997b4cf057893f4f055a51c61e))
* **admin:** kubernetes deploy configuration ([#2960](https://github.com/lies-exposed/lies.exposed/issues/2960)) ([3397b37](https://github.com/lies-exposed/lies.exposed/commit/3397b37c356e71d01d3173125b34365de1e7c2d3))
* **admin:** renamed service to 'admin' ([#3035](https://github.com/lies-exposed/lies.exposed/issues/3035)) ([b88833a](https://github.com/lies-exposed/lies.exposed/commit/b88833a6a915bd0d9e0da639b034642b614a01eb))
* **admin:** setup custom HMR port for server ([#3051](https://github.com/lies-exposed/lies.exposed/issues/3051)) ([99ef38c](https://github.com/lies-exposed/lies.exposed/commit/99ef38c1d3f8b299341ed2df4dc9197eda0ef4be))
* **agent:** added @langchain/xai dep ([a81eb88](https://github.com/lies-exposed/lies.exposed/commit/a81eb8894b1396c48d81d594fb64ad5ec6420920))
* **agent:** added e2e test for chat stream endpoint ([#3109](https://github.com/lies-exposed/lies.exposed/issues/3109)) ([ec1ea38](https://github.com/lies-exposed/lies.exposed/commit/ec1ea3807265b573f4677733bbdf0ebf022c9ba5))
* **agent:** expose service running on port 3003 to port 80 ([#2976](https://github.com/lies-exposed/lies.exposed/issues/2976)) ([7bed688](https://github.com/lies-exposed/lies.exposed/commit/7bed688fd7c75aee8d3cdc05d7c63c2f8166d771))
* **agent:** use [@ts-endpoint](https://github.com/ts-endpoint) stream endpoint definition ([#3112](https://github.com/lies-exposed/lies.exposed/issues/3112)) ([52c265d](https://github.com/lies-exposed/lies.exposed/commit/52c265d95ac581d7f61a17da19ed9cdf71833ae7))
* always deploy on push to release/alpha ([400fb8c](https://github.com/lies-exposed/lies.exposed/commit/400fb8cdbd56bef2735d4cc41cf92ff230a7a84d))
* **api:** removed puppeteer and puppeteer-extra deps and dead code ([#3149](https://github.com/lies-exposed/lies.exposed/issues/3149)) ([1a6ddab](https://github.com/lies-exposed/lies.exposed/commit/1a6ddabb6a28d42727b94954035f197b4f3646e5))
* **backend:** moved node SSR logic from @liexp/ui ([#2967](https://github.com/lies-exposed/lies.exposed/issues/2967)) ([a6ed9f0](https://github.com/lies-exposed/lies.exposed/commit/a6ed9f0579033fbf556e805ea1ed4dda46cef899))
* **backend:** vite server helper ([#2896](https://github.com/lies-exposed/lies.exposed/issues/2896)) ([cbcc76c](https://github.com/lies-exposed/lies.exposed/commit/cbcc76c180872dc59cde7f0410e9e325cfa48fae))
* bump [@blocknote](https://github.com/blocknote) group from 0.44.2 to 0.45.0 ([6bad161](https://github.com/lies-exposed/lies.exposed/commit/6bad161b71a5f50038dd91f73a22e969b6faca0f))
* bump eslint and related deps ([fe055a8](https://github.com/lies-exposed/lies.exposed/commit/fe055a8b704f8fc8511d7b22cc04751d8f8fc9a0))
* bump express to 5.2.1 ([d6d4c18](https://github.com/lies-exposed/lies.exposed/commit/d6d4c1885140e00846836e908f321ab9bb5f18e5))
* bump knip from 5.56.0 to 5.75.2 ([afc48eb](https://github.com/lies-exposed/lies.exposed/commit/afc48ebbd4ed9a40b99cab845625d95e184ff120))
* bump langchain from 1.0.6 to 1.2.1 ([3168ffa](https://github.com/lies-exposed/lies.exposed/commit/3168ffa932bd0c34707e693acf6b570ac1298e88))
* bump openai from 5.23.2 to 6.15.0 ([#2877](https://github.com/lies-exposed/lies.exposed/issues/2877)) ([8390c5c](https://github.com/lies-exposed/lies.exposed/commit/8390c5c41129eff37310d13a97442b44e355acfc))
* bump pnpm from 10.23.0 to 10.26.0 ([db8bdc6](https://github.com/lies-exposed/lies.exposed/commit/db8bdc69b1816dd2845fb54b004689db98d09064))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* bump pnpm to 10.23.0 ([d4a6ef0](https://github.com/lies-exposed/lies.exposed/commit/d4a6ef073804068182a8796b58c47469503898a3))
* bump storybook from 10.1.11 to 10.2.8 ([#3168](https://github.com/lies-exposed/lies.exposed/issues/3168)) ([8652d12](https://github.com/lies-exposed/lies.exposed/commit/8652d1219ce5877feb9a90bce51bdb2badc50620))
* copy @liexp/eslint-config in dev layers of docker images ([#3125](https://github.com/lies-exposed/lies.exposed/issues/3125)) ([4b0c0c4](https://github.com/lies-exposed/lies.exposed/commit/4b0c0c43e2fb1aa2e2b68448174542eb657eaca6))
* **core:** replaced deprecated tselint.config with defineConfig from eslint ([#2817](https://github.com/lies-exposed/lies.exposed/issues/2817)) ([0266861](https://github.com/lies-exposed/lies.exposed/commit/026686115f656ea842faea5924a29d1f486c8503))
* **core:** vite-tsconfig-paths peer dep to ^6 ([b61e015](https://github.com/lies-exposed/lies.exposed/commit/b61e015076fc9a3574c5928ef4377b52d529e2ac))
* define DOTENV_CONFIG_PATH for admin-web and web services to target .env.prod ([9bb33a9](https://github.com/lies-exposed/lies.exposed/commit/9bb33a91e5aa9ff158c279233aa488ac5404208d))
* defined 'Charlie' agent for Github ([8134333](https://github.com/lies-exposed/lies.exposed/commit/8134333b12f45b7fca3538fb3d5b6968adfcd4f7))
* deploy CI pipeline correct checks ([6a3a02f](https://github.com/lies-exposed/lies.exposed/commit/6a3a02f95d7ae7b433e0e89b771abda745db4005))
* deploy of admin-web service ([#2963](https://github.com/lies-exposed/lies.exposed/issues/2963)) ([956f071](https://github.com/lies-exposed/lies.exposed/commit/956f0713d15f65b3c2ab3ca9ec16eb1457c00900))
* deploy proper matrix checks ([8729cd6](https://github.com/lies-exposed/lies.exposed/commit/8729cd6128072b63e09176a234c4fdecb6e7d3e0))
* deploy web and admin-web with right env vars ([#2875](https://github.com/lies-exposed/lies.exposed/issues/2875)) ([8e924f1](https://github.com/lies-exposed/lies.exposed/commit/8e924f10644ffde9bad050473869f7c76299eb92))
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
* **deps:** consolidate dependabot config to single root directory ([#3247](https://github.com/lies-exposed/lies.exposed/issues/3247)) ([9da48a8](https://github.com/lies-exposed/lies.exposed/commit/9da48a8b3292185c26c6db94572160ffd8410908))
* **deps:** group @types/* updates into a single PR ([#3299](https://github.com/lies-exposed/lies.exposed/issues/3299)) ([3dc9f8f](https://github.com/lies-exposed/lies.exposed/commit/3dc9f8f52ee6c226a375bd287dd362871c1ba27e))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* docker compose healthchecks ([#2897](https://github.com/lies-exposed/lies.exposed/issues/2897)) ([9e0071e](https://github.com/lies-exposed/lies.exposed/commit/9e0071efed4dd5bce9d139b3e33b49d933d59b9b))
* **docs:** added comprehensive docs for packages and services ([#3122](https://github.com/lies-exposed/lies.exposed/issues/3122)) ([e7ea6fa](https://github.com/lies-exposed/lies.exposed/commit/e7ea6fa1786a14cd10b41f9da90c36a392836901))
* **docs:** git worktree dev notes ([#3227](https://github.com/lies-exposed/lies.exposed/issues/3227)) ([ee81a1c](https://github.com/lies-exposed/lies.exposed/commit/ee81a1c3b8543df323a98e72cae44798bea3629e))
* empty the manifest entries ([#2921](https://github.com/lies-exposed/lies.exposed/issues/2921)) ([25c6581](https://github.com/lies-exposed/lies.exposed/commit/25c658149a0762cbc013f3fb5380d0d200844985))
* errors refactor ([#3207](https://github.com/lies-exposed/lies.exposed/issues/3207)) ([ed74cee](https://github.com/lies-exposed/lies.exposed/commit/ed74ceea7c12764221f40d6f30f76c3a55e20373))
* ignore 'lib' and 'build' folders recursively to unload TS LSP server ([#3184](https://github.com/lies-exposed/lies.exposed/issues/3184)) ([f88b5d0](https://github.com/lies-exposed/lies.exposed/commit/f88b5d0b560a23fab8adc076f9de32e0c35ac89c))
* ignore @floating-ui/dom from knip report ([a24dd8c](https://github.com/lies-exposed/lies.exposed/commit/a24dd8c5dd8fa9e4264d35a910088b938106159a))
* ignore dependabot updates for node 25 types ([#3102](https://github.com/lies-exposed/lies.exposed/issues/3102)) ([1447d83](https://github.com/lies-exposed/lies.exposed/commit/1447d834c63bd33cca01e29284bafd2be4c9730e))
* include '.github/actions' directory in dependabot 'github-actions' ecosystem updates ([#2942](https://github.com/lies-exposed/lies.exposed/issues/2942)) ([6dc1d01](https://github.com/lies-exposed/lies.exposed/commit/6dc1d01449e7c9620eaa5c93de51042c3c58b650))
* include 'deps' and 'dev-deps' commit scope in workspace release changelog ([#3085](https://github.com/lies-exposed/lies.exposed/issues/3085)) ([f0485f2](https://github.com/lies-exposed/lies.exposed/commit/f0485f2656fa258687f5d11945c397b1a6990641))
* include 'worker' component in tag ([#2924](https://github.com/lies-exposed/lies.exposed/issues/2924)) ([8908374](https://github.com/lies-exposed/lies.exposed/commit/8908374073bcccce67ed1aad98b3005127166845))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* make dependabot target main branch ([#2891](https://github.com/lies-exposed/lies.exposed/issues/2891)) ([bfd0f43](https://github.com/lies-exposed/lies.exposed/commit/bfd0f43460df4d96f2ed8d313f104fc79b87a1c5))
* MCP configurations for VSCode and Claude ([#2887](https://github.com/lies-exposed/lies.exposed/issues/2887)) ([7647b17](https://github.com/lies-exposed/lies.exposed/commit/7647b171dd08e33da60990eb14c65a68fb7f8d84))
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
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* release please configuration for 0.1.1 ([#2922](https://github.com/lies-exposed/lies.exposed/issues/2922)) ([af5e724](https://github.com/lies-exposed/lies.exposed/commit/af5e724523e16c568186a4319eead49b294800e7))
* release-please unique tag ([#3151](https://github.com/lies-exposed/lies.exposed/issues/3151)) ([d2b852c](https://github.com/lies-exposed/lies.exposed/commit/d2b852c8ac126d96ccfccf59bef571c24c8cfb6c))
* removed 'actions: write' permission to release-please CI workflow ([#2958](https://github.com/lies-exposed/lies.exposed/issues/2958)) ([b257f80](https://github.com/lies-exposed/lies.exposed/commit/b257f800562bd8798a7f7713e200dd00ba38b889))
* removed path patterns for running pull-request workflow ([#3023](https://github.com/lies-exposed/lies.exposed/issues/3023)) ([ab0c64c](https://github.com/lies-exposed/lies.exposed/commit/ab0c64c3001b71dd0b41d3fe34aaa4a3cac4140c))
* removed release-please configuration ([#2906](https://github.com/lies-exposed/lies.exposed/issues/2906)) ([3f70528](https://github.com/lies-exposed/lies.exposed/commit/3f705288068adba314651366e25ffdb47b70afad))
* renamed 'release/alpha' occurrences with 'main' ([dd01b6b](https://github.com/lies-exposed/lies.exposed/commit/dd01b6be5ae8e08113e73612dd4e2f232b41deb1))
* renamed AGENT.md to AGENTS.md ([67f0294](https://github.com/lies-exposed/lies.exposed/commit/67f02943db8389ca7b5353eecdd492da236acc97))
* renamed cloudflared tunnel name to 'lies-exposed-tunnel' ([#3155](https://github.com/lies-exposed/lies.exposed/issues/3155)) ([f9d5f8a](https://github.com/lies-exposed/lies.exposed/commit/f9d5f8a19826273a91b943efd627d0b2ed89a817))
* reuse docker-build-push action for deploy CI workflow ([c7ecfc8](https://github.com/lies-exposed/lies.exposed/commit/c7ecfc88230430c427d346212c54b81ad79a85aa))
* set initial-version for release-please to 0.1.0 ([#2919](https://github.com/lies-exposed/lies.exposed/issues/2919)) ([cc8ad2f](https://github.com/lies-exposed/lies.exposed/commit/cc8ad2f1223b7b385daca3bef44acfcbf22ac212))
* set platform for api and worker docker services ([a094750](https://github.com/lies-exposed/lies.exposed/commit/a0947500358b5bbc4e7e4daf6311110f011ede4c))
* set proper env for admin-web and web deploy steps ([19bf879](https://github.com/lies-exposed/lies.exposed/commit/19bf879a52424ed5841bef693aacaabd86d63412))
* setup release-please for automated releases                                                                                                  ([#2886](https://github.com/lies-exposed/lies.exposed/issues/2886)) ([af6cdce](https://github.com/lies-exposed/lies.exposed/commit/af6cdce7f07481c139c59c03c6c872da74b096a7))
* **shared:** added unit tests for helpers and utils ([#3090](https://github.com/lies-exposed/lies.exposed/issues/3090)) ([f1a6f7a](https://github.com/lies-exposed/lies.exposed/commit/f1a6f7aad7c86906d293a4f9ee6d7e92bc1d71d9))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))
* skip github release, set release-please-manifest entries and relative CHANGELOG.md ([#2903](https://github.com/lies-exposed/lies.exposed/issues/2903)) ([4a82771](https://github.com/lies-exposed/lies.exposed/commit/4a82771aef21d7f4fe685c7d383ecc7fdab6c09c))
* solve knip report errors ([4fdf617](https://github.com/lies-exposed/lies.exposed/commit/4fdf617fbe7d464c64a104f38013a4d768e71f39))
* split initial docs into sub documents and sub sections ([#3130](https://github.com/lies-exposed/lies.exposed/issues/3130)) ([1609fc7](https://github.com/lies-exposed/lies.exposed/commit/1609fc728dd60cb72690d4151c12ce73b6085507))
* **storybook:** bump eslint-plugin-storybook from 9 to 10 ([03199f2](https://github.com/lies-exposed/lies.exposed/commit/03199f252ef2507e8b44f501aca3dfbfbf380dc5))
* **storybook:** bump the storybook group from 10.1.10 to 10.1.11 ([#2912](https://github.com/lies-exposed/lies.exposed/issues/2912)) ([b9286ae](https://github.com/lies-exposed/lies.exposed/commit/b9286aefa5ac3039bfe9155a4fb9176a6d7e9f77))
* **storybook:** keep track of .env.prod ([#3137](https://github.com/lies-exposed/lies.exposed/issues/3137)) ([05fc3d6](https://github.com/lies-exposed/lies.exposed/commit/05fc3d6ea7e257a874644dff1ce8484bc535a6a5))
* **storybook:** sync build output on minio and serve via nginx ([#3131](https://github.com/lies-exposed/lies.exposed/issues/3131)) ([194ccda](https://github.com/lies-exposed/lies.exposed/commit/194ccda0f8f2d7d3408f9d1cdb46ced05babb98f))
* trigger CI for pull request only for main branch ([#2890](https://github.com/lies-exposed/lies.exposed/issues/2890)) ([f370020](https://github.com/lies-exposed/lies.exposed/commit/f370020282969b2c5ea950dc37c1ca831ea592ec))
* typeorm pglite transaction isolation for e2e tests ([#2995](https://github.com/lies-exposed/lies.exposed/issues/2995)) ([0d4b307](https://github.com/lies-exposed/lies.exposed/commit/0d4b307089f1cc11b7741b2d4b4b5e8325d69119))
* **ui:** bump @fortawesome/react-fontawesome from 0.2.2 to 3.1.1 ([#2863](https://github.com/lies-exposed/lies.exposed/issues/2863)) ([4303124](https://github.com/lies-exposed/lies.exposed/commit/43031243f4710563c2f7278be1e6caad6075c6f8))
* update release-please config for v0.1.0 releases ([#2898](https://github.com/lies-exposed/lies.exposed/issues/2898)) ([cd0acf9](https://github.com/lies-exposed/lies.exposed/commit/cd0acf915dab59cb25a40e7857223faca138c2fe))
* updated localai models and use GPU Intel v3 image ([#3196](https://github.com/lies-exposed/lies.exposed/issues/3196)) ([46a3dd6](https://github.com/lies-exposed/lies.exposed/commit/46a3dd686187c0f158436bf3fce971179b58dff8))
* use changelog-type default for bootstrap ([#2920](https://github.com/lies-exposed/lies.exposed/issues/2920)) ([3e761cb](https://github.com/lies-exposed/lies.exposed/commit/3e761cbb6384501ceae5336916fed3ab59158edb))
* use localai cpu for local development ([#3333](https://github.com/lies-exposed/lies.exposed/issues/3333)) ([20cbba1](https://github.com/lies-exposed/lies.exposed/commit/20cbba1a0ddcfdad40692f3a9f7855b54bc0cbfb))
* **web:** added vitest configuration for e2e tests ([#2969](https://github.com/lies-exposed/lies.exposed/issues/2969)) ([01a18be](https://github.com/lies-exposed/lies.exposed/commit/01a18bead95bb71e842ccbd57441987f2934e295))
* **web:** include @liexp/backend from dev stage ([#2902](https://github.com/lies-exposed/lies.exposed/issues/2902)) ([06215af](https://github.com/lies-exposed/lies.exposed/commit/06215afe8b44e989e4f3c2d34805f67f8a55f638))
* **web:** removed unused files ([#3049](https://github.com/lies-exposed/lies.exposed/issues/3049)) ([591a382](https://github.com/lies-exposed/lies.exposed/commit/591a382ff290dc71b790d471f5c56d1b22231866))
* **worker:** proper mocks initialization for e2e tests ([#2998](https://github.com/lies-exposed/lies.exposed/issues/2998)) ([4619599](https://github.com/lies-exposed/lies.exposed/commit/4619599251bb8eca66c3a35ad17d10e0f9c3d2a9))
* **workspace:** added agent instruction to connect to prod cluster with kubectl ([#3000](https://github.com/lies-exposed/lies.exposed/issues/3000)) ([550c9b7](https://github.com/lies-exposed/lies.exposed/commit/550c9b772c545677ae48c2ac1de15a281bf98fae))
* **workspace:** added design system definition and documentation ([#3220](https://github.com/lies-exposed/lies.exposed/issues/3220)) ([0399f5c](https://github.com/lies-exposed/lies.exposed/commit/0399f5ce1961a6e944a140eedff05f69dd165524))
* **workspace:** added pg and playwright MCP server configurations ([#2977](https://github.com/lies-exposed/lies.exposed/issues/2977)) ([bcfc088](https://github.com/lies-exposed/lies.exposed/commit/bcfc088252c710967199673566f88f23c12a6263))
* **workspace:** added script to lint only changed file ([#3054](https://github.com/lies-exposed/lies.exposed/issues/3054)) ([ae6c2b3](https://github.com/lies-exposed/lies.exposed/commit/ae6c2b3696f11a51a1dc88a712eeefa9800fd763))
* **workspace:** address knip config hints ([#3321](https://github.com/lies-exposed/lies.exposed/issues/3321)) ([d3840f4](https://github.com/lies-exposed/lies.exposed/commit/d3840f4b791809ee3beedc48a9316295a466f6ce))
* **workspace:** always update root tag with release-please ([#2992](https://github.com/lies-exposed/lies.exposed/issues/2992)) ([b849a58](https://github.com/lies-exposed/lies.exposed/commit/b849a58eaa9a7ccda1cfa2c7466d98f9d164bbfd))
* **workspace:** avoid commenting the addressed comments in PR ([#3018](https://github.com/lies-exposed/lies.exposed/issues/3018)) ([5f828af](https://github.com/lies-exposed/lies.exposed/commit/5f828afdb4af793bd62081acc4df0715c462a6d2))
* **workspace:** bind nginx reverproxy port 443 for local development ([#3273](https://github.com/lies-exposed/lies.exposed/issues/3273)) ([5a25103](https://github.com/lies-exposed/lies.exposed/commit/5a25103ad23751c7ac5c023138b5f0f7e0ff837c))
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
* **workspace:** knip issues with vitest configs ([#3183](https://github.com/lies-exposed/lies.exposed/issues/3183)) ([01180b8](https://github.com/lies-exposed/lies.exposed/commit/01180b83ada8d50165fce59869fcef49a632aa48))
* **workspace:** local https certificate ([#3219](https://github.com/lies-exposed/lies.exposed/issues/3219)) ([b7b597a](https://github.com/lies-exposed/lies.exposed/commit/b7b597ab4fbde0d977e9d1674be78364539d9b0e))
* **workspace:** only lint and build changed packages on pre-push ([#2993](https://github.com/lies-exposed/lies.exposed/issues/2993)) ([6702c26](https://github.com/lies-exposed/lies.exposed/commit/6702c264806f60b79b52454ad9a0b1bee9261c08))
* **workspace:** pnpm overrides for zod@^4 ([#3042](https://github.com/lies-exposed/lies.exposed/issues/3042)) ([334ef1d](https://github.com/lies-exposed/lies.exposed/commit/334ef1d9ab455ba643a561e39daed4f1a8eda60e))
* **workspace:** reduced k8s services resources ([#3126](https://github.com/lies-exposed/lies.exposed/issues/3126)) ([68fe9d7](https://github.com/lies-exposed/lies.exposed/commit/68fe9d706263710e5713538f5d03d676312293ab))
* **workspace:** renamed storybook package to @liexp/storybook ([#2925](https://github.com/lies-exposed/lies.exposed/issues/2925)) ([0143865](https://github.com/lies-exposed/lies.exposed/commit/014386568140ef6c362f289936e036de07fe077c))
* **workspace:** run knip-report CI job when packages@liexp/* or services/* have detected changes ([#3004](https://github.com/lies-exposed/lies.exposed/issues/3004)) ([0020ca3](https://github.com/lies-exposed/lies.exposed/commit/0020ca3b62e27140c1f33379ea6889295ac7a2b4))
* **workspace:** set correct component selector for db-dump and db-prune jobs ([#3132](https://github.com/lies-exposed/lies.exposed/issues/3132)) ([029d461](https://github.com/lies-exposed/lies.exposed/commit/029d46113660a533e0bc922ae83ca993fe396de6))
* **workspace:** set kubernetes revisionHistoryLimit to 3 for service deployments ([#3239](https://github.com/lies-exposed/lies.exposed/issues/3239)) ([15baada](https://github.com/lies-exposed/lies.exposed/commit/15baada330ffaeaf9cf453d715c6993a056d6cf8))
* **workspace:** setup linked-versions plugin for release-please ([#3113](https://github.com/lies-exposed/lies.exposed/issues/3113)) ([51ab56f](https://github.com/lies-exposed/lies.exposed/commit/51ab56f2ebaaaefe351019d26021ccee1a004b81))
* **workspace:** support only current architecture with pnpm ([#3028](https://github.com/lies-exposed/lies.exposed/issues/3028)) ([ea983bc](https://github.com/lies-exposed/lies.exposed/commit/ea983bc5e2a50a008117b3c46ed1eb25b37fe62b))
* **workspace:** updated copilot instructions ([#2929](https://github.com/lies-exposed/lies.exposed/issues/2929)) ([f22cf1a](https://github.com/lies-exposed/lies.exposed/commit/f22cf1af661d536134cb9ec27737eb8bbefd53eb))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))
</details>

<details><summary>web: 0.6.0</summary>

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...web@0.6.0) (2026-03-11)


### Features

* **admin:** implement frontend proxy integration (Phase 2) ([#2842](https://github.com/lies-exposed/lies.exposed/issues/2842)) ([1b9f2f7](https://github.com/lies-exposed/lies.exposed/commit/1b9f2f7271882863885e4ffb27b99c7e18f03252))


### Bug Fixes

* advanced lazy-loading patterns for web bundle optimization ([#3235](https://github.com/lies-exposed/lies.exposed/issues/3235)) ([571c9b8](https://github.com/lies-exposed/lies.exposed/commit/571c9b8fca271601fa9e7d3c08f3c101a965a292))
* **backend:** vite server helper catch-all path ([#2965](https://github.com/lies-exposed/lies.exposed/issues/2965)) ([20d2f06](https://github.com/lies-exposed/lies.exposed/commit/20d2f06410c4e38e36675b542707fc27416a9995))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* **shared:** renamed Endpoints for agent to AgentEndpoints ([#3063](https://github.com/lies-exposed/lies.exposed/issues/3063)) ([5366305](https://github.com/lies-exposed/lies.exposed/commit/53663056c564a92b4ca01805f61edd849b000a26))
* **ui:** global search command palette (Ctrl+K) ([#3324](https://github.com/lies-exposed/lies.exposed/issues/3324)) ([24ab24a](https://github.com/lies-exposed/lies.exposed/commit/24ab24a9628bcd258784a08381e0bbab7473465e))
* **web:** improve media page layout and home page media grid ([#3325](https://github.com/lies-exposed/lies.exposed/issues/3325)) ([52b440d](https://github.com/lies-exposed/lies.exposed/commit/52b440d303e60591cb2ddb1c14c9c8f936a40e03))
* **web:** mobile layout responsiveness ([#3221](https://github.com/lies-exposed/lies.exposed/issues/3221)) ([55bbb04](https://github.com/lies-exposed/lies.exposed/commit/55bbb046a4e5ee397516c6c324233d504ed16655))
* **web:** mobile responsiveness ([#3231](https://github.com/lies-exposed/lies.exposed/issues/3231)) ([df71064](https://github.com/lies-exposed/lies.exposed/commit/df710640c2322f69dc2620161dae7eb43bad37ea))
* **web:** path for /profile/* compatible with both web and SSR routing ([#3100](https://github.com/lies-exposed/lies.exposed/issues/3100)) ([3972ba7](https://github.com/lies-exposed/lies.exposed/commit/3972ba71c5fcd3843f698568083efec3cc294b81))
* **web:** route matching order ([#3226](https://github.com/lies-exposed/lies.exposed/issues/3226)) ([4521a0e](https://github.com/lies-exposed/lies.exposed/commit/4521a0e01f42de0c79909b3fd9a894e382f7d2c6))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))
* **workspace:** expose current version info ([#3166](https://github.com/lies-exposed/lies.exposed/issues/3166)) ([a2230f7](https://github.com/lies-exposed/lies.exposed/commit/a2230f7c37f90f0ced8dc272ccb861cd749e08bf))


### Miscellaneous

* **admin:** added vitest configuration for e2e tests ([#2968](https://github.com/lies-exposed/lies.exposed/issues/2968)) ([6f6dd39](https://github.com/lies-exposed/lies.exposed/commit/6f6dd39b909dd637f501d3d8030deecd0fbc8dfd))
* **api:** solved typecheck errors in test files ([#2991](https://github.com/lies-exposed/lies.exposed/issues/2991)) ([1bbc8e2](https://github.com/lies-exposed/lies.exposed/commit/1bbc8e2bc031d857eec2c13b340c9a4ce9493116))
* **backend:** moved node SSR logic from @liexp/ui ([#2967](https://github.com/lies-exposed/lies.exposed/issues/2967)) ([a6ed9f0](https://github.com/lies-exposed/lies.exposed/commit/a6ed9f0579033fbf556e805ea1ed4dda46cef899))
* **backend:** vite server helper ([#2896](https://github.com/lies-exposed/lies.exposed/issues/2896)) ([cbcc76c](https://github.com/lies-exposed/lies.exposed/commit/cbcc76c180872dc59cde7f0410e9e325cfa48fae))
* bump eslint and related deps ([fe055a8](https://github.com/lies-exposed/lies.exposed/commit/fe055a8b704f8fc8511d7b22cc04751d8f8fc9a0))
* bump express to 5.2.1 ([d6d4c18](https://github.com/lies-exposed/lies.exposed/commit/d6d4c1885140e00846836e908f321ab9bb5f18e5))
* bump pnpm from 10.23.0 to 10.26.0 ([db8bdc6](https://github.com/lies-exposed/lies.exposed/commit/db8bdc69b1816dd2845fb54b004689db98d09064))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* bump pnpm to 10.23.0 ([d4a6ef0](https://github.com/lies-exposed/lies.exposed/commit/d4a6ef073804068182a8796b58c47469503898a3))
* **core:** fp module utils ([#3068](https://github.com/lies-exposed/lies.exposed/issues/3068)) ([1937350](https://github.com/lies-exposed/lies.exposed/commit/19373509798471fb3303c05af721479f71fa023b))
* **core:** replaced deprecated tselint.config with defineConfig from eslint ([#2817](https://github.com/lies-exposed/lies.exposed/issues/2817)) ([0266861](https://github.com/lies-exposed/lies.exposed/commit/026686115f656ea842faea5924a29d1f486c8503))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
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
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* removed 'project' property from languageOptions.parserOptions in favor of 'projectService' ([be5db76](https://github.com/lies-exposed/lies.exposed/commit/be5db7664d703373013ca82b6dcbb849a088ddad))
* replace "as any" with proper types in admin-web and web services ([#2926](https://github.com/lies-exposed/lies.exposed/issues/2926)) ([b3ae331](https://github.com/lies-exposed/lies.exposed/commit/b3ae331cc1880d98901ae8a26bcf51b9bbbae7f9))
* **web:** added vitest configuration for e2e tests ([#2969](https://github.com/lies-exposed/lies.exposed/issues/2969)) ([01a18be](https://github.com/lies-exposed/lies.exposed/commit/01a18bead95bb71e842ccbd57441987f2934e295))
* **web:** import I18nProvider type from @liexp/ui/lib/components/admin/react-admin.js ([#2928](https://github.com/lies-exposed/lies.exposed/issues/2928)) ([3b423c4](https://github.com/lies-exposed/lies.exposed/commit/3b423c4c0e80fd2346dd8cffaaa9a92898ada92b))
* **web:** removed unused files ([#3049](https://github.com/lies-exposed/lies.exposed/issues/3049)) ([591a382](https://github.com/lies-exposed/lies.exposed/commit/591a382ff290dc71b790d471f5c56d1b22231866))
* **web:** vitest configuration with projects ([#2970](https://github.com/lies-exposed/lies.exposed/issues/2970)) ([d46af4b](https://github.com/lies-exposed/lies.exposed/commit/d46af4b613e2a55740648135261c02fea480f864))
* **workspace:** added design system definition and documentation ([#3220](https://github.com/lies-exposed/lies.exposed/issues/3220)) ([0399f5c](https://github.com/lies-exposed/lies.exposed/commit/0399f5ce1961a6e944a140eedff05f69dd165524))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
* **workspace:** bump supertest from 7.1.0 to 7.2.2 ([#3027](https://github.com/lies-exposed/lies.exposed/issues/3027)) ([7b7ece9](https://github.com/lies-exposed/lies.exposed/commit/7b7ece9e22aa502a13b44d2c3e5171803b32e0c1))
* **workspace:** bump the vite group across 8 directories with 2 updates ([#2894](https://github.com/lies-exposed/lies.exposed/issues/2894)) ([9b335af](https://github.com/lies-exposed/lies.exposed/commit/9b335afd53d543e8225464c7cb93d62986bb8b9b))
* **workspace:** disable type generation for services build ([#3224](https://github.com/lies-exposed/lies.exposed/issues/3224)) ([4dc573f](https://github.com/lies-exposed/lies.exposed/commit/4dc573f90a5963d2784ecfc460647ad260828194))
* **workspace:** disabled watch as default for running tests ([#2982](https://github.com/lies-exposed/lies.exposed/issues/2982)) ([abc2ea9](https://github.com/lies-exposed/lies.exposed/commit/abc2ea983764205742b91dfffaa5f404ad138e81))
* **workspace:** enable PWA installation for web and admin services ([#3200](https://github.com/lies-exposed/lies.exposed/issues/3200)) ([830cb5e](https://github.com/lies-exposed/lies.exposed/commit/830cb5e31865964a937f1a632e5250e9c64796e2))
* **workspace:** knip issues with vitest configs ([#3183](https://github.com/lies-exposed/lies.exposed/issues/3183)) ([01180b8](https://github.com/lies-exposed/lies.exposed/commit/01180b83ada8d50165fce59869fcef49a632aa48))
* **workspace:** local https certificate ([#3219](https://github.com/lies-exposed/lies.exposed/issues/3219)) ([b7b597a](https://github.com/lies-exposed/lies.exposed/commit/b7b597ab4fbde0d977e9d1674be78364539d9b0e))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.6.0
    * @liexp/core bumped to 0.6.0
    * @liexp/io bumped to 0.6.0
    * @liexp/shared bumped to 0.6.0
    * @liexp/ui bumped to 0.6.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.6.0
    * @liexp/test bumped to 0.6.0
</details>

<details><summary>worker: 0.6.0</summary>

## [0.6.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.6...worker@0.6.0) (2026-03-11)


### Features

* **agent:** streamable chat endpoint ([#2845](https://github.com/lies-exposed/lies.exposed/issues/2845)) ([c7376ca](https://github.com/lies-exposed/lies.exposed/commit/c7376caab780cd66d3e7116471fbd6dd7fb2484a))
* **ai-bot:** extract thumbnailUrl from link metadata and create media on job completion ([#3245](https://github.com/lies-exposed/lies.exposed/issues/3245)) ([fe15601](https://github.com/lies-exposed/lies.exposed/commit/fe15601b9909fbf9e9f069f6ff59ba7679263e8e))
* create actor relation ([#3167](https://github.com/lies-exposed/lies.exposed/issues/3167)) ([f251e56](https://github.com/lies-exposed/lies.exposed/commit/f251e56a8b360dae003b88601f5bbe03cdf4216e))


### Bug Fixes

* **ai-bot:** flow to update multiple entities from a link ([#3214](https://github.com/lies-exposed/lies.exposed/issues/3214)) ([d36a398](https://github.com/lies-exposed/lies.exposed/commit/d36a3987a390da3e6c482e6f64bcb5f9025440e8))
* **backend:** added status to LinkEntity ([#3156](https://github.com/lies-exposed/lies.exposed/issues/3156)) ([71980bf](https://github.com/lies-exposed/lies.exposed/commit/71980bf2e401423c85cb1722e8cff338792b1864))
* **backend:** handle space TLS connection via env variable ([#2986](https://github.com/lies-exposed/lies.exposed/issues/2986)) ([ccfa27e](https://github.com/lies-exposed/lies.exposed/commit/ccfa27ed47281a7d7975c0d0506d342f3ba2468b))
* **core:** fix dotenv v17 ESM resolution in Vite config bundler ([#3327](https://github.com/lies-exposed/lies.exposed/issues/3327)) ([84843e1](https://github.com/lies-exposed/lies.exposed/commit/84843e112e774248d294a2afd85704258bd39d51))
* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))
* io namespace imports ([#3216](https://github.com/lies-exposed/lies.exposed/issues/3216)) ([0efdfc6](https://github.com/lies-exposed/lies.exposed/commit/0efdfc67a6b43d34a874a3b6fda8169d10486948))
* web request errors  stats, event payloads, pub/sub, and AI job result handling ([#3228](https://github.com/lies-exposed/lies.exposed/issues/3228)) ([f724796](https://github.com/lies-exposed/lies.exposed/commit/f7247962b33bdd04811fcf23863cbba3320e9caf))
* **worker:** add backfill-link-publish-dates command ([#3317](https://github.com/lies-exposed/lies.exposed/issues/3317)) ([e33e26d](https://github.com/lies-exposed/lies.exposed/commit/e33e26d17560e2b544811822a0a540328a97f138))
* **worker:** remove premature UpdateEntitiesFromURL pub/sub and let ai-bot scheduler handle the job ([#3279](https://github.com/lies-exposed/lies.exposed/issues/3279)) ([508e19d](https://github.com/lies-exposed/lies.exposed/commit/508e19dbc35a5cc5c17d870750af44b4571d1c8b))
* **worker:** save links even on screenshot failure and always reply to user ([#3232](https://github.com/lies-exposed/lies.exposed/issues/3232)) ([c07a0d3](https://github.com/lies-exposed/lies.exposed/commit/c07a0d392273a1dd0bdf11ff2ad5b65da46b815d))
* **worker:** wikipedia api ([#3187](https://github.com/lies-exposed/lies.exposed/issues/3187)) ([f463543](https://github.com/lies-exposed/lies.exposed/commit/f463543e9406640d8f04d8acdf17836068263872))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))


### Miscellaneous

* **admin:** renamed service to 'admin' ([#3035](https://github.com/lies-exposed/lies.exposed/issues/3035)) ([b88833a](https://github.com/lies-exposed/lies.exposed/commit/b88833a6a915bd0d9e0da639b034642b614a01eb))
* **api:** removed puppeteer and puppeteer-extra deps and dead code ([#3149](https://github.com/lies-exposed/lies.exposed/issues/3149)) ([1a6ddab](https://github.com/lies-exposed/lies.exposed/commit/1a6ddabb6a28d42727b94954035f197b4f3646e5))
* bump eslint and related deps ([fe055a8](https://github.com/lies-exposed/lies.exposed/commit/fe055a8b704f8fc8511d7b22cc04751d8f8fc9a0))
* bump pnpm from 10.23.0 to 10.26.0 ([db8bdc6](https://github.com/lies-exposed/lies.exposed/commit/db8bdc69b1816dd2845fb54b004689db98d09064))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* bump pnpm to 10.23.0 ([d4a6ef0](https://github.com/lies-exposed/lies.exposed/commit/d4a6ef073804068182a8796b58c47469503898a3))
* **deps-dev:** bump @types/lodash from 4.17.20 to 4.17.21 ([#2939](https://github.com/lies-exposed/lies.exposed/issues/2939)) ([d027f03](https://github.com/lies-exposed/lies.exposed/commit/d027f033cf9a7c631e1434a23851d3cdc99dd3a4))
* **deps:** bump pdfjs-dist from 5.4.149 to 5.4.530 ([#2941](https://github.com/lies-exposed/lies.exposed/issues/2941)) ([3b64984](https://github.com/lies-exposed/lies.exposed/commit/3b64984ce77017e64481035ce98ef3411980cbc7))
* **deps:** bump typeorm from 0.3.27 to 0.3.28 ([#2937](https://github.com/lies-exposed/lies.exposed/issues/2937)) ([d4fb0d8](https://github.com/lies-exposed/lies.exposed/commit/d4fb0d80a1222e8c25942fac4e229b57bfa00576))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))
* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))
* moved queue implementation from fs to pg ([#3136](https://github.com/lies-exposed/lies.exposed/issues/3136)) ([5d9efc8](https://github.com/lies-exposed/lies.exposed/commit/5d9efc865751e6468b0e883a87005029f4e32802))
* refactor error logic ([#3129](https://github.com/lies-exposed/lies.exposed/issues/3129)) ([d04b8ff](https://github.com/lies-exposed/lies.exposed/commit/d04b8ffddb517d49feae3a22649e988bdc77658e))
* release  0.1.1 ([#2923](https://github.com/lies-exposed/lies.exposed/issues/2923)) ([a027e30](https://github.com/lies-exposed/lies.exposed/commit/a027e304508b1f02bad1db62d7471a8e0cd145ec))
* release  0.1.10 ([#3087](https://github.com/lies-exposed/lies.exposed/issues/3087)) ([533f416](https://github.com/lies-exposed/lies.exposed/commit/533f4165ee50af12d73fa1d6e36d43acd76957ee))
* release  0.1.11 ([#3110](https://github.com/lies-exposed/lies.exposed/issues/3110)) ([c90911d](https://github.com/lies-exposed/lies.exposed/commit/c90911d8a868e10c76b5c1204c3d9b6c89cd09fe))
* release  0.1.12 ([#3119](https://github.com/lies-exposed/lies.exposed/issues/3119)) ([f68b50a](https://github.com/lies-exposed/lies.exposed/commit/f68b50a33f518bdaf2cc1f0e6bbd3d610a1245a2))
* release  0.1.13 ([#3128](https://github.com/lies-exposed/lies.exposed/issues/3128)) ([12031de](https://github.com/lies-exposed/lies.exposed/commit/12031deda14ae5873eafbfddc46df96bf0f1f595))
* release  0.1.2 ([#2930](https://github.com/lies-exposed/lies.exposed/issues/2930)) ([c8bd7a9](https://github.com/lies-exposed/lies.exposed/commit/c8bd7a994c3f114807b00b8855a495e467dcf735))
* release  0.1.4 ([#2964](https://github.com/lies-exposed/lies.exposed/issues/2964)) ([f506ebf](https://github.com/lies-exposed/lies.exposed/commit/f506ebfaea62f600e83be963ae872efba9c14917))
* release  0.1.5 ([#2975](https://github.com/lies-exposed/lies.exposed/issues/2975)) ([e674ffb](https://github.com/lies-exposed/lies.exposed/commit/e674ffb193fb2d78ee1762433d371cbe87725879))
* release  0.1.6 ([#2989](https://github.com/lies-exposed/lies.exposed/issues/2989)) ([f3a692b](https://github.com/lies-exposed/lies.exposed/commit/f3a692bc267c1c4d168c9bc02df5c307679dc843))
* release  0.1.7 ([#2999](https://github.com/lies-exposed/lies.exposed/issues/2999)) ([7b73dce](https://github.com/lies-exposed/lies.exposed/commit/7b73dce7b5e5aa202d8d972019f4676249ed7d54))
* release  0.1.8 ([#3026](https://github.com/lies-exposed/lies.exposed/issues/3026)) ([857453b](https://github.com/lies-exposed/lies.exposed/commit/857453b8c1b3960513723ab18b729a590cfe9dd6))
* release  0.1.9 ([#3047](https://github.com/lies-exposed/lies.exposed/issues/3047)) ([afa22b6](https://github.com/lies-exposed/lies.exposed/commit/afa22b62a34af2fe0d36f44e4e97ebeb450b3224))
* release  lies.exposed 0.2.5 ([#3148](https://github.com/lies-exposed/lies.exposed/issues/3148)) ([f7d5cc6](https://github.com/lies-exposed/lies.exposed/commit/f7d5cc6d7017dc59d6faef69bcaea5b0fba77a2b))
* release  lies.exposed 0.3.0 ([#3153](https://github.com/lies-exposed/lies.exposed/issues/3153)) ([76d5435](https://github.com/lies-exposed/lies.exposed/commit/76d5435fae9fa2137c1b6492dcc809f012d4c6fe))
* release  lies.exposed 0.4.0 ([#3186](https://github.com/lies-exposed/lies.exposed/issues/3186)) ([288c767](https://github.com/lies-exposed/lies.exposed/commit/288c767d6da160acb2bd0f6a457100f2fd146067))
* release  lies.exposed 0.4.1 ([#3199](https://github.com/lies-exposed/lies.exposed/issues/3199)) ([9cd9ff3](https://github.com/lies-exposed/lies.exposed/commit/9cd9ff3e99a76a4c28824c70daea42aa7eb16e8b))
* release  lies.exposed 0.4.2 ([#3210](https://github.com/lies-exposed/lies.exposed/issues/3210)) ([2578709](https://github.com/lies-exposed/lies.exposed/commit/2578709c3a48c576a69d743faa2baad2e53ed824))
* release  lies.exposed 0.4.3 ([#3215](https://github.com/lies-exposed/lies.exposed/issues/3215)) ([e08e7f7](https://github.com/lies-exposed/lies.exposed/commit/e08e7f7b1a96a3c887906c229196730774c22b77))
* release  lies.exposed 0.4.4 ([#3230](https://github.com/lies-exposed/lies.exposed/issues/3230)) ([643c6dd](https://github.com/lies-exposed/lies.exposed/commit/643c6dd8c80db5806c87a2a6bb6fef557cd7b32f))
* release  lies.exposed 0.5.0 ([#3243](https://github.com/lies-exposed/lies.exposed/issues/3243)) ([facc118](https://github.com/lies-exposed/lies.exposed/commit/facc118f12e6095b489cbea9b6e1f4bbef82283d))
* release  lies.exposed 0.5.1 ([#3272](https://github.com/lies-exposed/lies.exposed/issues/3272)) ([775c43a](https://github.com/lies-exposed/lies.exposed/commit/775c43a91e4b6c3d370d215205a0dd7c3ab8a4b5))
* release  lies.exposed 0.5.2 ([#3275](https://github.com/lies-exposed/lies.exposed/issues/3275)) ([2430c81](https://github.com/lies-exposed/lies.exposed/commit/2430c8119d1e1d3a1848ac411e9d4dd1708ca333))
* release  lies.exposed 0.5.3 ([#3298](https://github.com/lies-exposed/lies.exposed/issues/3298)) ([1f0bd75](https://github.com/lies-exposed/lies.exposed/commit/1f0bd75d62c8c031246bb94208bd7234e2ac2507))
* release  lies.exposed 0.5.4 ([#3320](https://github.com/lies-exposed/lies.exposed/issues/3320)) ([c8885a2](https://github.com/lies-exposed/lies.exposed/commit/c8885a233ada2e5d492e45dbd4ceb61ec922db7a))
* release  lies.exposed 0.5.5 ([#3350](https://github.com/lies-exposed/lies.exposed/issues/3350)) ([46fc386](https://github.com/lies-exposed/lies.exposed/commit/46fc386dc40805d36f59b4ecf34874b883ab55c6))
* release  lies.exposed 0.5.6 ([#3360](https://github.com/lies-exposed/lies.exposed/issues/3360)) ([3a3d8cf](https://github.com/lies-exposed/lies.exposed/commit/3a3d8cf22d0bba647d2484d4a9ad1555cb21df48))
* removed 'project' property from languageOptions.parserOptions in favor of 'projectService' ([be5db76](https://github.com/lies-exposed/lies.exposed/commit/be5db7664d703373013ca82b6dcbb849a088ddad))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))
* **shared:** refactor event helpers ([#3067](https://github.com/lies-exposed/lies.exposed/issues/3067)) ([d9c5980](https://github.com/lies-exposed/lies.exposed/commit/d9c5980b68af7ca62f95b09922041613ac1e1677))
* **worker:** proper mocks initialization for e2e tests ([#2998](https://github.com/lies-exposed/lies.exposed/issues/2998)) ([4619599](https://github.com/lies-exposed/lies.exposed/commit/4619599251bb8eca66c3a35ad17d10e0f9c3d2a9))
* **worker:** replace "as any" with proper types ([#2917](https://github.com/lies-exposed/lies.exposed/issues/2917)) ([2ba28dd](https://github.com/lies-exposed/lies.exposed/commit/2ba28dd988c7d88aec95c7f88bf36e0e904ed480))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))
* **workspace:** bump the vite group across 8 directories with 2 updates ([#2894](https://github.com/lies-exposed/lies.exposed/issues/2894)) ([9b335af](https://github.com/lies-exposed/lies.exposed/commit/9b335afd53d543e8225464c7cb93d62986bb8b9b))
* **workspace:** removed fs direct import in flows ([#3150](https://github.com/lies-exposed/lies.exposed/issues/3150)) ([0aa2bcf](https://github.com/lies-exposed/lies.exposed/commit/0aa2bcf479cbce4efe87912e93171b473166d84b))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/backend bumped to 0.6.0
    * @liexp/io bumped to 0.6.0
    * @liexp/core bumped to 0.6.0
    * @liexp/shared bumped to 0.6.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.6.0
    * @liexp/test bumped to 0.6.0
</details>

---
This PR was generated with [Release Please](https://github.com/googleapis/release-please). See [documentation](https://github.com/googleapis/release-please#release-please).