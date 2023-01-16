FROM node:16-alpine as dependencies
LABEL stage=build
WORKDIR /usr/src/app
COPY .yarn .yarn
COPY .yarnrc.yml .
COPY package.json .
COPY yarn.lock .
RUN yarn --immutable --silent

FROM dependencies as build
LABEL stage=build
COPY src src
COPY .eslintrc.json .
COPY next.config.mjs .
COPY next-env.d.ts .
COPY tsconfig.server.json .
COPY postcss.config.json .
COPY public .
COPY server.ts .
COPY tailwind.config.cjs .
COPY tsconfig.json .
RUN yarn build
RUN yarn tsc -p tsconfig.server.json

FROM dependencies as release
COPY --from=build /usr/src/app/.next .next
COPY --from=build /usr/src/app/server.js server.js
COPY --from=build /usr/src/app/src/server-utils.js src/server-utils.js
COPY --from=build /usr/src/app/src/utils/decoders.js src/utils/decoders.js

ENTRYPOINT ["yarn", "start:in-docker-container"]
EXPOSE 3000
