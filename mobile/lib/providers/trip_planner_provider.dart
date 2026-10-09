import 'package:flutter/material.dart';
import '../models/tourist_spot.dart';
import '../models/trip_plan.dart';
import '../services/location_service.dart';
import '../services/tourist_spot_service.dart';
import '../services/trip_service.dart';

class TripPlannerProvider extends ChangeNotifier {
  final TripService tripService;
  final TouristSpotService spotService;
  final LocationService locationService;

  int _currentStep = 1;
  String _currentLocation = '';
  String _destination = '';
  TouristSpot? _selectedSpot;
  int _travelerCount = 1;
  DateTime? _fromDate;
  DateTime? _toDate;
  final List<String> _selectedInterests = [];

  bool _isLoading = false;
  bool _isGeoLoading = false;
  bool _isRefreshingBudget = false;
  String? _errorMessage;
  TripPlanResponse? _planResult;

  TripPlannerProvider({
    TripService? tripService,
    TouristSpotService? spotService,
    LocationService? locationService,
  })  : tripService = tripService ?? TripService(),
        spotService = spotService ?? TouristSpotService(),
        locationService = locationService ?? LocationService();

  int get currentStep => _currentStep;
  String get currentLocation => _currentLocation;
  String get destination => _destination;
  TouristSpot? get selectedSpot => _selectedSpot;
  int get travelerCount => _travelerCount;
  DateTime? get fromDate => _fromDate;
  DateTime? get toDate => _toDate;
  List<String> get selectedInterests => _selectedInterests;
  bool get isLoading => _isLoading;
  bool get isGeoLoading => _isGeoLoading;
  bool get isRefreshingBudget => _isRefreshingBudget;
  String? get errorMessage => _errorMessage;
  TripPlanResponse? get planResult => _planResult;

  static const List<String> availableInterests = [
    'Food',
    'Culture',
    'Adventure',
    'Tradition',
    'Nature',
    'Art',
    'Wellness',
  ];

  void setStep(int step) {
    _currentStep = step;
    notifyListeners();
  }

  void setCurrentLocation(String loc) {
    _currentLocation = loc;
    notifyListeners();
  }

  void setDestination(String dest, [TouristSpot? spot]) {
    _destination = dest;
    _selectedSpot = spot;
    notifyListeners();
  }

  void setTravelerCount(int count) {
    _travelerCount = count < 1 ? 1 : count;
    notifyListeners();
  }

  void setDateRange(DateTime from, DateTime to) {
    _fromDate = from;
    _toDate = to;
    notifyListeners();
  }

  void toggleInterest(String interest) {
    if (_selectedInterests.contains(interest)) {
      _selectedInterests.remove(interest);
    } else {
      _selectedInterests.add(interest);
    }
    notifyListeners();
  }

  Future<void> detectCurrentLocation() async {
    _isGeoLoading = true;
    notifyListeners();
    try {
      final position = await locationService.getCurrentPosition();
      if (position != null) {
        _currentLocation = '${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}';
      }
    } catch (_) {
      // Ignored
    } finally {
      _isGeoLoading = false;
      notifyListeners();
    }
  }

  bool canProceedStep1() => _currentLocation.trim().isNotEmpty && _destination.trim().isNotEmpty;
  bool canProceedStep2() => _fromDate != null && _toDate != null && !_toDate!.isBefore(_fromDate!);
  bool canProceedStep3() => _selectedInterests.isNotEmpty;

  Future<bool> generatePlan() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // 1. Resolve tourist spot by name if not already picked
      int spotId;
      if (_selectedSpot != null) {
        spotId = _selectedSpot!.id;
      } else {
        final spots = await spotService.searchSpots(_destination.trim());
        if (spots.isEmpty) {
          throw Exception('No tourist spot matching "$_destination" found in database. Please explore destinations.');
        }
        _selectedSpot = spots.first;
        spotId = _selectedSpot!.id;
      }

      final startStr = _fromDate?.toIso8601String().split('T').first ?? '';
      final endStr = _toDate?.toIso8601String().split('T').first ?? '';

      final response = await tripService.createTripPlan(
        spotId: spotId,
        startLocation: _currentLocation.trim(),
        destination: _destination.trim(),
        travelerCount: _travelerCount,
        startDate: startStr,
        endDate: endStr,
        interests: _selectedInterests.join(', '),
      );

      _planResult = response;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> refreshBudget() async {
    if (_planResult == null) return;
    _isRefreshingBudget = true;
    notifyListeners();

    try {
      final startStr = _fromDate?.toIso8601String().split('T').first ?? '';
      final endStr = _toDate?.toIso8601String().split('T').first ?? '';

      final response = await tripService.createTripPlan(
        spotId: _planResult!.spotInfo.id,
        startLocation: _currentLocation.trim(),
        destination: _destination.trim(),
        travelerCount: _travelerCount,
        startDate: startStr,
        endDate: endStr,
        interests: _selectedInterests.join(', '),
        forceRefresh: true,
      );

      _planResult = TripPlanResponse(
        spotInfo: _planResult!.spotInfo,
        routeInfo: _planResult!.routeInfo,
        itinerary: _planResult!.itinerary,
        budgetPlan: response.budgetPlan,
      );
    } catch (_) {
      // Keep old plan on refresh error
    } finally {
      _isRefreshingBudget = false;
      notifyListeners();
    }
  }

  void reset() {
    _currentStep = 1;
    _currentLocation = '';
    _destination = '';
    _selectedSpot = null;
    _travelerCount = 1;
    _fromDate = null;
    _toDate = null;
    _selectedInterests.clear();
    _planResult = null;
    _errorMessage = null;
    notifyListeners();
  }
}
