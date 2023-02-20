FROM node:18-alpine as build
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

FROM node:18-alpine as release
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY public public
RUN yarn add mongoose && yarn cache clean --all
COPY package.json .
COPY --from=build /usr/src/app/.next/*json /usr/src/app/.next/BUILD_ID .next/
COPY --from=build /usr/src/app/.next/static .next/static
COPY --from=build /usr/src/app/.next/server .next/server
COPY --from=build /usr/src/app/.next/standalone/node_modules node_modules
COPY --from=build /usr/src/app/.next/standalone/src src
COPY --from=build /usr/src/app/dist/ dist/

ENTRYPOINT ["node", "--experimental-modules", \
            "--experimental-specifier-resolution=node", \
            "dist/server.js"]
EXPOSE 3000
