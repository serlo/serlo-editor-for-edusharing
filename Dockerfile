FROM node:16-alpine as dependencies
LABEL stage=build
WORKDIR /usr/src/app
COPY public public
COPY yarn.lock .yarnrc.yml .
COPY .yarn .yarn
COPY package.minimal.json package.json
RUN yarn && yarn cache clean --all

FROM node:16-alpine as build
LABEL stage=build
WORKDIR /usr/src/app
COPY src src
COPY .eslintrc.json .
COPY next.config.mjs .
COPY next-env.d.ts .
COPY postcss.config.json .
COPY tailwind.config.cjs .
COPY tsconfig.json .
COPY scripts scripts
COPY .yarn .yarn
COPY yarn.lock package.json .yarnrc.yml .
RUN yarn --immutable
RUN yarn build
RUN yarn node scripts/esbuild.js

FROM dependencies as release
ENV NODE_ENV=production
COPY --from=build /usr/src/app/.next .next
COPY --from=build /usr/src/app/dist/ dist/

ENTRYPOINT ["node", "--experimental-modules", \
            "--experimental-specifier-resolution=node", \
            "--enable-source-maps", "dist/server.js"]
EXPOSE 3000
