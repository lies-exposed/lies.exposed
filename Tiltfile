# -*- mode: Node -*
load('ext://restart_process', 'docker_build_with_restart')

helmYaml = helm(
  './helm',
  # The release name, equivalent to helm --name
  name='liexp-dev',
  # The namespace to install in, equivalent to helm --namespace
  namespace='liexp-dev',
  # The values file to substitute into the chart.
  values=['./helm/values.yaml','./helm/values.dev.yaml']
)

k8s_yaml(helmYaml)

local_resource('ai-bot-build', cmd='pnpm ai-bot build')

ai_bot_sync = sync('./services/ai-bot/build/', '/home/node/build/')

## AI BOT
docker_build('ghcr.io/lies-exposed/liexp-ai-bot:alpha-latest', '.',
    dockerfile='ai-bot.Dockerfile',
    target='dev',
    entrypoint='pnpm ai-bot docker:dev',
    ignore=[
        './services/web',
        './services/api',
        './services/admin-web',
        './services/storybook'
    ],
    live_update=[
        ai_bot_sync,
        run('pnpm ai-bot build')
])

k8s_resource('ai-bot', resource_deps=['ai-bot-build'])

# local_resource('api-build', cmd='pnpm api build')

## API
docker_build('ghcr.io/lies-exposed/liexp-api:alpha-latest', '.',
    dockerfile='api.Dockerfile',
    target='build',
    entrypoint='DOTENV_CONFIG_PATH=.env pnpm api migration:run && pnpm api docker:dev',
    ignore=[
        './services/ai-bot',
        './services/admin-web',
        './services/web',
        './services/storybook'
    ],
    live_update=[
        sync('./services/api/', '/usr/src/app/services/api/'),
        run('cd /usr/src/app && pnpm install', trigger=['./package.json', './pnpm-lock.yaml']),
        run('pnpm api build', trigger=[
            "./packages/@liexp/shared/src",
            "./packages/@liexp/backend/src",
            "./services/api/src"
        ]),
        run('DOTENV_CONFIG_PATH=.env pnpm api migration:run')
])

# load('ext://uibutton', 'cmd_button', 'bool_input', 'location')
# cmd_button('migrate db',
#         argv=['sh', '-c', 'pnpm api migration:run'],
#         location=location.NAV,
#         icon_name='developer_board',
#         text='Run database migration',
#         resource="api-liexp-dev"
# )

# k8s_resource('api-liexp-dev',
#     resource_deps=["api-build"]
# )

web_sync = sync('./services/web/', '/usr/src/app/services/web/')

## WEB
docker_build('ghcr.io/lies-exposed/liexp-web:alpha-latest', '.',
    dockerfile='web.Dockerfile',
    target='dev',
    entrypoint='VITE_NODE_ENV=development pnpm web build:client && pnpm web dev',
    ignore=[
        './services/ai-bot',
        './services/admin-web',
        './services/api',
        './services/storybook'
    ],
    live_update=[
        fall_back_on('./services/web/vite.config.ts'),
        web_sync,
        run('pnpm install',
            trigger=[
                './package.json',
                './services/web/package.json'
            ]),
        run('pnpm packages:build', trigger=[
            './packages/@liexp/core/src',
            './packages/@liexp/shared/src',
            './packages/@liexp/ui/src',
        ]),
])
k8s_resource('liexp-dev', port_forwards=["4020:4020", "24678:24678"])


## ADMIN WEB
admin_web_sync = sync('./services/admin-web/', '/usr/src/app/services/admin-web/')
local_resource('admin-web-build', cmd="pnpm admin-web build")

docker_build_with_restart('ghcr.io/lies-exposed/liexp-admin-web:alpha-latest', '.',
    dockerfile='adminWeb.Dockerfile',
    target='dev',
    entrypoint='pnpm admin-web docker:dev',
    ignore=[
        './services/ai-bot',
        './services/api',
        './services/storybook',
        './services/web'
    ],
    live_update=[
        admin_web_sync,
        run('cd /usr/src/app && pnpm install',
            trigger=[
                './package.json',
                './pnpm-lock.yaml',
                './services/admin-web/package.json'
            ])
])

k8s_resource('admin-web', resource_deps=['admin-web-build'])