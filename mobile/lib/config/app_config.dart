class AppConfig {
  /// Base API URL. Can be overridden at build time via:
  /// `--dart-define=API_BASE_URL=https://your-public-backend-url.com`
  ///
  /// For Android emulator testing against local machine, default is `http://10.0.2.2:8080`.
  /// For physical devices, deploy your backend or supply your public HTTPS tunnel URL.
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8080',
  );

  /// Google Maps API Key passed via:
  /// `--dart-define=MAPS_API_KEY=AIzaSy...`
  static const String mapsApiKey = String.fromEnvironment(
    'MAPS_API_KEY',
    defaultValue: '',
  );

  static const String appName = 'WayFinder';
  static const String appVersion = '1.0.0';
}
