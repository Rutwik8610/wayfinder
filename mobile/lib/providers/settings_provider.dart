import 'package:flutter/material.dart';
import '../core/storage/storage_service.dart';

class SettingsProvider extends ChangeNotifier {
  final StorageService storageService;

  String _language = 'en';
  ThemeMode _themeMode = ThemeMode.system;

  SettingsProvider([StorageService? storage])
      : storageService = storage ?? StorageService.instance {
    _loadSettings();
  }

  String get language => _language;
  ThemeMode get themeMode => _themeMode;
  Locale get locale => Locale(_language);
  Locale get currentLocale => locale;

  Future<void> init() async {
    await storageService.init();
    _loadSettings();
  }

  void _loadSettings() {
    _language = storageService.getLanguage();
    final themeStr = storageService.getThemeMode();
    if (themeStr == 'light') {
      _themeMode = ThemeMode.light;
    } else if (themeStr == 'dark') {
      _themeMode = ThemeMode.dark;
    } else {
      _themeMode = ThemeMode.system;
    }
    notifyListeners();
  }

  Future<void> setLanguage(String lang) async {
    if (_language == lang) return;
    _language = lang;
    await storageService.setLanguage(lang);
    notifyListeners();
  }

  Future<void> setLocale(Locale loc) async {
    await setLanguage(loc.languageCode);
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    String modeStr = 'system';
    if (mode == ThemeMode.light) modeStr = 'light';
    if (mode == ThemeMode.dark) modeStr = 'dark';
    await storageService.setThemeMode(modeStr);
    notifyListeners();
  }
}
