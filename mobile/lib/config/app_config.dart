class AppConfig {
  /// Base API URL for local/custom backend
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8080',
  );

  /// Neon Cloud Better Auth URL (Direct cloud authentication)
  static const String neonAuthBaseUrl =
      'https://ep-quiet-block-b4ark107.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth';

  /// Neon Serverless SQL HTTP API Endpoint (Direct cloud database query)
  static const String neonSqlEndpoint =
      'https://ep-quiet-block-b4ark107-pooler.c-6.us-east-2.aws.neon.tech/sql';

  /// Neon PostgreSQL Direct Connection String
  static const String neonConnectionString =
      'postgresql://neondb_owner:npg_kz1u2JfRTLAO@ep-quiet-block-b4ark107-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

  /// Google Maps API Key passed via:
  /// `--dart-define=MAPS_API_KEY=AIzaSy...`
  static const String mapsApiKey = String.fromEnvironment(
    'MAPS_API_KEY',
    defaultValue: '',
  );

  static const String appName = 'WayFinder';
  static const String appVersion = '1.0.0';
}
