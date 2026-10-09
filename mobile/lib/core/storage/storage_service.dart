import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/auth_session.dart';

class StorageService {
  static final StorageService instance = StorageService._();
  StorageService._();
  factory StorageService() => instance;

  static const _sessionKey = 'wayfinder_auth_session';
  static const _languageKey = 'wayfinder_language';
  static const _themeModeKey = 'wayfinder_theme_mode';
  static const _customBaseUrlKey = 'wayfinder_custom_base_url';

  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  // --- Auth Session (Secure Storage) ---

  Future<void> saveSession(AuthSession session) async {
    final jsonStr = jsonEncode(session.toJson());
    await _secureStorage.write(key: _sessionKey, value: jsonStr);
  }

  Future<AuthSession?> getSession() async {
    final raw = await _secureStorage.read(key: _sessionKey);
    if (raw == null || raw.isEmpty) return null;
    try {
      final map = jsonDecode(raw) as Map<String, dynamic>;
      final session = AuthSession.fromJson(map);
      if (session.isExpired) {
        await clearSession();
        return null;
      }
      return session;
    } catch (_) {
      await clearSession();
      return null;
    }
  }

  Future<void> clearSession() async {
    await _secureStorage.delete(key: _sessionKey);
  }

  // --- Language (SharedPreferences) ---

  String getLanguage() {
    return _prefs?.getString(_languageKey) ?? 'en';
  }

  Future<void> setLanguage(String lang) async {
    await _prefs?.setString(_languageKey, lang);
  }

  // --- Theme Mode (SharedPreferences) ---

  String getThemeMode() {
    return _prefs?.getString(_themeModeKey) ?? 'system';
  }

  Future<void> setThemeMode(String mode) async {
    await _prefs?.setString(_themeModeKey, mode);
  }

  // --- Custom Base URL ---

  Future<String?> getCustomBaseUrl() async {
    await init();
    return _prefs?.getString(_customBaseUrlKey);
  }

  Future<void> saveCustomBaseUrl(String url) async {
    await init();
    await _prefs?.setString(_customBaseUrlKey, url);
  }
}
