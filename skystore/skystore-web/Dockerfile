# المرحلة 1: تثبيت الاعتماديات (Dependencies)
FROM oven/bun:alpine AS deps
WORKDIR /app

# نسخ ملفات تعريف الحزم وقفل Bun
COPY package.json bun.lock* patch-next-auth.js* ./
RUN bun install --frozen-lockfile

# المرحلة 2: بناء المشروع وتوليد ملفات الإنتاج (Builder)
FROM oven/bun:alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# بناء تطبيق Next.js باستخدام Bun
RUN bun run build

# المرحلة 3: بيئة التشغيل النهائية الخفيفة (Runner)
FROM oven/bun:alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# إضافة مستخدم غير جذري لتعزيز الأمان
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# نسخ مخرجات الـ Standalone والملفات الثابتة
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# تشغيل خادم الإنتاج عبر بيئة Bun
CMD ["bun", "run", "server.js"]
