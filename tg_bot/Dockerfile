FROM node:22-bookworm-slim AS builder

WORKDIR /app/tg_bot

COPY tg_bot/package.json tg_bot/package-lock.json ./
RUN npm ci

COPY tg_bot/ ./

RUN npm run build


FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY tg_bot/package.json tg_bot/package-lock.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/tg_bot/dist ./dist

CMD ["node", "dist/index.js"]