import os
import json
import logging
import pika
from model import FraudDetector

logging.basicConfig(level=logging.INFO, format="%(asctime)s - [%(levelname)s] - %(message)s")

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', '5673'))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'sky_admin')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS', 'sky_admin_pass')
EXCHANGE_NAME = os.getenv('EXCHANGE_NAME', 'orders.exchange')
QUEUE_NAME = os.getenv('QUEUE_NAME', 'ai.fraud.queue')
ROUTING_KEY = os.getenv('ROUTING_KEY', 'order.created')
FRAUD_THRESHOLD = 0.75

detector = FraudDetector()

def on_order_received(ch, method, properties, body):
    try:
        order_event = json.loads(body.decode('utf-8'))
        order_id = order_event.get('orderId')
        user_id = order_event.get('userId')
        total_amount = float(order_event.get('totalAmount', 0.0))
        items = order_event.get('items', [])
        total_items = sum(item.get('quantity', 1) for item in items)

        # استخراج درجة الخطورة من نموذج TensorFlow
        risk_score = detector.predict_risk(total_amount, total_items)
        logging.info(f"Order #{order_id} (User: {user_id}) -> Total: ${total_amount}, Items: {total_items}, Risk Score: {risk_score:.4f}")

        if risk_score >= FRAUD_THRESHOLD:
            logging.warning(f"🚨 تحذير أمني: اشتباه احتيال في الطلب #{order_id}! درجة الخطورة: {risk_score:.2f}")
            # يمكن هنا إرسال حدث جديد لـ RabbitMQ لإيقاف المعالجة أو إرسال إشعار للمسؤول
        else:
            logging.info(f"✅ الطلب #{order_id} آمن.")

        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        logging.error(f"خطأ أثناء معالجة الحدث: {str(e)}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def start_worker():
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()

    # الإعلان عن الـ Exchange والـ Queue وربطهما
    channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type='topic', durable=True)
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.queue_bind(exchange=EXCHANGE_NAME, queue=QUEUE_NAME, routing_key=ROUTING_KEY)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE_NAME, on_message_callback=on_order_received)

    logging.info(f"🤖 AI Fraud Worker قيد التشغيل ويستمع للأحداث على {RABBITMQ_HOST}:{RABBITMQ_PORT}...")
    channel.start_consuming()

if __name__ == '__main__':
    start_worker()
