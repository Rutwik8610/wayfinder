import 'package:dio/dio.dart';
import '../models/trip_plan.dart';
import 'api_service.dart';

class TripService {
  final ApiService apiService;

  TripService([ApiService? api]) : apiService = api ?? ApiService.instance;

  Future<TripPlanResponse> createTripPlan({
    required int spotId,
    required String startLocation,
    required String destination,
    required int travelerCount,
    required String startDate,
    required String endDate,
    required String interests,
    bool forceRefresh = false,
  }) async {
    try {
      final response = await apiService.dio.post(
        '/api/trips/plan',
        data: {
          'spotId': spotId,
          'startLocation': startLocation,
          'destination': destination,
          'travelerCount': travelerCount,
          'startDate': startDate,
          'endDate': endDate,
          'interests': interests,
          'forceRefresh': forceRefresh,
        },
      );
      return TripPlanResponse.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      final message = e.response?.data?['detail'] ??
          e.response?.data?['message'] ??
          'Failed to generate trip plan. Please try again.';
      throw Exception(message);
    }
  }
}
