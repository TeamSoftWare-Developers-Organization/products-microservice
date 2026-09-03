#!/bin/bash
set -e

echo "🚀 Starting Microservices Shop via Podman..."

# 1. Create Podman network if not exists
podman network exists microshop-net || podman network create microshop-net

# 2. Cleanup existing containers and pods
echo "🧹 Cleaning up previous containers..."
podman rm -fa 2>/dev/null || true

# 3. Start Databases
echo "📦 Starting Databases..."
podman run -d --replace --restart always --name auth-db --net microshop-net --network-alias auth-db -p 5432:5432 -e POSTGRES_DB=auth_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=zafer4519932093 postgres:16-alpine
podman run -d --replace --restart always --name products-db --net microshop-net --network-alias products-db -p 5433:5432 -e POSTGRES_DB=products_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=zafer4519932093 postgres:16-alpine
podman run -d --replace --restart always --name orders-db --net microshop-net --network-alias orders-db -p 5434:5432 -e POSTGRES_DB=orders_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=zafer4519932093 postgres:16-alpine
podman run -d --replace --restart always --name payment-db --net microshop-net --network-alias payment-db -p 5435:5432 -e POSTGRES_DB=payment_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=zafer4519932093 postgres:16-alpine
podman run -d --replace --restart always --name shipping-db --net microshop-net --network-alias shipping-db -p 5436:5432 -e POSTGRES_DB=shipping_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=zafer4519932093 postgres:16-alpine
podman run -d --replace --restart always --name warehouse-db --net microshop-net --network-alias warehouse-db -p 5437:5432 -e POSTGRES_DB=warehouse_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=zafer4519932093 postgres:16-alpine

# 4. Start Infrastructure Services
echo "⚙️ Starting Infrastructure (RabbitMQ, Redis, MinIO, Zipkin, n8n)..."
podman run -d --replace --restart always --name rabbitmq --net microshop-net --network-alias rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management-alpine
podman run -d --replace --restart always --name cart-redis --net microshop-net --network-alias cart-redis -p 6379:6379 redis:7-alpine
podman run -d --replace --restart always --name minio --net microshop-net --network-alias minio -p 9000:9000 -p 9001:9001 -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin quay.io/minio/minio:latest server /data --console-address ":9001"
podman run -d --replace --restart always --name zipkin --net microshop-net --network-alias zipkin -p 9411:9411 openzipkin/zipkin:latest
podman run -d --replace --restart always --name n8n --net microshop-net --network-alias n8n -p 5678:5678 -e N8N_HOST=localhost -e N8N_PORT=5678 -e N8N_PROTOCOL=http -e NODE_ENV=production -e GENERIC_TIMEZONE=Africa/Tripoli -v n8n_data:/home/node/.n8n docker.io/n8nio/n8n:latest

echo "⏳ Waiting 6 seconds for databases and broker initialization..."
sleep 6

