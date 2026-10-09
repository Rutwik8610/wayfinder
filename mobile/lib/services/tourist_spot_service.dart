import 'package:dio/dio.dart';
import '../models/tourist_spot.dart';
import 'api_service.dart';

class TouristSpotService {
  final ApiService apiService;

  TouristSpotService([ApiService? api]) : apiService = api ?? ApiService.instance;

  Future<List<TouristSpot>> getAllSpots() async {
    try {
      final response = await apiService.dio.get('/api/tourist-spots');
      final list = (response.data as List<dynamic>)
          .map((e) => TouristSpot.fromJson(e as Map<String, dynamic>))
          .toList();
      return list;
    } on DioException catch (e) {
      throw Exception(e.message ?? 'Failed to load tourist spots');
    }
  }

  Future<List<TouristSpot>> getSpotsByInterest(String interest) async {
    try {
      final response = await apiService.dio.get(
        '/api/tourist-spots/interest/${Uri.encodeComponent(interest)}',
      );
      final list = (response.data as List<dynamic>)
          .map((e) => TouristSpot.fromJson(e as Map<String, dynamic>))
          .toList();
      return list;
    } on DioException catch (e) {
      throw Exception(e.message ?? 'Failed to filter spots by interest');
    }
  }

  Future<List<TouristSpot>> searchSpots(String name) async {
    try {
      final response = await apiService.dio.get(
        '/api/tourist-spots/search',
        queryParameters: {'name': name},
      );
      final list = (response.data as List<dynamic>)
          .map((e) => TouristSpot.fromJson(e as Map<String, dynamic>))
          .toList();
      return list;
    } on DioException catch (e) {
      throw Exception(e.message ?? 'Failed to search tourist spots');
    }
  }

  Future<TouristSpot> getSpotById(int id) async {
    try {
      final response = await apiService.dio.get('/api/tourist-spots/$id');
      return TouristSpot.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception(e.message ?? 'Failed to fetch spot details');
    }
  }
}
