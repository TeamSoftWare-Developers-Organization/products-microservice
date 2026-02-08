# استخدم صورة Node.js رسمية كقاعدة للبناء
FROM node:20-alpine AS build

# تعيين دليل العمل داخل الحاوية
WORKDIR /usr/src/app

# نسخ ملفات تعريف الحزم (للاستفادة من التخزين المؤقت لـ Docker)
COPY package*.json ./

# تثبيت التبعيات (الاعتمادات)
RUN npm install --legacy-peer-deps
# واستبدله بهذا السطر:

# نسخ باقي ملفات المشروع (الشفرة المصدرية)
COPY . .

# تشغيل عملية بناء مشروع Nest.js (تحويل TypeScript إلى JavaScript)
RUN npm run build

# --- مرحلة الإنتاج (Production Stage) ---

# استخدم صورة أصغر وأكثر أمانًا للإنتاج (لتقليل حجم الحاوية)
FROM node:20-alpine

# تعيين دليل العمل
WORKDIR /usr/src/app

# نسخ ملفات تعريف الحزم مرة أخرى
COPY package*.json ./

# تثبيت الحزم المطلوبة للإنتاج فقط (أسرع وأصغر)
RUN npm install --omit=dev --legacy-peer-deps
# واستبدله بهذا السطر:

# نسخ الشفرة المترجمة من مرحلة البناء
COPY --from=build /usr/src/app/dist ./dist

# تعريف المنفذ الذي سيتم استخدامه (المنفذ الافتراضي لـ Nest.js هو 3000)
EXPOSE 3000

# أمر بدء تشغيل التطبيق عند تشغيل الحاوية
CMD [ "node", "dist/main" ]