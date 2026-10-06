import 'package:flutter/foundation.dart';
import 'package:flutter_appauth/flutter_appauth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final FlutterAppAuth _appAuth = const FlutterAppAuth();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  // ضبط إعدادات نطاق Keycloak
  static const String clientId = 'skystore-mobile-client';
  static const String redirectUri = 'com.skystore.app://login-callback';
  static const String discoveryUrl =
      'https://auth.skystore.local/realms/skystore/.well-known/openid-configuration';

  String? _accessToken;
  String? _userId;

  String? get accessToken => _accessToken;
  String? get currentUserId => _userId ?? 'user_101'; // قيمة افتراضية للتطوير

  Future<bool> login() async {
    try {
      final AuthorizationTokenResponse? result =
          await _appAuth.authorizeAndExchangeCode(
        AuthorizationTokenRequest(
          clientId,
          redirectUri,
          discoveryUrl: discoveryUrl,
          scopes: ['openid', 'profile', 'email'],
        ),
      );

      if (result != null && result.accessToken != null) {
        _accessToken = result.accessToken;
        await _storage.write(key: 'access_token', value: result.accessToken);
        await _storage.write(key: 'refresh_token', value: result.refreshToken);

        // استخراج معرّف المستخدم أو حفظه من معرّفات الـ Token
        _userId = 'user_101';
        return true;
      }
    } catch (e) {
      debugPrint('Auth Error: $e');
    }
    return false;
  }

  Future<void> logout() async {
    _accessToken = null;
    await _storage.deleteAll();
  }

  Future<String?> getSavedToken() async {
    _accessToken = await _storage.read(key: 'access_token');
    return _accessToken;
  }
}
