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

COPY apps/web apps/web
COPY packages/contracts packages/contracts

RUN npm run build --workspace=@lostlink/web \
  && chown -R node:node /workspace/apps/web

WORKDIR /workspace/apps/web
ENV NODE_ENV=production
USER node

EXPOSE 4173

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:4173/').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1))"

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
