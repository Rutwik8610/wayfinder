import 'package:flutter/material.dart';
import '../models/tourist_spot.dart';
import '../services/tourist_spot_service.dart';

class SpotsProvider extends ChangeNotifier {
  final TouristSpotService spotService;

  List<TouristSpot> _allSpots = [];
  List<TouristSpot> _filteredSpots = [];
  bool _isLoading = false;
  String? _error;
  String _selectedCategory = 'All spots';
  String _searchQuery = '';

  SpotsProvider([TouristSpotService? service]) : spotService = service ?? TouristSpotService();

  List<TouristSpot> get spots => _filteredSpots;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get selectedCategory => _selectedCategory;
  String get searchQuery => _searchQuery;

  static const List<String> categories = [
    'All spots',
    'Adventure',
    'Culture',
    'Nature',
    'Food',
    'Tradition',
  ];

  Future<void> fetchSpots() => loadSpots();

  Future<void> loadSpots() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      if (_selectedCategory == 'All spots') {
        _allSpots = await spotService.getAllSpots();
      } else {
        _allSpots = await spotService.getSpotsByInterest(_selectedCategory);
      }
      _applyFilters();
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectCategory(String category) {
    if (_selectedCategory == category) return;
    _selectedCategory = category;
    loadSpots();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    _applyFilters();
    notifyListeners();
  }

  void _applyFilters() {
    if (_searchQuery.trim().isEmpty) {
      _filteredSpots = List.from(_allSpots);
    } else {
      final q = _searchQuery.toLowerCase().trim();
      _filteredSpots = _allSpots.where((spot) {
        return spot.name.toLowerCase().contains(q) ||
            spot.city.toLowerCase().contains(q) ||
            spot.state.toLowerCase().contains(q);
      }).toList();
    }
  }
}
