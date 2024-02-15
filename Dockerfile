# Builds: 
# 1) Next.js app 
# 2) Custom server `src/backend/server.ts` (https://nextjs.org/docs/pages/building-your-application/configuring/custom-server)
# 
# Note: Next.js standalone build is not used because it lead to nasty dependency issues/complications. 
# When using a standalone build `next build` will output a size-optimized build containing only the dependencies that are actually used. However, this does NOT include the dependencies our custom server needs. Adding those separately or building the custom server with the dependencies baked in lead to issues. To solve this, we do not create a standalone build and use just one unoptimized node_modules folder for both the next.js app and the custom server.
#
# Dockerfile based in part on:
# - https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
# - https://dev.to/otomato_io/how-to-optimize-production-docker-images-running-nodejs-with-yarn-504b


FROM node:18-alpine AS build

WORKDIR /app

# Copy entire project to /app except files specified in .dockerignore
COPY . .

RUN yarn --immutable --immutable-cache

# Build nextjs app
RUN yarn build

# Build backend/server.ts server
RUN yarn node scripts/esbuild.js



# Production image
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy relevant output files from `build` stage
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/ ./.next
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=build --chown=nextjs:nodejs /app/dist/custom-server.mjs .

USER nextjs

ENTRYPOINT ["node", "--experimental-modules", \
  "--experimental-specifier-resolution=node", \
  "custom-server.mjs"]
EXPOSE 3000