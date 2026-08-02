FROM node:22-bookworm-slim AS common-builder

WORKDIR /app/vpn_common

COPY vpn_common/package.json vpn_common/package-lock.json ./
RUN npm ci

COPY vpn_common/ ./
RUN npm run build


FROM node:22-bookworm-slim AS backend-builder

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
COPY vpn_common/package.json vpn_common/package-lock.json ./vpn_common/

COPY --from=common-builder /app/vpn_common/dist ./vpn_common/dist

WORKDIR /app/backend

RUN npm ci

COPY backend/ ./

RUN npm run build


FROM node:22-bookworm-slim AS runtime

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
COPY vpn_common/package.json vpn_common/package-lock.json ./vpn_common/

COPY --from=common-builder /app/vpn_common/dist ./vpn_common/dist

WORKDIR /app/backend

# Пока устанавливаем и devDependencies,
# потому что sequelize-cli нужен для миграций.
RUN npm ci --include=dev

ENV NODE_ENV=production

COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/src/database ./src/database
COPY --from=backend-builder /app/backend/.sequelizerc ./.sequelizerc

# Архив агента нужен backend для установки на VPN-ноды.
COPY backend/storage ./storage

EXPOSE 5000

CMD ["node", "dist/index.js"]