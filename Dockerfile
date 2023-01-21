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
COPY tailwind.config.cjs .
COPY tsconfig.json .
RUN yarn build
RUN yarn tsc -p tsconfig.server.json

FROM dependencies as release
ENV NODE_ENV=production
COPY --from=build /usr/src/app/.next .next
COPY --from=build /usr/src/app/src/backend/server.js src/backend/server.js
COPY --from=build /usr/src/app/src/server-utils.js src/server-utils.js
COPY --from=build /usr/src/app/src/shared src/shared

ENTRYPOINT ["node", "--experimental-modules", "--experimental-specifier-resolution=node", "src/backend/server.js"]
EXPOSE 3000
