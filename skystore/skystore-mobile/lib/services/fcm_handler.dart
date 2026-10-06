import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

/// معالج إشعارات الخلفية المستقل عند إغلاق التطبيق أو وجوده في الخلفية
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint("📩 [FCM Background] استلام إشعار في الخلفية: ${message.messageId}");
  debugPrint("العنوان: ${message.notification?.title}");
  debugPrint("المحتوى: ${message.notification?.body}");
  debugPrint("البيانات الإضافية: ${message.data}");
}

class FcmHandler {
  static final FcmHandler _instance = FcmHandler._internal();
  factory FcmHandler() => _instance;
  FcmHandler._internal();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  String? _fcmToken;

  String? get fcmToken => _fcmToken;

  /// تهيئة إعدادات FCM وطلب الأذونات والاستماع للأحداث
  Future<void> initialize({
    Function(RemoteMessage)? onForegroundMessage,
    Function(RemoteMessage)? onNotificationOpened,
  }) async {
    try {
      // 1. طلب أذونات الإشعارات على منصات iOS و Android 13+
      NotificationSettings settings = await _fcm.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      debugPrint('حالة إذن الإشعارات: ${settings.authorizationStatus}');

      // 2. تعيين معالج الخلفية
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      // 3. استخراج رمز الجهاز المميز (FCM Device Token)
      _fcmToken = await _fcm.getToken();
      debugPrint("🔑 رمز FCM للجهاز: $_fcmToken");

      // 4. الاستماع للإشعارات في الواجهة الأمامية (Foreground)
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint("🔔 [FCM Foreground] استلام إشعار أثناء فتح التطبيق: ${message.notification?.title}");
        if (onForegroundMessage != null) {
          onForegroundMessage(message);
        }
      });

      // 5. الاستماع للنقر على الإشعار وفتح التطبيق من شريط الحالة
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint("📲 [FCM Clicked] تم النقر على الإشعار: ${message.data}");
        if (onNotificationOpened != null) {
          onNotificationOpened(message);
        }
      });

      // التحقق من فتح التطبيق من حالة إغلاق تامة عبر إشعار (Terminated State)
      RemoteMessage? initialMessage = await _fcm.getInitialMessage();
      if (initialMessage != null && onNotificationOpened != null) {
        onNotificationOpened(initialMessage);
      }
    } catch (e) {
      debugPrint("⚠️ تحذير: تعذر استكمال تهيئة FCM (قد يتطلب google-services.json): $e");
    }
  }

  /// الاشتراك في إشعارات طلبات مستخدم معين
  Future<void> subscribeToUserTopic(String userId) async {
    try {
      await _fcm.subscribeToTopic('user_$userId');
      debugPrint("✅ تم الاشتراك في موضوع المستخدم: user_$userId");
    } catch (e) {
      debugPrint("خطأ أثناء الاشتراك في الموضوع: $e");
    }
  }

  /// الاشتراك في تتبع مسار شحنة معينة
  Future<void> subscribeToShipmentTopic(String trackingNumber) async {
    try {
      await _fcm.subscribeToTopic('shipment_$trackingNumber');
      debugPrint("✅ تم الاشتراك في تتبع الشحنة: shipment_$trackingNumber");
    } catch (e) {
      debugPrint("خطأ أثناء الاشتراك في موضوع الشحنة: $e");
    }
  }

  /// إلغاء الاشتراك في تتبع شحنة
  Future<void> unsubscribeFromShipmentTopic(String trackingNumber) async {
    try {
      await _fcm.unsubscribeFromTopic('shipment_$trackingNumber');
      debugPrint("تم إلغاء الاشتراك في تتبع الشحنة: shipment_$trackingNumber");
    } catch (e) {
      debugPrint("خطأ أثناء إلغاء الاشتراك: $e");
    }
  }
}
