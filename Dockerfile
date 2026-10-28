# Production Dockerfile for Pharma DMS Express + Prisma Backend
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm install --omit=dev
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

USER expressjs

EXPOSE 5001

CMD ["node", "dist/index.js"]