# 5. Start Microservices
echo "🌐 Starting Microservices..."
podman run -d --replace --restart always --name auth-ms --net microshop-net --network-alias auth-ms -p 3001:3001 -e NODE_ENV=production -e DATABASE_HOST=auth-db -e DATABASE_NAME=auth_db -e DATABASE_USER=postgres -e DATABASE_PASSWORD=zafer4519932093 -e RABBITMQ_URL=amqp://rabbitmq:5672 -e JWT_SECRET=super_secret_key_123 products-microservice-auth-ms
podman run -d --replace --restart always --name products-ms --net microshop-net --network-alias products-ms -p 3002:3002 -e NODE_ENV=production -e DATABASE_HOST=products-db -e DATABASE_NAME=products_db -e DATABASE_USER=postgres -e DATABASE_PASSWORD=zafer4519932093 -e RABBITMQ_URL=amqp://rabbitmq:5672 -e ZIPKIN_URL=http://zipkin:9411/api/v2/spans -e MINIO_ENDPOINT=minio -e MINIO_PORT=9000 -e MINIO_ACCESS_KEY=minioadmin -e MINIO_SECRET_KEY=minioadmin -e S3_BUCKET_NAME=products products-microservice-products-ms
podman run -d --replace --restart always --name cart-ms --net microshop-net --network-alias cart-ms -p 3007:3007 -e NODE_ENV=production -e REDIS_HOST=cart-redis -e RABBITMQ_URL=amqp://rabbitmq:5672 -e PORT=3007 products-microservice-cart-ms
podman run -d --replace --restart always --name orders-ms --net microshop-net --network-alias orders-ms -p 3003:3003 -e NODE_ENV=production -e DATABASE_HOST=orders-db -e DATABASE_NAME=orders_db -e DATABASE_USER=postgres -e DATABASE_PASSWORD=zafer4519932093 -e RABBITMQ_URL=amqp://rabbitmq:5672 -e ZIPKIN_URL=http://zipkin:9411/api/v2/spans products-microservice-orders-ms
podman run -d --replace --restart always --name payment-ms --net microshop-net --network-alias payment-ms -p 3009:3009 -e NODE_ENV=production -e DATABASE_HOST=payment-db -e DATABASE_NAME=payment_db -e DATABASE_USER=postgres -e DATABASE_PASSWORD=zafer4519932093 -e RABBITMQ_URL=amqp://rabbitmq:5672 products-microservice-payment-ms
podman run -d --replace --restart always --name shipping-ms --net microshop-net --network-alias shipping-ms -p 3006:3006 -e NODE_ENV=production -e DATABASE_HOST=shipping-db -e DATABASE_NAME=shipping_db -e DATABASE_USER=postgres -e DATABASE_PASSWORD=zafer4519932093 -e RABBITMQ_URL=amqp://rabbitmq:5672 products-microservice-shipping-ms
podman run -d --replace --restart always --name warehouse-ms --net microshop-net --network-alias warehouse-ms -p 3008:3008 -e NODE_ENV=production -e DATABASE_HOST=warehouse-db -e DATABASE_NAME=warehouse_db -e DATABASE_USER=postgres -e DATABASE_PASSWORD=zafer4519932093 -e RABBITMQ_URL=amqp://rabbitmq:5672 products-microservice-warehouse-ms
podman run -d --replace --restart always --name notification-ms --net microshop-net --network-alias notification-ms -p 3004:3004 -e NODE_ENV=production -e RABBITMQ_URL=amqp://rabbitmq:5672 -e ZIPKIN_URL=http://zipkin:9411/api/v2/spans products-microservice-notification-ms
podman run -d --replace --restart always --name api-gateway-ms --net microshop-net --network-alias api-gateway-ms -p 8080:8080 -e NODE_ENV=production products-microservice-api-gateway-ms

echo "⏳ Waiting 6 seconds for microservices to bind ports..."
sleep 6

# 6. Start Gateway, Nginx, Frontend & Cloudflare Tunnel
echo "🖥️ Starting Nginx, Frontend & Cloudflare Tunnel..."
podman run -d --replace --restart always --name nginx-proxy --net microshop-net --network-alias nginx-proxy -p 8085:80 -v /mnt/e/products-microservice/nginx/nginx.conf:/etc/nginx/nginx.conf:ro nginx:1.27-alpine
podman run -d --replace --restart always --name frontend --net microshop-net --network-alias frontend -p 3000:3000 -e NODE_ENV=production -e INTERNAL_API_URL=http://api-gateway-ms:8080 -e NEXT_PUBLIC_API_URL=http://localhost:8080/api products-microservice-frontend
podman run -d --replace --restart always --name microshop-tunnel --net microshop-net cloudflare/cloudflared:latest tunnel --protocol http2 run --token eyJhIjoiMTYxNjQ2NGUxMGQxM2U0MjZkYWJkODc2ZDEzMGNlYmEiLCJ0IjoiNTZjM2Y0NWYtYTQxZS00NTczLWE1YmUtYjIwOThlNWQxMzU0IiwicyI6Ik5qYzRaamxtWmpRdE9EWTNOQzAwWTJOakxXRmtPREV0TlRRM1lqVTBPV1E1WWpCbCJ9

echo "✅ All services successfully launched via Podman!"
podman ps
