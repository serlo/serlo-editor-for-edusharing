# Docker container for integrating the Serlo Editor into edu-sharing

You can pull the container from
[the GitHub Packages](https://github.com/serlo/serlo-editor-for-edusharing/pkgs/container/serlo-editor-for-edusharing).
Please specify a specific version when pulling the docker image and update
manually. Do not use `latest` or `main`, these are only for development.

The container is configured by environment variables. They are defined in the
file [`.env`](./.env).

## Setup for local development

1. Clone this repository using `git clone --recurse-submodules [repo url]`
2. Install tools from [`.tool-versions`](./.tool-versions) (for example via
   [`asdf`](https://asdf-vm.com/))
3. Install `docker` and `docker-compose`
4. Run `yarn` in root directory

### Used normal git clone and want to install submodules?

1. `git submodule init`

2. `git submodule update`

## Local development

You can use `yarn run` to see which scripts you can use in the local
development. The most important ones are:

- `yarn dev`: Starts a local development server on http://localhost:8100/. Two
  servers will be started: 1. A mock of edu-sharing. 2. The Serlo editor.
  Accessing http://localhost:8100/ will make the edu-sharing mock launch the
  Serlo editor via LTI. Accessing http://localhost:3000/ will open the Serlo
  editor without a LTI launch.
- `yarn test`: Run all jest tests.
- `yarn e2e`: Run all e2e tests with cypress.
- `yarn lint`: Run all lints (eslint, prettier, ...).
- `yarn format`: Format all source code.
- `yarn start:server`: Only starts the Serlo editor without the edu-sharing
  mock.

Also there are:

- `yarn docker:run-sh`: Starts the docker container but will skip the entrypoint
  command and open a shell instead. Useful for checking files within the
  container and running commands within manually.

## Core structure

This project includes:

- A Next.js project providing the Serlo editor
- An express server `src/backend/server.ts` that handles requests within the LTI
  protocol and forwards requests to the Next.js server
- A mock of edu-sharing `src/edusharing-server` that can launch the Serlo Editor
  via LTI (only used for local development and testing)

The repository https://github.com/serlo/frontend/ is a git submodule in this
repository. This allows us to use the same editor code (and styling) that is
used on serlo.org.

# Releasing a new version

Merging changes into branch `main` triggers a new release under the tag `main`.
The `main` tag should only be used for development.

Pushing a git tag like `v1.2.3` (need to be in this form) to any branch triggers
a new release under the specified version tag. These releases can then be
consumed by edu-sharing. Remember to update the version in package.json as well.

Version numbering should follow
[Semantic Versioning](https://semver.org/lang/de/spec/v2.0.0.html).

Releasing bugfixes for older major/minor versions can be done by pushing a tag
on a separate branch. Example: Version 2.0.0 is already released with a tag on
branch main. However, we want to fix a bug in major version 1. We can do so by
creating a branch that branches off at version 1.0.0 and push a commit and tag
on that branch.
