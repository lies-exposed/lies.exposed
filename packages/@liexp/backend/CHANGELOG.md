# Changelog

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
* web request errors — stats, event payloads, pub/sub, and AI job result handling ([#3228](https://github.com/lies-exposed/lies.exposed/issues/3228)) ([f724796](https://github.com/lies-exposed/lies.exposed/commit/f7247962b33bdd04811fcf23863cbba3320e9caf))
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

## [0.5.6](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.5...@liexp/backend@0.5.6) (2026-03-11)


### Miscellaneous

* **@liexp/backend:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.5.6
    * @liexp/io bumped to 0.5.6
    * @liexp/shared bumped to 0.5.6
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.6
    * @liexp/test bumped to 0.5.6

## [0.5.5](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.4...@liexp/backend@0.5.5) (2026-03-08)


### Bug Fixes

* **agent:** add story CLI command group with spec tests ([#3351](https://github.com/lies-exposed/lies.exposed/issues/3351)) ([03aae78](https://github.com/lies-exposed/lies.exposed/commit/03aae782b20021988a19384bc0cd609c7e288e56))


### Miscellaneous

* **api:** drop orphan tables and rename event_v2 to event ([0b53cef](https://github.com/lies-exposed/lies.exposed/commit/0b53cefee01a0183a5783326b4473166f7314fbd)), closes [#3352](https://github.com/lies-exposed/lies.exposed/issues/3352)
* **shared:** remove Project resource from the codebase ([#3348](https://github.com/lies-exposed/lies.exposed/issues/3348)) ([d781ab3](https://github.com/lies-exposed/lies.exposed/commit/d781ab3d239fbb6ff899f17c78cda900788ec3ab))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.5.5
    * @liexp/io bumped to 0.5.5
    * @liexp/shared bumped to 0.5.5
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.5
    * @liexp/test bumped to 0.5.5

## [0.5.4](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.3...@liexp/backend@0.5.4) (2026-03-07)


### Bug Fixes

* **agent:** agent supervisor ([#3344](https://github.com/lies-exposed/lies.exposed/issues/3344)) ([723675e](https://github.com/lies-exposed/lies.exposed/commit/723675e1f5b2e0c5474c40944239cf6b8b9cb9b7))
* **agent:** provide cli tools to access platform resources ([#3332](https://github.com/lies-exposed/lies.exposed/issues/3332)) ([6ba161f](https://github.com/lies-exposed/lies.exposed/commit/6ba161fcc9dc132fdedc9d3b81a8b3432325dfc6))
* **backend:** use root option in res.sendFile for SPA fallback ([#3342](https://github.com/lies-exposed/lies.exposed/issues/3342)) ([b73bff5](https://github.com/lies-exposed/lies.exposed/commit/b73bff584ac99d250ae6f3fea8332ceb9ecc9b40))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.5.4
    * @liexp/io bumped to 0.5.4
    * @liexp/shared bumped to 0.5.4
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.4
    * @liexp/test bumped to 0.5.4

## [0.5.3](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.2...@liexp/backend@0.5.3) (2026-03-04)


### Bug Fixes

* **worker:** add backfill-link-publish-dates command ([#3317](https://github.com/lies-exposed/lies.exposed/issues/3317)) ([e33e26d](https://github.com/lies-exposed/lies.exposed/commit/e33e26d17560e2b544811822a0a540328a97f138))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.5.3
    * @liexp/io bumped to 0.5.3
    * @liexp/shared bumped to 0.5.3
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.3
    * @liexp/test bumped to 0.5.3

## [0.5.2](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.1...@liexp/backend@0.5.2) (2026-03-01)


### Bug Fixes

* **api:** search improvements ([#3281](https://github.com/lies-exposed/lies.exposed/issues/3281)) ([9960c92](https://github.com/lies-exposed/lies.exposed/commit/9960c924c16ea78ed03e4c23b7268039b6889e89))
* **backend:** reject PDF URLs as links and create media instead ([#3277](https://github.com/lies-exposed/lies.exposed/issues/3277)) ([dc7680c](https://github.com/lies-exposed/lies.exposed/commit/dc7680c8229b9288bd172ed88590217e46aba16a))
* **worker:** remove premature UpdateEntitiesFromURL pub/sub and let ai-bot scheduler handle the job ([#3279](https://github.com/lies-exposed/lies.exposed/issues/3279)) ([508e19d](https://github.com/lies-exposed/lies.exposed/commit/508e19dbc35a5cc5c17d870750af44b4571d1c8b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.5.2
    * @liexp/io bumped to 0.5.2
    * @liexp/shared bumped to 0.5.2
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.2
    * @liexp/test bumped to 0.5.2

## [0.5.1](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.5.0...@liexp/backend@0.5.1) (2026-02-28)


### Miscellaneous

* **@liexp/backend:** Synchronize monorepo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.5.1
    * @liexp/io bumped to 0.5.1
    * @liexp/shared bumped to 0.5.1
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.1
    * @liexp/test bumped to 0.5.1

## [0.5.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.4.4...@liexp/backend@0.5.0) (2026-02-28)


### Bug Fixes

* **ai-bot:** link metadata extraction and status filtering for admin  ([#3242](https://github.com/lies-exposed/lies.exposed/issues/3242)) ([8b2ce40](https://github.com/lies-exposed/lies.exposed/commit/8b2ce40aaf32c1c6798f282e49ff8e9e7335e015))
* **api:** add Redis response cache with HTTP Cache-Control headers ([#3241](https://github.com/lies-exposed/lies.exposed/issues/3241)) ([8bc2c0b](https://github.com/lies-exposed/lies.exposed/commit/8bc2c0b3e9a614d264aeb727a2422edad0b5f174))
* **api:** don't apply cache to authenticated requests ([#3255](https://github.com/lies-exposed/lies.exposed/issues/3255)) ([7cea4ae](https://github.com/lies-exposed/lies.exposed/commit/7cea4ae0569452df643b52efd8e302a0f7990322))
* **api:** stories validation ([#3270](https://github.com/lies-exposed/lies.exposed/issues/3270)) ([57dc553](https://github.com/lies-exposed/lies.exposed/commit/57dc553ede1a3f120d4dc3824aaf4a4b176f7f71))
* **ui:** add link entity registration from BlockNote editor  ([#3264](https://github.com/lies-exposed/lies.exposed/issues/3264)) ([0c6ec5b](https://github.com/lies-exposed/lies.exposed/commit/0c6ec5b53b35cbd0b24f6883ef18b610702eb5a0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.5.0
    * @liexp/io bumped to 0.5.0
    * @liexp/shared bumped to 0.5.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.5.0
    * @liexp/test bumped to 0.5.0

## [0.4.4](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.4.3...@liexp/backend@0.4.4) (2026-02-24)


### Bug Fixes

* **admin:** implement sorting for queue resources ([#3234](https://github.com/lies-exposed/lies.exposed/issues/3234)) ([9e2cb6b](https://github.com/lies-exposed/lies.exposed/commit/9e2cb6b264bf8afad3efef7bdc6ee38a25622429))
* advanced lazy-loading patterns for web bundle optimization ([#3235](https://github.com/lies-exposed/lies.exposed/issues/3235)) ([571c9b8](https://github.com/lies-exposed/lies.exposed/commit/571c9b8fca271601fa9e7d3c08f3c101a965a292))
* web request errors — stats, event payloads, pub/sub, and AI job result handling ([#3228](https://github.com/lies-exposed/lies.exposed/issues/3228)) ([f724796](https://github.com/lies-exposed/lies.exposed/commit/f7247962b33bdd04811fcf23863cbba3320e9caf))
* **worker:** save links even on screenshot failure and always reply to user ([#3232](https://github.com/lies-exposed/lies.exposed/issues/3232)) ([c07a0d3](https://github.com/lies-exposed/lies.exposed/commit/c07a0d392273a1dd0bdf11ff2ad5b65da46b815d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.4.4
    * @liexp/io bumped to 0.4.4
    * @liexp/shared bumped to 0.4.4
  * devDependencies
    * @liexp/eslint-config bumped to 0.4.4
    * @liexp/test bumped to 0.4.4

## [0.4.3](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.4.2...@liexp/backend@0.4.3) (2026-02-22)


### Bug Fixes

* **backend:** added status to LinkEntity ([#3156](https://github.com/lies-exposed/lies.exposed/issues/3156)) ([71980bf](https://github.com/lies-exposed/lies.exposed/commit/71980bf2e401423c85cb1722e8cff338792b1864))
* io namespace imports ([#3216](https://github.com/lies-exposed/lies.exposed/issues/3216)) ([0efdfc6](https://github.com/lies-exposed/lies.exposed/commit/0efdfc67a6b43d34a874a3b6fda8169d10486948))
* **workspace:** add @liexp/eslint-config to tsconfig references in all packages/services ([#3225](https://github.com/lies-exposed/lies.exposed/issues/3225)) ([6607a57](https://github.com/lies-exposed/lies.exposed/commit/6607a57d4fcc70a2c4910fde55eb5d333aa6f6c0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.4.3
    * @liexp/io bumped to 0.4.3
    * @liexp/shared bumped to 0.4.3
  * devDependencies
    * @liexp/eslint-config bumped to 0.4.3
    * @liexp/test bumped to 0.4.3

## [0.4.2](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.4.1...@liexp/backend@0.4.2) (2026-02-19)


### Bug Fixes

* **api:** actor and group avatar find tools ([#3213](https://github.com/lies-exposed/lies.exposed/issues/3213)) ([0f87695](https://github.com/lies-exposed/lies.exposed/commit/0f87695676d0beabbc2ed843e2515361b10155a2))
* **api:** prevent circular PARENT_CHILD relations crashing admin UI ([#3211](https://github.com/lies-exposed/lies.exposed/issues/3211)) ([7cad842](https://github.com/lies-exposed/lies.exposed/commit/7cad842a7d4c3560cdbb5427a9da261292dd320c))
* **ui:** improve actor family tree graph ([#3212](https://github.com/lies-exposed/lies.exposed/issues/3212)) ([513fc06](https://github.com/lies-exposed/lies.exposed/commit/513fc06dc3faa4a2ba7d00ff9a4be0b6f0bfd595))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.4.2
    * @liexp/io bumped to 0.4.2
    * @liexp/shared bumped to 0.4.2
  * devDependencies
    * @liexp/eslint-config bumped to 0.4.2
    * @liexp/test bumped to 0.4.2

## [0.4.1](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.4.0...@liexp/backend@0.4.1) (2026-02-18)


### Bug Fixes

* **agent:** multiprovider AI agent configuration ([#3206](https://github.com/lies-exposed/lies.exposed/issues/3206)) ([06920b4](https://github.com/lies-exposed/lies.exposed/commit/06920b4bf246b7c22f5c5acc9f9cd8b4909a1e13))


### Miscellaneous

* errors refactor ([#3207](https://github.com/lies-exposed/lies.exposed/issues/3207)) ([ed74cee](https://github.com/lies-exposed/lies.exposed/commit/ed74ceea7c12764221f40d6f30f76c3a55e20373))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.4.1
    * @liexp/io bumped to 0.4.1
    * @liexp/shared bumped to 0.4.1
  * devDependencies
    * @liexp/eslint-config bumped to 0.4.1
    * @liexp/test bumped to 0.4.1

## [0.4.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.3.0...@liexp/backend@0.4.0) (2026-02-15)


### Bug Fixes

* **worker:** wikipedia api ([#3187](https://github.com/lies-exposed/lies.exposed/issues/3187)) ([f463543](https://github.com/lies-exposed/lies.exposed/commit/f463543e9406640d8f04d8acdf17836068263872))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.4.0
    * @liexp/io bumped to 0.4.0
    * @liexp/shared bumped to 0.4.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.4.0
    * @liexp/test bumped to 0.4.0

## [0.3.0](https://github.com/lies-exposed/lies.exposed/compare/lies.exposed@0.2.5...@liexp/backend@0.3.0) (2026-02-11)


### Features

* create actor relation ([#3167](https://github.com/lies-exposed/lies.exposed/issues/3167)) ([f251e56](https://github.com/lies-exposed/lies.exposed/commit/f251e56a8b360dae003b88601f5bbe03cdf4216e))


### Miscellaneous

* **backend:** added flow spec tests ([#3154](https://github.com/lies-exposed/lies.exposed/issues/3154)) ([bf69946](https://github.com/lies-exposed/lies.exposed/commit/bf699467455dd34bfe6614e5e57bbf5f3fc0c564))
* **backend:** run database migrations on test global setup ([#3169](https://github.com/lies-exposed/lies.exposed/issues/3169)) ([d8d4e97](https://github.com/lies-exposed/lies.exposed/commit/d8d4e975e5161d6e0e53e17fcd8fffb7b769fd10))
* **workspace:** use cache for eslint ([#3164](https://github.com/lies-exposed/lies.exposed/issues/3164)) ([1584975](https://github.com/lies-exposed/lies.exposed/commit/1584975500ad8e1e916419bcedb4e4629e7c8cc3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.3.0
    * @liexp/io bumped to 0.3.0
    * @liexp/shared bumped to 0.3.0
  * devDependencies
    * @liexp/eslint-config bumped to 0.3.0
    * @liexp/test bumped to 0.3.0

## [0.2.5](https://github.com/lies-exposed/lies.exposed/compare/@liexp/backend@0.1.12...@liexp/backend@0.2.5) (2026-01-30)


### Miscellaneous

* **api:** removed puppeteer and puppeteer-extra deps and dead code ([#3149](https://github.com/lies-exposed/lies.exposed/issues/3149)) ([1a6ddab](https://github.com/lies-exposed/lies.exposed/commit/1a6ddabb6a28d42727b94954035f197b4f3646e5))
* **workspace:** removed fs direct import in flows ([#3150](https://github.com/lies-exposed/lies.exposed/issues/3150)) ([0aa2bcf](https://github.com/lies-exposed/lies.exposed/commit/0aa2bcf479cbce4efe87912e93171b473166d84b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.2.5
    * @liexp/io bumped to 0.2.5
    * @liexp/shared bumped to 0.2.5
  * devDependencies
    * @liexp/eslint-config bumped to 0.2.5
    * @liexp/test bumped to 0.2.5

## [0.1.12](https://github.com/lies-exposed/lies.exposed/compare/@liexp/backend@0.1.11...@liexp/backend@0.1.12) (2026-01-28)


### Miscellaneous

* moved queue implementation from fs to pg ([#3136](https://github.com/lies-exposed/lies.exposed/issues/3136)) ([5d9efc8](https://github.com/lies-exposed/lies.exposed/commit/5d9efc865751e6468b0e883a87005029f4e32802))
* refactor error logic ([#3129](https://github.com/lies-exposed/lies.exposed/issues/3129)) ([d04b8ff](https://github.com/lies-exposed/lies.exposed/commit/d04b8ffddb517d49feae3a22649e988bdc77658e))
* **shared:** merge task utils in fp utils ([#3127](https://github.com/lies-exposed/lies.exposed/issues/3127)) ([dd4f906](https://github.com/lies-exposed/lies.exposed/commit/dd4f90624ef87b5864bfb009cc356f8df683470a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.6
    * @liexp/io bumped to 0.2.4
    * @liexp/shared bumped to 0.2.4
  * devDependencies
    * @liexp/test bumped to 0.1.12

## [0.1.11](https://github.com/lies-exposed/lies.exposed/compare/@liexp/backend@0.1.10...@liexp/backend@0.1.11) (2026-01-24)


### Bug Fixes

* **eslint-config:** created new package with eslint config from @liexp/core ([#3118](https://github.com/lies-exposed/lies.exposed/issues/3118)) ([730d029](https://github.com/lies-exposed/lies.exposed/commit/730d029296f7e539f6db494488e83cf89d8fefd5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.5
    * @liexp/io bumped to 0.2.3
    * @liexp/shared bumped to 0.2.3
  * devDependencies
    * @liexp/eslint-config bumped to 0.1.0
    * @liexp/test bumped to 0.1.11

## [0.1.10](https://github.com/lies-exposed/lies.exposed/compare/@liexp/backend@0.1.9...@liexp/backend@0.1.10) (2026-01-23)


### Bug Fixes

* **agent:** support Anthropic AI provider ([#3115](https://github.com/lies-exposed/lies.exposed/issues/3115)) ([2952200](https://github.com/lies-exposed/lies.exposed/commit/29522002dc161e57dbac13af0e9c317a839cb4c5))


### Miscellaneous

* **shared:** moved ai prompts from io package ([#3111](https://github.com/lies-exposed/lies.exposed/issues/3111)) ([3619422](https://github.com/lies-exposed/lies.exposed/commit/3619422b1c3d65cee35ca81a1e67a8afca91ac6f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/io bumped to 0.2.2
    * @liexp/shared bumped to 0.2.2
  * devDependencies
    * @liexp/test bumped to 0.1.10

## [0.1.9](https://github.com/lies-exposed/lies.exposed/compare/@liexp/backend@0.1.8...@liexp/backend@0.1.9) (2026-01-21)


### Miscellaneous

* **io:** extract io codecs from @liexp/shared to new @liexp/io package ([#3088](https://github.com/lies-exposed/lies.exposed/issues/3088)) ([6be0b5f](https://github.com/lies-exposed/lies.exposed/commit/6be0b5f515a3b169ef9655996d155ce0fde69990))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/io bumped to 0.2.1
    * @liexp/shared bumped to 0.2.1
  * devDependencies
    * @liexp/test bumped to 0.1.9

## [0.1.8](https://github.com/lies-exposed/lies.exposed/compare/@liexp/backend@0.1.7...@liexp/backend@0.1.8) (2026-01-19)


### Bug Fixes

* **ai-bot:** remove loadDocs flow in favor of agent tools ([#3048](https://github.com/lies-exposed/lies.exposed/issues/3048)) ([144bb66](https://github.com/lies-exposed/lies.exposed/commit/144bb6671520d893e6f1975f995e589412f00838))
* **api:** merge events flow ([#3073](https://github.com/lies-exposed/lies.exposed/issues/3073)) ([03669c1](https://github.com/lies-exposed/lies.exposed/commit/03669c1fea5a2be404b531e00c1713c84fe137a2))
* **shared:** renamed Endpoints for agent to AgentEndpoints ([#3063](https://github.com/lies-exposed/lies.exposed/issues/3063)) ([5366305](https://github.com/lies-exposed/lies.exposed/commit/53663056c564a92b4ca01805f61edd849b000a26))


### Miscellaneous

* **admin:** setup custom HMR port for server ([#3051](https://github.com/lies-exposed/lies.exposed/issues/3051)) ([99ef38c](https://github.com/lies-exposed/lies.exposed/commit/99ef38c1d3f8b299341ed2df4dc9197eda0ef4be))
* bump pnpm from 10.28.0 to 10.28.1 ([#3074](https://github.com/lies-exposed/lies.exposed/issues/3074)) ([449492d](https://github.com/lies-exposed/lies.exposed/commit/449492de5d2088b42f5297a52fb2da38fb5cc429))
* **core:** fp module utils ([#3068](https://github.com/lies-exposed/lies.exposed/issues/3068)) ([1937350](https://github.com/lies-exposed/lies.exposed/commit/19373509798471fb3303c05af721479f71fa023b))
* **shared:** refactor event helpers ([#3067](https://github.com/lies-exposed/lies.exposed/issues/3067)) ([d9c5980](https://github.com/lies-exposed/lies.exposed/commit/d9c5980b68af7ca62f95b09922041613ac1e1677))
* **workspace:** bump dev dependencies ([#3070](https://github.com/lies-exposed/lies.exposed/issues/3070)) ([e49cb92](https://github.com/lies-exposed/lies.exposed/commit/e49cb9211fca3e425d804eb4891efddec88752b5))
* **workspace:** bump pnpm from 10.26.0 to 10.28.0 ([#3052](https://github.com/lies-exposed/lies.exposed/issues/3052)) ([8b1b474](https://github.com/lies-exposed/lies.exposed/commit/8b1b4740e2978b495d11f4d05320481abf4fefe0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.4
    * @liexp/shared bumped to 0.2.0
  * devDependencies
    * @liexp/test bumped to 0.1.8

## [0.1.7](https://github.com/lies-exposed/lies.exposed/compare/@liexp/backend@0.1.6...@liexp/backend@0.1.7) (2026-01-11)


### Bug Fixes

* **agent:** provide searchWebTools in agent service ([#3045](https://github.com/lies-exposed/lies.exposed/issues/3045)) ([1191a71](https://github.com/lies-exposed/lies.exposed/commit/1191a713da3eb66fa59f4ce275fc7f6e88a47693))
* **backend:** added brave provider for web searches ([#3044](https://github.com/lies-exposed/lies.exposed/issues/3044)) ([e1723b5](https://github.com/lies-exposed/lies.exposed/commit/e1723b5869cc4745cb885f0b3cab463863adc0f4))


### Miscellaneous

* **admin:** implement HMR for development server ([#3034](https://github.com/lies-exposed/lies.exposed/issues/3034)) ([13f4b42](https://github.com/lies-exposed/lies.exposed/commit/13f4b4256065f256272575d27892e6bcf9b310c9))
* **deps:** update dev dependencies ([#3036](https://github.com/lies-exposed/lies.exposed/issues/3036)) ([f2a56cc](https://github.com/lies-exposed/lies.exposed/commit/f2a56cc94fc740e7e60868997273d91401545839))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @liexp/core bumped to 0.1.3
    * @liexp/shared bumped to 0.1.7
  * devDependencies
    * @liexp/test bumped to 0.1.7

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
