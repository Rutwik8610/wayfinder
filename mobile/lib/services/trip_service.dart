import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../models/tourist_spot.dart';
import '../models/trip_plan.dart';
import 'api_service.dart';

class TripService {
  final ApiService apiService;
  final Dio _neonDio = Dio();

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
    // 1. Try local or custom configured backend first
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
        options: Options(
          sendTimeout: const Duration(seconds: 4),
          receiveTimeout: const Duration(seconds: 5),
        ),
      );
      return TripPlanResponse.fromJson(response.data as Map<String, dynamic>);
    } catch (_) {
      // Fallback to standalone direct Neon Cloud calculation and storage
    }

    // 2. Standalone Direct Cloud flow (ensures mobile APK functions anywhere)
    try {
      // Fetch spot from Neon Cloud Database
      final spotRes = await _neonDio.post(
        AppConfig.neonSqlEndpoint,
        data: {'query': 'SELECT * FROM tourist_spots WHERE id = $spotId LIMIT 1;'},
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Neon-Connection-String': AppConfig.neonConnectionString,
          },
        ),
      );

      final rows = (spotRes.data['rows'] as List<dynamic>?) ?? [];
      TouristSpot spot;
      if (rows.isNotEmpty) {
        spot = TouristSpot.fromJson(rows.first as Map<String, dynamic>);
      } else {
        spot = TouristSpot(
          id: spotId,
          name: destination,
          city: destination,
          state: 'Maharashtra',
          country: 'India',
          description: 'A popular travel destination in Maharashtra.',
        );
      }

      // Calculate days
      DateTime start = DateTime.tryParse(startDate) ?? DateTime.now();
      DateTime end = DateTime.tryParse(endDate) ?? start.add(const Duration(days: 3));
      int days = end.difference(start).inDays;
      if (days < 1) days = 1;

      // Calculate budget
      final spotFee = (spot.entryFee ?? 100.0) * travelerCount;
      final travelCost = (travelerCount * 750.0).roundToDouble();
      final stayCost = (days * 1200.0 * (travelerCount > 2 ? 2 : 1)).roundToDouble();
      final foodCost = (days * travelerCount * 500.0).roundToDouble();
      final localTransport = (days * travelerCount * 200.0).roundToDouble();
      final miscCost = 250.0;
      final totalBudget = spotFee + travelCost + stayCost + foodCost + localTransport + miscCost;

      // Save trip record directly to Neon PostgreSQL 'trips' table
      try {
        final escapedStart = startLocation.replaceAll("'", "''");
        final escapedDest = destination.replaceAll("'", "''");
        final escapedInterests = interests.replaceAll("'", "''");
        await _neonDio.post(
          AppConfig.neonSqlEndpoint,
          data: {
            'query':
                "INSERT INTO public.trips (user_id, start_location, destination, traveler_count, start_date, end_date, budget, interests, created_at) VALUES (1, '$escapedStart', '$escapedDest', $travelerCount, '$startDate'::date, '$endDate'::date, $totalBudget, '$escapedInterests', NOW());",
          },
          options: Options(
            headers: {
              'Content-Type': 'application/json',
              'Neon-Connection-String': AppConfig.neonConnectionString,
            },
          ),
        );
      } catch (_) {}

      final destLat = spot.latitude ?? 18.5204;
      final destLng = spot.longitude ?? 73.8567;
      final originLat = destLat - 0.25;
      final originLng = destLng - 0.25;

      return TripPlanResponse(
        spotInfo: spot,
        routeInfo: RouteInfo(
          origin: startLocation,
          destination: spot.name,
          durationText: '2 hours 45 mins',
          distanceKm: 115.0,
          originLat: originLat,
          originLng: originLng,
          destinationLat: destLat,
          destinationLng: destLng,
        ),
        itinerary: [
          ItineraryDay(
            day: 1,
            date: startDate,
            activities: [
              'Arrival and check-in at accommodation',
              'Visit ${spot.name} and explore primary attractions',
              'Enjoy local Maharashtrian dinner',
            ],
          ),
          ItineraryDay(
            day: 2,
            date: endDate,
            activities: [
              'Morning sightseeing and photography around ${spot.city}',
              'Local market visit and souvenir shopping',
              'Return journey back to $startLocation',
            ],
          ),
        ],
        budgetPlan: BudgetPlan(
          transportation: travelCost,
          accommodation: stayCost,
          food: foodCost,
          entryFees: spotFee,
          localTransport: localTransport,
          miscellaneous: miscCost,
          total: totalBudget,
          items: [
            BudgetItem(category: 'Intercity Transport', min: travelCost * 0.8, max: travelCost * 1.2, recommended: travelCost),
            BudgetItem(category: 'Hotel / Stay', min: stayCost * 0.8, max: stayCost * 1.3, recommended: stayCost),
            BudgetItem(category: 'Food & Dining', min: foodCost * 0.8, max: foodCost * 1.2, recommended: foodCost),
            BudgetItem(category: 'Monument / Spot Entry', min: spotFee, max: spotFee, recommended: spotFee),
            BudgetItem(category: 'Local Transport', min: localTransport * 0.8, max: localTransport * 1.2, recommended: localTransport),
          ],
        ),
      );
    } catch (e) {
      throw Exception('Failed to generate trip plan: $e');
    }
  }
}
