# MicroStore Professional v2 🛍️🚀

منصة تجارة إلكترونية متكاملة مبنية بمعمارية الخدمات المصغرة (**Microservices Architecture**) والتقنيات الحديثة.

---

## 🏗️ المعمارية والخدمات (Architecture & Microservices)

المشروع مبني باستخدام **NestJS** للخدمات الخلفية و **Next.js 16** للواجهة الأمامية، مع استخدام **RabbitMQ** لتبادل الرسائل و **PostgreSQL** لكل خدمة بشكل منفصل (Database per Service pattern)، بالإضافة إلى **Redis** لإدارة سلة المشتريات و **MinIO** لتخزين الملفات.

| الخدمة | التقنية | الوصف | المنفذ |
| :--- | :--- | :--- | :--- |
| **API Gateway** | NestJS / Express | البوابة المركزية للتوجيه والتحقق من الهوية وCircuit Breaker | `8080` |
| **Auth Service** | NestJS + TypeORM | إدارة المستخدمين، المصادقة (JWT, Refresh Tokens) والصلاحيات | `3001` |
| **Products Service** | NestJS + TypeORM + MinIO | إدارة المنتجات والتصنيفات وتخزين الصور | `3002` |
| **Orders Service** | NestJS + TypeORM | إدارة وتتبع الطلبات وتكامل دورة حياة الطلب | `3003` |
| **Notification Service** | NestJS + WebSockets | الإشعارات اللحظية عبر الـ WebSockets وتكامل البريد | `3004` |
| **Shipping Service** | NestJS + TypeORM | تتبع الشحنات وحالات التوصيل | `3006` |
| **Cart Service** | NestJS + Redis | سلة المشتريات السريعة ومزامنة العناصر | `3007` |
| **Warehouse Service** | NestJS + TypeORM | إدارة المخزون، الحجز التلقائي وتحديث الكميات | `3008` |
| **Payment Service** | NestJS + TypeORM | معالجة المدفوعات والربط البنكي والمحاكاة | `3009` |
| **Frontend** | Next.js 16 + React 19 + Tailwind CSS | واجهة متجر تفاعلية ولوحة تحكم حديثة | `3000` |
| **Nginx Proxy** | Nginx Alpine | خادم وكيل عكسي للمنافذ والإشعارات | `8085` |

---

## 🚀 خط أنابيب التطوير والنشر المستمر (CI/CD Pipeline)

المشروع مجهز بسير عمل **GitHub Actions** متكامل في المسار:
`.github/workflows/ci-cd.yml`

### مراحل العمل (Pipeline Stages):
1. **CI - Backend**: فحص واختبار وبناء جميع خدمات المايكروسيرفس التسع بشكل متوازي (Matrix Strategy) على Node.js 22.
2. **CI - Frontend**: فحص البناء وتثبيت حزم Next.js والواجهة الأمامية.
3. **CI - K8s & Configs**: التحقق التلقائي من صحة ملفات Kubernetes وملفات Docker Compose.
4. **CD - Build & Push Docker Images**: بناء صور Docker لجميع الخدمات ودفعها تلقائياً إلى **GitHub Container Registry (`ghcr.io`)** عند الدفع لفرع `main` أو عند إضافة Release Tag.

---

## 💻 التشغيل المحلي (Local Deployment)

### 1. المتطلبات:
- Docker Desktop أو Podman مع Compose
- Node.js 20+

### 2. إعداد المتغيرات البيئية:
انسخ ملف الإعدادات واملأ القيم المطلوبة:
```bash
cp .env.example .env
```

### 3. التشغيل عبر Docker / Podman Compose:
```bash
# عبر Docker Compose
docker compose up -d --build

# أو عبر Podman (باستخدام السكربت المرفق)
./start_podman.sh
```

---

## ☸️ النشر على Kubernetes (K8s)

تتوفر جميع ملفات التوزيع في مجلد `k8s/`:
```bash
kubectl apply -f k8s/
```
تتضمن الإعدادات:
- Deployments & Services لجميع المايكروسيرفس
- StatefulSets / Deployments لقواعد البيانات و RabbitMQ و MinIO
- Horizontal Pod Autoscalers (HPA)
- Ingress Controller و Metrics Server
