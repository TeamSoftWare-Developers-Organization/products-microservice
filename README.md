# 🛒 SkyStore - المنظومة السحابية المتكاملة للتجارة الإلكترونية (Enterprise E-Commerce Platform)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![GraphQL](https://img.shields.io/badge/API-GraphQL-E10098.svg?logo=graphql)](https://graphql.org/)
[![Rust](https://img.shields.io/badge/Engine-Rust%20gRPC-orange.svg?logo=rust)](https://www.rust-lang.org/)
[![Next.js](https://img.shields.io/badge/Web-Next.js%2015-black.svg?logo=next.js)](https://nextjs.org/)
[![Flutter](https://img.shields.io/badge/Mobile-Flutter-02569B.svg?logo=flutter)](https://flutter.dev/)
[![Docker](https://img.shields.io/badge/Orchestration-Docker%20Compose-2496ED.svg?logo=docker)](https://www.docker.com/)

منظومة تجارة إلكترونية متطورة وموزعة، مبنية بمعمارية **الخدمات المصغرة الهجينة (Polyglot Microservices)**، وتجمع بين قوة **Java (Spring Boot)**، وسرعة **Rust (gRPC)**، وذكاء **Python (AI Worker)**، مع واجهات ويب تفاعلية بـ **Next.js** وتطبيقات هواتف بـ **Flutter**.

---

## 🏛️ المعمارية العامة للنظام (Architecture Overview)

```mermaid
graph TD
    subgraph Clients["📱 واجهات المستخدم (Clients)"]
        Web["🌐 متجر الويب (Next.js + Apollo Client)"]
        Mobile["📱 تطبيق الهاتف (Flutter GraphQL)"]
    end

    subgraph Security["🛡️ الهوية والأمان (IAM)"]
        Keycloak["🔐 Keycloak (OAuth2 / OIDC :8080)"]
    end

    subgraph CoreBackend["⚙️ النواة الأساسية (Spring Boot Core)"]
        Gateway["🚀 SkyStore Core GraphQL API"]
        CartService["🛒 سلة المشتريات (Redis Caching)"]
        OrderService["📑 إدارة الطلبات والمخزون"]
        BatchService["⏱️ Spring Batch (مزامنة المخزون الدورية)"]
    end

    subgraph SpecializedEngines["⚡ الخدمات التخصصية"]
        RustEngine["🦀 Rust Image Engine (gRPC :50051)"]
        AIWorker["🧠 Python AI Recommendation Worker"]
    end

    subgraph Infrastructure["🗄️ البنية التحتية وقواعد البيانات"]
        MariaDB[("🗄️ MariaDB 11.4 (:3306)")]
        Redis[("⚡ Redis 7 Cache (:6380)")]
        RabbitMQ["🐇 RabbitMQ Event Bus (:5673)"]
        Prometheus["📊 Prometheus Metrics (:9090)"]
        Grafana["📈 Grafana Dashboard (:3001)"]
    end

    Clients -->|GraphQL / HTTP| Gateway
    Clients -->|Token Auth| Keycloak
    Gateway --> MariaDB
    Gateway --> CartService
    CartService --> Redis
    Gateway -->|gRPC Protobuf| RustEngine
    Gateway -->|Events: OrderPlaced| RabbitMQ
    RabbitMQ --> BatchService
    RabbitMQ --> AIWorker
    Prometheus --> Gateway
    Grafana --> Prometheus
🧩 المكونات والخدمات (Services Breakdown)
الخدمة / المكون	التقنية المستخدمة	الوصف والدور في المنظومة
skystore-core	Java 21 / Spring Boot 3 / GraphQL	النواة الأساسية: إدارة المنتجات، معالجة الطلبات، إدارة السلة، المصادقة عبر Keycloak، والوظائف المجدولة (Spring Batch).
skystore-rust-engine	Rust / Tonic (gRPC) / Tokio	محرك فائق السرعة مخصص لمعالجة الصور وضغطها وتعديل قياساتها عبر بروتوكول gRPC عالي الأداء.
skystore-common	Protocol Buffers (Proto3)	النماذج والعقود المشتركة (gRPC Contracts) لتبادل البيانات بسرعة فائقة بين خدمات النظام.
skystore-ai-worker	Python / PyTorch / FastAI	معالج ذكاء اصطناعي لتصنيف المنتجات وتوليد التوصيات الشخصية للمستخدمين.
skystore-frontend-web	Next.js / TypeScript / Apollo Client	واجهة مستخدم ويب حديثة ومتجاوبة مبنية لتوفير أعلى سرعة تصفح وتجربة مستخدم سلسة.
skystore-mobile	Flutter / Dart	تطبيق الهاتف المحمول (Android & iOS) المتصل بنفس واجهة الـ GraphQL.
infra & terraform	Docker Compose / Prometheus / Grafana	ملفات أتمتة البنية التحتية وإدارة الحاويات ومراقبة مؤشرات الأداء والـ Metrics في الوقت الفعلي.
🚀 دليل التشغيل السريع (Getting Started)
1. المتطلبات الأساسية (Prerequisites)
Java JDK 21+
Docker & Docker Compose
Node.js 20+
Rust Toolchain (اختياري لمحرك الصور)
Flutter SDK (اختياري لتطبيق الموبايل)
2. تشغيل البنية التحتية والخدمات المساندة
من مجلد المشروع:

bash


cd skystore
docker compose up -d
المنافذ والخدمات المشغلة:

MariaDB Database: localhost:3306
Keycloak IAM: localhost:8080 (المستخدم: admin / كلمة المرور: admin_secure_pass)
RabbitMQ Management: localhost:15673 (sky_admin / sky_admin_pass)
Redis Cache: localhost:6380
Grafana Dashboards: localhost:3001 (admin / admin_monitor_pass)
Prometheus Metrics: localhost:9090
3. تشغيل النواة الخلفية (Spring Boot Core)
bash


cd skystore/skystore-core
..\mvn.cmd spring-boot:run
واجهة اختبار الـ GraphQL التفاعلية (GraphiQL): http://localhost:8080/graphiql
4. تشغيل متجر الويب (Next.js Storefront)
bash


cd skystore/skystore-frontend-web
npm install
npm run dev
تصفح المتجر محلياً على: http://localhost:3000
🔒 الأمان والمراقبة (Security & Observability)
Authentication: تأمين نقاط النهاية والـ GraphQL Queries/Mutations عبر OAuth2 / JWT بواسطة Keycloak.
Metrics: جمع مؤشرات الأداء لحظياً عبر Spring Boot Actuator وتصديرها نحو Prometheus.
Visualization: شاشات مراقبة تفاعلية عبر Grafana لمتابعة استهلاك الموارد وحركة الطلبات.
Data Consistency: مزامنة ذكية للمخزون عبر Spring Batch تمنع تعارض الكميات أثناء الحمل العالي.


---
> [!TIP]
> بعد لصق المحتوى في الصفحة المفتوحة أمامك على المتصفح، انقر على الزر الأخضر في الأعلى **`Commit changes...`** ليتم حفظ الملف مباشرة في المستودع.
