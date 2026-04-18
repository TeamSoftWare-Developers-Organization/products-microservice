# المرحلة الأولى: البناء (Build)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# تثبيت تبعات الإنتاج لنسخها للحاوية الفارغة
RUN npm install --omit=dev

# المرحلة الثانية: التشغيل (Production - Distroless)
FROM gcr.io/distroless/nodejs20-debian11
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

CMD ["dist/main.js"]