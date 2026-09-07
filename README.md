# 🛒 MicroStore - Enterprise Event-Driven E-Commerce Microservices Platform

منظومة تجارة إلكترونية متكاملة مبنية بمعمارية **الخدمات المصغرة (Microservices Architecture)** وموجهة بالأحداث (**Event-Driven**) باستخدام **NestJS**، **Next.js 16 (App Router)**، **RabbitMQ**، **Redis**، **PostgreSQL**، و **OpenTelemetry / Zipkin** مع نظام تعافٍ ذاتي وأتمتة شاملة عبر **n8n**.

---

## 🏛️ المعمارية العامة للنظام (System Architecture)

```mermaid
graph TD
    Client["🌐 Next.js Frontend (Vercel)"] -->|HTTPS / WSS| Gateway["🚪 API Gateway (:8085)"]
    
    subgraph "Core Microservices"
        Gateway --> Auth["🔐 Auth Service (:3001)"]
        Gateway --> Products["📦 Products Service (:3002)"]
        Gateway --> Orders["📑 Orders Service (:3003)"]
        Gateway --> Warehouse["🏭 Warehouse Service (:3008)"]
        Gateway --> Shipping["🚚 Shipping Service (:3006)"]
        Gateway --> Payment["💳 Payment Service (:3009)"]
        Gateway --> Cart["🛒 Cart Service (:3007)"]
    end

    subgraph "Messaging & Cache & Tracing"
        RMQ["🐇 RabbitMQ Event Bus (:5672)"]
        Redis["⚡ Redis Cache (:6379)"]
        Zipkin["🔍 Zipkin Distributed Tracing (:9411)"]
    end

    Orders -.->|order.confirmed| RMQ
    RMQ -.->|order.confirmed| Shipping
    RMQ -.->|stock.reserve| Warehouse
    Cart <--> Redis
    Shipping --> Zipkin
    Orders --> Zipkin
