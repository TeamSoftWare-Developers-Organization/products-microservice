import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

class FraudDetector:
    def __init__(self):
        # بناء نموذج مصغر للتصنيف الثنائي (0: آمن، 1: مشبوه/احتيال)
        self.model = keras.Sequential([
            layers.Input(shape=(3,)),                      # [total_amount, total_items, avg_item_price]
            layers.Dense(16, activation='relu'),
            layers.Dense(8, activation='relu'),
            layers.Dense(1, activation='sigmoid')
        ])
        self.model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        
        # تهيئة الأوزان وتدريب مبدئي بسيط للمحاكاة
        self._initialize_dummy_weights()

    def _initialize_dummy_weights(self):
        # محاكاة لتدريب أولي
        X_train = np.array([
            [15.0, 1, 15.0],
            [120.0, 3, 40.0],
            [9500.0, 15, 633.0],
            [8000.0, 1, 8000.0]
        ], dtype=np.float32)
        y_train = np.array([0, 0, 1, 1], dtype=np.float32)
        self.model.fit(X_train, y_train, epochs=5, verbose=0)

    def predict_risk(self, total_amount: float, total_items: int) -> float:
        avg_price = total_amount / max(total_items, 1)
        features = np.array([[total_amount, total_items, avg_price]], dtype=np.float32)
        risk_score = float(self.model.predict(features, verbose=0)[0][0])
        return risk_score
