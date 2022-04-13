FROM node:16 as dependencies
WORKDIR /usr/src/app
COPY .yarn .yarn
COPY .yarnrc.yml .
COPY package.json .
COPY yarn.lock .
RUN yarn --immutable --silent

FROM dependencies as build
COPY src src
COPY .eslintrc.json .
COPY next.config.js .
COPY next-env.d.ts .
COPY tsconfig.json .
RUN yarn build

FROM dependencies as release
COPY --from=build /usr/src/app/.next .next
WORKDIR /usr/src/app/packages/server
ENTRYPOINT ["yarn", "start"]
EXPOSE 3000
