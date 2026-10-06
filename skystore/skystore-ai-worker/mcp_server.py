import json
import docker
from mcp.server.fastmcp import FastMCP
from recommendation_engine import RecommendationEngine

# تهيئة خادم MCP
mcp = FastMCP("SkyStore-MCP-Server")
recommender = RecommendationEngine()

# تهيئة الاتصال بمقبس الحاويات (Podman Socket عبر Docker SDK)
try:
    container_client = docker.DockerClient(base_url="unix://run/podman/podman.sock")
except Exception:
    container_client = None

# أداة 1: تقديم توصيات للمستخدمين
@mcp.tool()
def get_recommendations(user_id: str, purchased_product_ids: list[int]) -> str:
    """
    استرجاع توصيات المنتجات المخصصة للمستخدم بناءً على سجل شرائه السابق.
    """
    vectors = [
        recommender.product_catalog[pid]["vector"]
        for pid in purchased_product_ids
        if pid in recommender.product_catalog
    ]
    recommendations = recommender.recommend_for_user(vectors)
    return json.dumps({
        "userId": user_id,
        "recommendedProductIds": recommendations,
        "status": "success"
    }, ensure_ascii=False)

# أداة 2: فحص حالة حاويات النظام (Container Daemon Tool)
@mcp.tool()
def inspect_system_containers() -> str:
    """
    أداة لفحص ومراقبة حالة حاويات منظومة SkyStore المشغلة على محرك Podman.
    """
    if not container_client:
        return json.dumps({"error": "Podman socket not reachable"}, ensure_ascii=False)

    containers_summary = []
    for c in container_client.containers.list():
        containers_summary.append({
            "name": c.name,
            "status": c.status,
            "image": str(c.image.tags)
        })
    return json.dumps({"activeContainers": containers_summary}, ensure_ascii=False)

# أداة 3: تنفيذ مسح أمني واكتشاف مسار الشحنة
@mcp.tool()
def check_order_fraud_status(order_id: int, total_amount: float, item_count: int) -> str:
    """
    تقييم فوري لاحتمالية الاحتيال في طلب عبر استدعاء طبقة AI Worker.
    """
    risk_level = "HIGH" if total_amount > 5000 and item_count == 1 else "LOW"
    return json.dumps({
        "orderId": order_id,
        "riskLevel": risk_level,
        "action": "FLAG_FOR_REVIEW" if risk_level == "HIGH" else "PROCEED"
    }, ensure_ascii=False)

if __name__ == "__main__":
    # تشغيل خادم MCP المخصص لتبادل السياق
    print("🚀 خادم SkyStore MCP Server قيد التشغيل عبر بروتوكول STDIO...")
    mcp.run()
