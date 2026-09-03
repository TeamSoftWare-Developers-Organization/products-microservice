#!/bin/bash
echo "🛑 Stopping all Microservices Shop containers..."
podman rm -f auth-db products-db orders-db payment-db shipping-db warehouse-db rabbitmq minio zipkin auth-ms products-ms cart-ms orders-ms payment-ms shipping-ms warehouse-ms notification-ms api-gateway-ms nginx-proxy frontend microshop-tunnel 2>/dev/null || true
echo "✅ All containers stopped and removed."
