import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../models/tourist_spot.dart';
import 'api_service.dart';

class TouristSpotService {
  final ApiService apiService;
  final Dio _neonDio = Dio();

  TouristSpotService([ApiService? api]) : apiService = api ?? ApiService.instance;

  Future<List<TouristSpot>> _queryNeon(String sql) async {
    final response = await _neonDio.post(
      AppConfig.neonSqlEndpoint,
      data: {'query': sql},
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Neon-Connection-String': AppConfig.neonConnectionString,
        },
        sendTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 20),
      ),
    );

    final rows = (response.data['rows'] as List<dynamic>?) ?? [];
    return rows.map((r) => TouristSpot.fromJson(r as Map<String, dynamic>)).toList();
  }

  Future<List<TouristSpot>> getAllSpots() async {
    // 1. Prioritize direct Neon Cloud Database (ensures it works on any mobile phone anywhere)
    try {
      final spots = await _queryNeon('SELECT * FROM tourist_spots ORDER BY id ASC;');
      if (spots.isNotEmpty) return spots;
    } catch (_) {
      // Fallback to local / configured backend
    }

    try {
      final response = await apiService.dio.get('/api/tourist-spots');
      final list = (response.data as List<dynamic>)
          .map((e) => TouristSpot.fromJson(e as Map<String, dynamic>))
          .toList();
      return list;
    } on DioException catch (e) {
      throw Exception(e.message ?? 'Failed to load tourist spots from Neon database');
    }
  }

  Future<List<TouristSpot>> getSpotsByInterest(String interest) async {
    final sanitized = interest.replaceAll("'", "''").trim();
    try {
      final spots = await _queryNeon(
        "SELECT * FROM tourist_spots WHERE interests ILIKE '%$sanitized%' ORDER BY id ASC;",
      );
      if (spots.isNotEmpty) return spots;
    } catch (_) {
      // Fallback
    }

    try {
      final response = await apiService.dio.get(
        '/api/tourist-spots/interest/${Uri.encodeComponent(interest)}',
      );
      final list = (response.data as List<dynamic>)
          .map((e) => TouristSpot.fromJson(e as Map<String, dynamic>))
          .toList();
      return list;
    } on DioException catch (e) {
      throw Exception(e.message ?? 'Failed to load tourist spots for interest: $interest');
    }
  }

  Future<TouristSpot> getSpotById(int id) async {
    try {
      final spots = await _queryNeon(
        'SELECT * FROM tourist_spots WHERE id = $id LIMIT 1;',
      );
      if (spots.isNotEmpty) return spots.first;
    } catch (_) {
      // Fallback
    }

    try {
      final response = await apiService.dio.get('/api/tourist-spots/$id');
      return TouristSpot.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception(e.message ?? 'Tourist spot not found');
    }
  }

  Future<List<TouristSpot>> searchSpots(String query) async {
    final sanitized = query.replaceAll("'", "''").trim();
    try {
      final spots = await _queryNeon(
        "SELECT * FROM tourist_spots WHERE name ILIKE '%$sanitized%' OR city ILIKE '%$sanitized%' ORDER BY id ASC;",
      );
      if (spots.isNotEmpty) return spots;
    } catch (_) {
      // Fallback
    }

    try {
      final response = await apiService.dio.get(
        '/api/tourist-spots/search',
        queryParameters: {'query': query},
      );
      return (response.data as List<dynamic>)
          .map((e) => TouristSpot.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      final all = await getAllSpots();
      if (query.isEmpty) return all;
      final q = query.toLowerCase();
      return all
          .where((s) =>
              s.name.toLowerCase().contains(q) ||
              s.city.toLowerCase().contains(q) ||
              (s.interests?.toLowerCase().contains(q) ?? false))
          .toList();
    }
  }
}
