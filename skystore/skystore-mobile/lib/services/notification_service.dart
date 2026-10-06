import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:stomp_dart_client/stomp.dart';
import 'package:stomp_dart_client/stomp_config.dart';
import 'package:stomp_dart_client/stomp_frame.dart';
import 'auth_service.dart';

class NotificationService {
  StompClient? _client;
  final String userId;
  final Function(Map<String, dynamic>) onNotificationReceived;

  NotificationService({
    required this.userId,
    required this.onNotificationReceived,
  });

  void connect() async {
    final token = await AuthService().getSavedToken();
    const brokerUrl = 'wss://api.skystore.local/ws/websocket';

    _client = StompClient(
      config: StompConfig(
        url: brokerUrl,
        onConnect: _onConnect,
        webSocketConnectHeaders: {
          if (token != null) 'Authorization': 'Bearer $token',
        },
        stompConnectHeaders: {
          if (token != null) 'Authorization': 'Bearer $token',
        },
        onWebSocketError: (error) => debugPrint('WS Error: $error'),
        onStompError: (frame) => debugPrint('STOMP Error: ${frame.body}'),
        reconnectDelay: const Duration(seconds: 5),
      ),
    );

    _client?.activate();
  }

  void _onConnect(StompFrame frame) {
    debugPrint('✅ متصل بخادم الإشعارات');
    
    // الاشتراك في قناة المستخدم المحددة في الـ Backend
    _client?.subscribe(
      destination: '/user/$userId/queue/notifications',
      callback: (frame) {
        if (frame.body != null) {
          final data = jsonDecode(frame.body!) as Map<String, dynamic>;
          onNotificationReceived(data);
        }
      },
    );
  }

  void disconnect() {
    _client?.deactivate();
  }
}
