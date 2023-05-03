# Docker container for integrating the Serlo Editor into edu-sharing

## Usage

You can use the Serlo Editor via docker. You can pull the container from
[the GitHub Packages](https://github.com/serlo/ece-as-a-service/pkgs/container/ece-as-a-service).
The container is configured by environment variables. Which you can use are
defined in the file [`.env`](./.env).

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

# Releasing a new version

Merging changes into branch `main` triggers a new release under the tag `main`.
This should only be used for development.

Pushing a git tag like `v1.2.3` (need to be in this form) to any branch triggers
a new release under the specified version tag. These releases can then be
consumed by edu-sharing.

Version numbering should follow
[Semantic Versioning](https://semver.org/lang/de/spec/v2.0.0.html).

Changes are tracked in the [changelog](./CHANGELOG.md).

Releasing bugfixes for older major/minor versions can be done by pushing a tag
on a separate branch. Example: Version 2.0.0 is already released with a tag on
branch main. However, we want to fix a bug in major version 1. We can do so by
creating a branch that branches off at version 1.0.0 and push a commit and tag
on that branch.
