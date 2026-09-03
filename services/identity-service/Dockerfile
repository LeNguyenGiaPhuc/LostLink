FROM node:24.19.0-bookworm-slim

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY services/api-gateway/package.json services/api-gateway/package.json
COPY services/identity-service/package.json services/identity-service/package.json
COPY services/lost-found-service/package.json services/lost-found-service/package.json
COPY services/matching-service/package.json services/matching-service/package.json
COPY packages/contracts/package.json packages/contracts/package.json

RUN npm ci --ignore-scripts

COPY services/identity-service services/identity-service
COPY packages/contracts packages/contracts

RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npm exec --workspace=@lostlink/identity-service -- prisma generate
RUN npm run build --workspace=@lostlink/identity-service

WORKDIR /workspace/services/identity-service
ENV NODE_ENV=production
USER node

EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3001/health/live').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1))"

CMD ["node", "dist/main.js"]
