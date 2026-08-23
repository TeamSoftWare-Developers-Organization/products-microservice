# المرحلة الأولى: البناء (Build)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
RUN npm install --omit=dev --legacy-peer-deps

# المرحلة الثانية: التشغيل (Production - Distroless)
FROM gcr.io/distroless/nodejs20-debian11
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

CMD ["dist/main.js"]

