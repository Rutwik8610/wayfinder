import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../core/storage/storage_service.dart';

class ApiService {
  static final ApiService instance = ApiService._(StorageService.instance);
  final StorageService storageService;
  late final Dio dio;

  factory ApiService([StorageService? storage]) =>
      storage == null ? instance : ApiService._(storage);

  ApiService._(this.storageService) {
    dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 20),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final customUrl = await storageService.getCustomBaseUrl();
          if (customUrl != null && customUrl.isNotEmpty) {
            options.baseUrl = customUrl;
          }
          final session = await storageService.getSession();
          if (session != null && !session.isExpired) {
            options.headers['Authorization'] = 'Bearer ${session.accessToken}';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.response?.statusCode == 401) {
            await storageService.clearSession();
          }
          return handler.next(e);
        },
      ),
    );
  }
}
