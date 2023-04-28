# Docker container for integrating the Serlo Editor into edu-sharing

## Usage

You can use the Serlo Editor via docker. You can pull the container from
[the GitHub Packages](https://github.com/serlo/serlo-editor-for-edusharing/pkgs/container/serlo-editor-for-edusharing).
Please specify a specific version when pulling the docker image and update
manually, do not use `latest`. The container is configured by environment
variables. Which you can use are defined in the file [`.env`](./.env).

## Setup

1. Clone this repository
2. Install tools from [`.tool-versions`](./.tool-versions) (for example via
   [`asdf`](https://asdf-vm.com/))
3. Install `docker` and `docker-compose`
4. Run `yarn`

## Local development

You can use `yarn run` to see which scripts you can use in the local
development. The most important ones are:

- `yarn dev`: Starts the server on http://localhost:3000/ together with a mock
  of edu-sharing. You can open http://localhost:8100/ in order to open the Serlo
  Editor via LTI (as edu-sharing will be). You can also test the saving and the
  embedding with the edu-sharing mock.
- `yarn start:server`: Only starts the Serlo editor (this is needed for tests
  since the tests need to start the edu-sharing mock by themself).
- `yarn test`: Run all jest tests.
- `yarn e2e`: Run all e2e tests with cypress.
- `yarn lint`: Run all lints (eslint, prettier, ...).
- `yarn format`: Format all source code.
