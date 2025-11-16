FROM node:20-alpine

WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY apps/ws-backend ./apps/ws-backend

COPY packages/db ./packages/db
COPY packages/backend-common ./packages/backend-common
COPY packages/typescript-config ./packages/typescript-config

RUN pnpm install --frozen-lockfile

RUN pnpm run db:generate

RUN pnpm -F ws-backend build

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["pnpm", "--dir", "apps/ws-backend", "start"]
