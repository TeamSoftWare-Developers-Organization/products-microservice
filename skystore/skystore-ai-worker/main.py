import os
import json
import logging
import pika
from model import FraudDetector
from recommendation_engine import RecommendationEngine

logging.basicConfig(level=logging.INFO, format="%(asctime)s - [%(levelname)s] - %(message)s")

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', '5673'))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'sky_admin')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS', 'sky_admin_pass')
EXCHANGE_NAME = os.getenv('EXCHANGE_NAME', 'orders.exchange')
QUEUE_NAME = os.getenv('QUEUE_NAME', 'ai.fraud.queue')
ROUTING_KEY = os.getenv('ROUTING_KEY', 'order.created')
RECOMMENDATION_QUEUE = os.getenv('RECOMMENDATION_QUEUE', 'ai.recommendations.queue')
FRAUD_THRESHOLD = 0.75

detector = FraudDetector()
recommender = RecommendationEngine()

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

def on_recommendation_requested(ch, method, properties, body):
    try:
        payload = json.loads(body.decode('utf-8'))
        user_id = payload.get("userId")
        purchased_ids = payload.get("purchasedIds", [])

        # استخراج التوصيات
        recs = recommender.recommend_for_user([
            recommender.product_catalog[pid]["vector"]
            for pid in purchased_ids if pid in recommender.product_catalog
        ])

        # إعادة التوصيات عبر الـ Reply-To الخاص بـ RabbitMQ
        response = json.dumps({"userId": user_id, "recommendations": recs})
        if properties.reply_to:
            ch.basic_publish(
                exchange='',
                routing_key=properties.reply_to,
                properties=pika.BasicProperties(correlation_id=properties.correlation_id),
                body=response
            )
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        logging.error(f"خطأ أثناء استخراج التوصيات: {str(e)}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def start_worker():
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()

    # الإعلان عن الـ Exchange والـ Queue وربطهما لمكافحة الاحتيال
    channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type='topic', durable=True)
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.queue_bind(exchange=EXCHANGE_NAME, queue=QUEUE_NAME, routing_key=ROUTING_KEY)

    # الإعلان عن طابور التوصيات
    channel.queue_declare(queue=RECOMMENDATION_QUEUE, durable=True)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE_NAME, on_message_callback=on_order_received)
    channel.basic_consume(queue=RECOMMENDATION_QUEUE, on_message_callback=on_recommendation_requested)

    logging.info(f"🤖 AI Worker (Fraud & Recommendations) قيد التشغيل ويستمع للأحداث على {RABBITMQ_HOST}:{RABBITMQ_PORT}...")
    channel.start_consuming()

if __name__ == '__main__':
    start_worker()
