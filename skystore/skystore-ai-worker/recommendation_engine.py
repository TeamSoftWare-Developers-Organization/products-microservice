import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class RecommendationEngine:
    def __init__(self):
        # مصفوفة تجريبية: المستخدمين مقابل المنتجات (User-Item Matrix)
        # الأعمدة تمثل تصنيفات/منتجات: [Electronics, Fashion, Home, Sports, Books]
        self.item_categories = ["Electronics", "Fashion", "Home", "Sports", "Books"]
        
        # ملفات سمات المنتجات (Product Profiles Vectorized)
        self.product_catalog = {
            101: {"name": "Pro Laptop", "vector": np.array([0.9, 0.1, 0.0, 0.1, 0.2])},
            102: {"name": "Wireless Headphones", "vector": np.array([0.8, 0.2, 0.0, 0.4, 0.1])},
            103: {"name": "Running Shoes", "vector": np.array([0.1, 0.7, 0.1, 0.9, 0.0])},
            104: {"name": "Coffee Maker", "vector": np.array([0.2, 0.0, 0.9, 0.1, 0.1])},
            105: {"name": "Python Clean Architecture Book", "vector": np.array([0.4, 0.0, 0.0, 0.0, 0.9])},
        }

    def recommend_for_user(self, user_purchase_history_vectors: list, top_k: int = 3) -> list:
        """
        توليد توصيات مخصصة بحساب متجه اهتمام المستخدم وتطبيق Cosine Similarity
        """
        if not user_purchase_history_vectors:
            # إعادة المنتجات الأكثر شيوعاً كافتراضي (Cold-start fallback)
            return [101, 102, 103][:top_k]

        # تجميع متجهات المنتجات السابقة لبناء متجه اهتمام المستخدم (User Taste Profile)
        user_profile = np.mean(user_purchase_history_vectors, axis=0).reshape(1, -1)
        
        scores = {}
        for p_id, data in self.product_catalog.items():
            item_vec = data["vector"].reshape(1, -1)
            sim_score = cosine_similarity(user_profile, item_vec)[0][0]
            scores[p_id] = sim_score

        # ترتيب المنتجات بناءً على أعلى درجات التشابه
        recommended_sorted = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return [item[0] for item in recommended_sorted[:top_k]]
