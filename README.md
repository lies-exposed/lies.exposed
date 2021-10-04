# ECOnnessione

![GitHub issues](https://img.shields.io/github/issues/ascariandrea/econnessione)
![GitHub pull requests](https://img.shields.io/github/issues-pr/ascariandrea/econnessione)
![GitHub Workflow Tests Spec Status](https://img.shields.io/github/workflow/status/ascariandrea/econnessione/tests-spec)
![GitHub Workflow Tests E2E Status](https://img.shields.io/github/workflow/status/ascariandrea/econnessione/tests-e2e)

---

## Project Structure

The project is built using `yarn workspaces` and divided in `packages` and `services`.

### Packages

Packages contains all the common code used in `services`.

- [@econnessione/core](./packages/@econnessione/core/README.md) contains all the core modules
- [@econnessione/shared](./packages/@econnessione/shared./README.md) contains domain specific definitions for `models` and `endpoints`

- [@econnessione/ui](./packages/@econnessione/ui/README.md) contains all `ui` components


### Services

The `services` are the deployable projects:

- [admin-web](./services/admin-web/README.md)
- [api](./services/api/README.md)
- [data](./services/data/README.md) (only in development)
- [storybook](./services/storybook/README.md)
- [web](./services/web/README.md)

### Develop

The local development require some modules to be installed on your machine:

- node
- yarn
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

**N.B.: you need to run `yarn api watch` in another shell to make the api container to trigger restart event**

#### Storybook

`Storybook` is available to develop new components:

```sh
npm run storybook
```

### Build

```sh
npm run build
```
