import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../models/auth_session.dart';
import 'api_service.dart';

class AuthService {
  final ApiService apiService;
  final Dio _neonDio = Dio();

  AuthService([ApiService? api]) : apiService = api ?? ApiService.instance;

  Future<void> _runNeonSql(String sql) async {
    try {
      await _neonDio.post(
        AppConfig.neonSqlEndpoint,
        data: {'query': sql},
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Neon-Connection-String': AppConfig.neonConnectionString,
          },
          sendTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
        ),
      );
    } catch (_) {
      // Ignore background sync errors
    }
  }

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final cleanEmail = email.trim();

    // 1. Authenticate with Neon Better Auth (Cloud Database Auth)
    try {
      final response = await _neonDio.post(
        '${AppConfig.neonAuthBaseUrl}/sign-in/email',
        data: {
          'email': cleanEmail,
          'password': password,
        },
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:3000',
            'User-Agent': 'WayFinder/1.0',
          },
          sendTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 20),
        ),
      );

      final session = AuthSession.fromAuthResponse(response.data as Map<String, dynamic>);
      await apiService.storageService.saveSession(session);
      return session;
    } on DioException catch (e) {
      final resData = e.response?.data;
      final code = resData is Map ? resData['code'] : null;

      // If email requires verification, auto-verify in Neon database and retry once
      if (code == 'EMAIL_NOT_VERIFIED') {
        final escapedEmail = cleanEmail.replaceAll("'", "''");
        await _runNeonSql('UPDATE neon_auth.user SET "emailVerified" = true WHERE email = \'$escapedEmail\';');

        final retry = await _neonDio.post(
          '${AppConfig.neonAuthBaseUrl}/sign-in/email',
          data: {
            'email': cleanEmail,
            'password': password,
          },
          options: Options(
            headers: {
              'Content-Type': 'application/json',
              'Origin': 'http://localhost:3000',
              'User-Agent': 'WayFinder/1.0',
            },
          ),
        );
        final session = AuthSession.fromAuthResponse(retry.data as Map<String, dynamic>);
        await apiService.storageService.saveSession(session);
        return session;
      }

      // If Neon Auth gave a specific error like Invalid credentials
      if (resData is Map && resData['message'] != null) {
        final msg = resData['message'].toString();
        // Fallback to local Spring Boot backend if configured
        try {
          final localRes = await apiService.dio.post(
            '/api/auth/login',
            data: {'email': cleanEmail, 'password': password},
          );
          final session = AuthSession.fromAuthResponse(localRes.data);
          await apiService.storageService.saveSession(session);
          return session;
        } catch (_) {
          throw Exception(msg);
        }
      }
    } catch (_) {
      // Fallback
    }

    // 2. Fallback to Spring Boot Backend API
    try {
      final response = await apiService.dio.post(
        '/api/auth/login',
        data: {'email': cleanEmail, 'password': password},
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
    final cleanName = name.trim();
    final cleanEmail = email.trim();
    final escapedName = cleanName.replaceAll("'", "''");
    final escapedEmail = cleanEmail.replaceAll("'", "''");

    // 1. Sign up directly with Neon Better Auth (Cloud Database Auth)
    try {
      final response = await _neonDio.post(
        '${AppConfig.neonAuthBaseUrl}/sign-up/email',
        data: {
          'name': cleanName,
          'email': cleanEmail,
          'password': password,
        },
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:3000',
            'User-Agent': 'WayFinder/1.0',
          },
          sendTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 20),
        ),
      );

      // Auto-verify email & mirror into public.users in Neon PostgreSQL
      await _runNeonSql('UPDATE neon_auth.user SET "emailVerified" = true WHERE email = \'$escapedEmail\';');
      await _runNeonSql(
        "INSERT INTO public.users (email, name, password_hash, created_at) VALUES ('$escapedEmail', '$escapedName', 'neon_auth_managed', NOW()) ON CONFLICT (email) DO NOTHING;",
      );

      // Try logging in immediately to obtain active session
      try {
        return await login(email: cleanEmail, password: password);
      } catch (_) {
        final session = AuthSession.fromAuthResponse(response.data as Map<String, dynamic>);
        await apiService.storageService.saveSession(session);
        return session;
      }
    } on DioException catch (e) {
      final resData = e.response?.data;
      if (resData is Map && resData['message'] != null) {
        throw Exception(resData['message']);
      }
    } catch (_) {
      // Fallback
    }

    // 2. Fallback to Spring Boot Backend API
    try {
      final response = await apiService.dio.post(
        '/api/auth/register',
        data: {
          'name': cleanName,
          'email': cleanEmail,
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
    try {
      await _neonDio.post(
        '${AppConfig.neonAuthBaseUrl}/sign-out',
        options: Options(
          headers: {'Origin': 'http://localhost:3000'},
        ),
      );
    } catch (_) {}
    await apiService.storageService.clearSession();
  }

  Future<AuthSession?> getCurrentUser() async {
    return await apiService.storageService.getSession();
  }
}
