import 'package:dio/dio.dart';
import '../models/auth_session.dart';
import 'api_service.dart';

class AuthService {
  final ApiService apiService;

  AuthService([ApiService? api]) : apiService = api ?? ApiService.instance;

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await apiService.dio.post(
        '/api/auth/login',
        data: {'email': email.trim(), 'password': password},
      );
      final session = AuthSession.fromAuthResponse(response.data);
      await apiService.storageService.saveSession(session);
      return session;
    } on DioException catch (e) {
      final message = e.response?.data?['detail'] ??
          e.response?.data?['message'] ??
          'Invalid email or password.';
      throw Exception(message);
    }
  }

  Future<AuthSession> register({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      final response = await apiService.dio.post(
        '/api/auth/register',
        data: {
          'name': name.trim(),
          'email': email.trim(),
          'password': password,
        },
      );
      final session = AuthSession.fromAuthResponse(response.data);
      await apiService.storageService.saveSession(session);
      return session;
    } on DioException catch (e) {
      final message = e.response?.data?['detail'] ??
          e.response?.data?['message'] ??
          'Registration failed. Please check details.';
      throw Exception(message);
    }
  }

  Future<void> logout() async {
    await apiService.storageService.clearSession();
  }

  Future<AuthSession?> getCurrentUser() async {
    return await apiService.storageService.getSession();
  }
}
