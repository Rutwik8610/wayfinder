import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppLocalizations {
  final Locale locale;
  Map<String, String> _localizedStrings = {};

  AppLocalizations(this.locale);

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  Future<bool> load() async {
    try {
      String jsonString = await rootBundle.loadString(
        'assets/i18n/${locale.languageCode}.json',
      );
      Map<String, dynamic> jsonMap = json.decode(jsonString);

      _localizedStrings = jsonMap.map((key, value) {
        return MapEntry(key, value.toString());
      });
      return true;
    } catch (e) {
      // Fallback to English if translation fails
      try {
        String jsonString =
            await rootBundle.loadString('assets/i18n/en.json');
        Map<String, dynamic> jsonMap = json.decode(jsonString);
        _localizedStrings = jsonMap.map((key, value) {
          return MapEntry(key, value.toString());
        });
        return true;
      } catch (_) {
        return false;
      }
    }
  }

  String translate(String key, [Map<String, dynamic>? args]) {
    String value = _localizedStrings[key] ?? key;
    if (args != null) {
      args.forEach((k, v) {
        value = value.replaceAll('{$k}', v.toString());
      });
    }
    return value;
  }
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['en', 'hi'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    AppLocalizations localizations = AppLocalizations(locale);
    await localizations.load();
    return localizations;
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

extension TranslationExtension on BuildContext {
  String tr(String key, [Map<String, dynamic>? args]) {
    return AppLocalizations.of(this)?.translate(key, args) ?? key;
  }
}
