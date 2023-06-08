# Based on https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY yarn.lock* ./
RUN yarn --frozen-lockfile;

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copy entire project to /app 
COPY . .

# Build nextjs app
RUN yarn build

# Build backend/server.ts server
RUN yarn node scripts/esbuild.js

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/ ./.next
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/dist/custom-server.mjs .

USER nextjs

ENTRYPOINT ["node", "--experimental-modules", \
            "--experimental-specifier-resolution=node", \
            "custom-server.mjs"]
EXPOSE 3000


# COPY yarn.lock package.json .yarnrc.yml /app/
# COPY .yarn .yarn
# RUN yarn --immutable
# COPY .eslintrc.json next.config.mjs next-env.d.ts postcss.config.cjs \
#      tailwind.config.cjs tsconfig.json /app/
# COPY src src
# COPY dep dep
# RUN yarn build
# COPY scripts scripts
# RUN yarn node scripts/esbuild.js

# FROM node:18-alpine as release
# WORKDIR /app
# ENV NODE_ENV=production
# RUN apk add git
# COPY public public
# RUN yarn add mongoose && yarn cache clean --all
# COPY package.json /app/
# COPY --from=build /app/.next/*json /app/.next/BUILD_ID .next/
# COPY --from=build /app/.next/static .next/static
# COPY --from=build /app/.next/server .next/server
# COPY --from=build /app/.next/standalone/node_modules node_modules
# COPY --from=build /app/.next/standalone/src src
# COPY --from=build /app/dist/ dist/
# RUN yarn

# ENTRYPOINT ["node", "--experimental-modules", \
#             "--experimental-specifier-resolution=node", \
#             "dist/server.js"]
# EXPOSE 3000
