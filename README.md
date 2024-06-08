# lies.exposed

<img src="./services/web/public/logo192.png" height="100" />

![GitHub issues](https://img.shields.io/github/issues/lies-exposed/lies.exposed)
![GitHub pull requests](https://img.shields.io/github/issues-pr/lies-exposed/lies.exposed)

![GitHub Workflow API Status](https://img.shields.io/github/actions/workflow/status/lies-exposed/lies.exposed/api-pull-request.yml?label=PR%20-%20API)
![GitHub Workflow Web Status](https://img.shields.io/github/actions/workflow/status/lies-exposed/lies.exposed/web-pull-request.yml?label=PR%20-%20Web)
![GitHub Workflow Web Status](https://img.shields.io/github/actions/workflow/status/lies-exposed/lies.exposed/admin-web-pull-request.yml?label=PR%20-%20Admin%20Web)

![GitHub Workflow Deploy Alpha Status](https://img.shields.io/github/actions/workflow/status/lies-exposed/lies.exposed/deploy-alpha.yml?branch=release/alpha&label=Deploy%20Alpha)

---

## Project Structure

The project is built using `pnpm workspaces` and divided in `packages` and `services`.

### Packages

Packages contains all the common code used in `services`.

- [@liexp/core](./packages/@liexp/core/README.md) contains all the core modules
- [@liexp/shared](./packages/@liexp/shared./README.md) contains domain specific definitions for `models` and `endpoints`
- [@liexp/test](./packages/@liexp/test/README.md) contains some test utils
- [@liexp/ui](./packages/@liexp/ui/README.md) contains all `ui` components

### Services

The `services` are the deployable projects:

- [admin-web](./services/admin-web/README.md)
- [api](./services/api/README.md)
- [storybook](./services/storybook/README.md)
- [web](./services/web/README.md)

### Develop

The local development require some modules to be installed on your machine:

- node
- pnpm
- docker
- docker-compose

The easiest way to run the project is by using `docker-compose`.
The [docker-compose.yml](./docker-compose.yml) contains all the definitions to run the needed services.

If you want to start developing with `docker-compose`:

```sh
docker-compose build # build base image
docker-compose up -d db # starts db in background
docker-compose up api web admin-web data # starts api, web, admin-web and data services
```

**N.B.: you need to run `pnpm api watch` in another shell to make the api container to trigger restart event**

### Build

```sh
pnpm build
```

### Run with docker

Build the images first with

```sh
# build `base`, `api` and `web` image
./scripts/docker-build.sh
```

```sh
# start docker compose for `deploy/docker-compose.yml`
./scripts/docker-deploy-test.sh
```
