# Docker container for integrating the Serlo Editor into edu-sharing

You can pull the container from
[the GitHub Packages](https://github.com/serlo/serlo-editor-for-edusharing/pkgs/container/serlo-editor-for-edusharing).
Please specify a specific version when pulling the docker image and update
manually. Do not use `latest` or `main`, these are only for development.

The container is configured by environment variables. They are defined in the
file [`.env`](./.env).

## Local development

1. Clone this repository using `git clone [repo url]`
2. Install tools from [`.tool-versions`](./.tool-versions) (for example via
   [`asdf`](https://asdf-vm.com/))
3. Install `docker` and `docker-compose`
4. Run `yarn` in root directory
5. Add `127.0.0.1 repository.127.0.0.1.nip.io` to your `/etc/hosts`

You can use `yarn run` to see which scripts you can use in the local
development. The most important ones are:

- `yarn dev`: Starts the local development environment, accessible on
  http://localhost:8100/. Two servers are started:
  1. A mock of edu-sharing: Listens on port 8100 and launches & redirects to the
     Serlo editor using LTI
  2. The Serlo editor: Listens on port 3000
- `yarn e2e:docker-build`: Build the docker container and run cypress e2e tests.
  IMPORTANT: Uncomment test in `editor.cy.ts` first. Confirm this runs without
  errors before merging into `main`. Cypress tests are temporarily disabled in
  the Github workflows because they were flaky in the CI pipeline and kept
  failing.
- `yarn test`: Run all jest tests.
- `yarn lint`: Run all lints (eslint, prettier, ...).
- `yarn format`: Format all source code.

URL parameter `mayEdit` controls if the content is editable or not. Change it in
url to preview also the no-edit view.

Use repo
[https://github.com/serlo/serlo-edusharing-integration/](https://github.com/serlo/serlo-edusharing-integration/)
to test the integration with a full instance of edu-sharing instead of just a
mock.

## Usage perspective

The following user story describes how the editor is integrated within
edu-sharing: A user on edu-sharing can create a new file or modify an existing
one and select the Serlo Editor for editing. This will launch the Serlo Editor
in a new browser tab and display the content of the selected resource. There,
the user can modify the content using features provided by the editor such as
rich text editing. Within the editor, the user can also choose to embed
resources uploaded on edu-sharing directly into the content, for example an
image. Finally, the content can be saved and is stored on the edu-sharing
platform.

## Core project structure

This project includes:

- A Next.js project providing the Serlo editor
- An express server `src/backend/server.ts` that handles/forwards all requests
  and will listen on port 3000. This is a
  [Next.js custom server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server).
  It also handles requests in the LTI protocol.
- A mock of edu-sharing `src/edusharing-server` that can launch the Serlo Editor
  via LTI (only used for local development & testing, not part of the docker
  image)

This uses an beta version of `@serlo/editor`.

## Implementation details

### Editor plugin customization

The editor plugins in `serlo-editor-for-edusharing` differ slightly from
[frontend](https://github.com/serlo/frontend/) in terms of availability and
configuration.

In `serlo-editor.tsx` the Serlo editor component is passed the `plugins` prop
that contains all information about what plugins should be available and how
they should be configured.

Two plugins are added in addition to the ones from
[frontend](https://github.com/serlo/frontend/):

- edusharingAsset: Embed an edusharing asset (e.g. an image) stored on the
  edu-sharing platform into the content. This can be used instead of the
  [frontend](https://github.com/serlo/frontend/) plugins image & video.
- serloInjection: Insert content from serlo.org using an iframe.

### LTI

Edu-sharing will launch the Serlo editor using a protocol called LTI. LTI is a
standard for communication between learning tools.

One important feature of LTI is that edu-sharing can share context with the
Serlo editor during the launch. For example, which user on edu-sharing opened
the Serlo editor. This becomes important when the user wants to embed an
edu-sharing asset within the Serlo editor. Here, the user should only be shown
assets that this user has permissions to access.

There are two instances where an LTI launch happens:

1. Edu-sharing launches the editor through LTI. Internally, this is handled by
   the library lti.js.
2. Serlo editor launches edu-sharing through LTI. This happens when the user
   wants to select an edu-sharing asset to embed. Internally, no library is used
   and the necessary endpoints are implemented in `src/backend/server.ts`.

For more details about LTI in the edu-sharing integration, see
https://github.com/serlo/documentation/wiki/LTI-integration-of-the-Serlo-Editor-in-edu-sharing

### Rendering

Content is rendered differently depending on if it is editable:

- In edit mode: The whole editor code is loaded and renders the content. The
  content is stored in the redux store alongside other information like the edit
  history.
- In view mode: A separate renderer is used that is more lightweight compared to
  the editor code. Content is passed as parameter and there is no redux store.

### Storage format

`src/shared/storage-format/index.ts` shows the schema for how content created
with the editor is saved on the edu-sharing platform.

### Interface between serlo-editor-for-edusharing and edu-sharing

The edu-sharing docker containers and the Serlo editor docker container
communicate about:

- Messages in the LTI protocol
- Getting and saving content

See `src/backend/server.ts` and the LTI wiki page for details.

### Docker image

See `Dockerfile` for details about how the docker image is built and how the
docker container works internally.

## Releasing a new version

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
