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

COPY services/api-gateway services/api-gateway
COPY packages/contracts packages/contracts

RUN npm run build --workspace=@lostlink/api-gateway

WORKDIR /workspace/services/api-gateway
ENV NODE_ENV=production
USER node

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/health/live').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1))"

CMD ["node", "dist/main.js"]
