FROM node:16 as dependencies
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
COPY next.config.js .
COPY next-env.d.ts .
COPY postcss.config.js .
COPY public .
COPY server.js .
COPY tailwind.config.js .
COPY tsconfig.json .
RUN yarn build

FROM dependencies as release
COPY --from=build /usr/src/app/.next .next
COPY --from=build /usr/src/app/server.js server.js

ENTRYPOINT ["yarn", "start"]
EXPOSE 3000
