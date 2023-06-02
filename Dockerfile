FROM node:18-alpine as build
LABEL stage=build
WORKDIR /app
COPY yarn.lock package.json .yarnrc.yml /app/
COPY .yarn .yarn
RUN yarn --immutable
COPY .eslintrc.json next.config.mjs next-env.d.ts postcss.config.cjs \
     tailwind.config.cjs tsconfig.json /app/
COPY src src
RUN yarn build
COPY scripts scripts
RUN yarn node scripts/esbuild.js

FROM node:18-alpine as release
WORKDIR /app
ENV NODE_ENV=production
COPY public public
RUN yarn add mongoose && yarn cache clean --all
COPY package.json /app/
COPY --from=build /app/.next/*json /app/.next/BUILD_ID .next/
COPY --from=build /app/.next/static .next/static
COPY --from=build /app/.next/server .next/server
COPY --from=build /app/.next/standalone/node_modules node_modules
COPY --from=build /app/.next/standalone/src src
COPY --from=build /app/dist/ dist/

ENTRYPOINT ["node", "--experimental-modules", \
            "--experimental-specifier-resolution=node", \
            "dist/server.js"]
EXPOSE 3000
