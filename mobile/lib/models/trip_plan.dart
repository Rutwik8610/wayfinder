import 'tourist_spot.dart';

class RouteInfo {
  final String origin;
  final String destination;
  final double? originLat;
  final double? originLng;
  final double? destinationLat;
  final double? destinationLng;
  final double? distanceKm;
  final String durationText;
  final String? directionsUrl;
  final String? embedMapUrl;

  RouteInfo({
    required this.origin,
    required this.destination,
    this.originLat,
    this.originLng,
    this.destinationLat,
    this.destinationLng,
    this.distanceKm,
    required this.durationText,
    this.directionsUrl,
    this.embedMapUrl,
  });

  factory RouteInfo.fromJson(Map<String, dynamic> json) {
    return RouteInfo(
      origin: json['origin'] as String? ?? '',
      destination: json['destination'] as String? ?? '',
      originLat: (json['originLat'] as num?)?.toDouble(),
      originLng: (json['originLng'] as num?)?.toDouble(),
      destinationLat: (json['destinationLat'] as num?)?.toDouble(),
      destinationLng: (json['destinationLng'] as num?)?.toDouble(),
      distanceKm: (json['distanceKm'] as num?)?.toDouble(),
      durationText: json['durationText'] as String? ?? '',
      directionsUrl: json['directionsUrl'] as String?,
      embedMapUrl: json['embedMapUrl'] as String?,
    );
  }
}

class BudgetItem {
  final String category;
  final double min;
  final double max;
  final double recommended;
  final String? sourceName;
  final String? sourceUrl;
  final String? note;
  final bool isEstimate;

  BudgetItem({
    required this.category,
    required this.min,
    required this.max,
    required this.recommended,
    this.sourceName,
    this.sourceUrl,
    this.note,
    this.isEstimate = false,
  });

  factory BudgetItem.fromJson(Map<String, dynamic> json) {
    return BudgetItem(
      category: json['category'] as String? ?? '',
      min: (json['min'] as num?)?.toDouble() ?? 0.0,
      max: (json['max'] as num?)?.toDouble() ?? 0.0,
      recommended: (json['recommended'] as num?)?.toDouble() ?? 0.0,
      sourceName: json['sourceName'] as String?,
      sourceUrl: json['sourceUrl'] as String?,
      note: json['note'] as String?,
      isEstimate: json['isEstimate'] as bool? ?? false,
    );
  }
}

class BudgetPlan {
  final double transportation;
  final double accommodation;
  final double food;
  final double entryFees;
  final double localTransport;
  final double miscellaneous;
  final double total;
  final double? totalMin;
  final double? totalMax;
  final double? totalRecommended;
  final List<BudgetItem> items;
  final String? note;
  final bool isEstimate;

  BudgetPlan({
    required this.transportation,
    required this.accommodation,
    required this.food,
    required this.entryFees,
    required this.localTransport,
    required this.miscellaneous,
    required this.total,
    this.totalMin,
    this.totalMax,
    this.totalRecommended,
    this.items = const [],
    this.note,
    this.isEstimate = false,
  });

  factory BudgetPlan.fromJson(Map<String, dynamic> json) {
    var rawItems = json['items'] as List<dynamic>? ?? [];
    var itemsList = rawItems.map((e) => BudgetItem.fromJson(e as Map<String, dynamic>)).toList();

    return BudgetPlan(
      transportation: (json['transportation'] as num?)?.toDouble() ?? 0.0,
      accommodation: (json['accommodation'] as num?)?.toDouble() ?? 0.0,
      food: (json['food'] as num?)?.toDouble() ?? 0.0,
      entryFees: (json['entryFees'] as num?)?.toDouble() ?? 0.0,
      localTransport: (json['localTransport'] as num?)?.toDouble() ?? 0.0,
      miscellaneous: (json['miscellaneous'] as num?)?.toDouble() ?? 0.0,
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      totalMin: (json['totalMin'] as num?)?.toDouble(),
      totalMax: (json['totalMax'] as num?)?.toDouble(),
      totalRecommended: (json['totalRecommended'] as num?)?.toDouble(),
      items: itemsList,
      note: json['note'] as String?,
      isEstimate: json['isEstimate'] as bool? ?? false,
    );
  }
}

class ItineraryDay {
  final int day;
  final String date;
  final List<String> activities;

  ItineraryDay({
    required this.day,
    required this.date,
    required this.activities,
  });

  factory ItineraryDay.fromJson(Map<String, dynamic> json) {
    return ItineraryDay(
      day: (json['day'] as num?)?.toInt() ?? 1,
      date: json['date'] as String? ?? '',
      activities: (json['activities'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
    );
  }
}

class TripPlanResponse {
  final TouristSpot spotInfo;
  final RouteInfo? routeInfo;
  final List<ItineraryDay> itinerary;
  final BudgetPlan budgetPlan;

  TripPlanResponse({
    required this.spotInfo,
    this.routeInfo,
    required this.itinerary,
    required this.budgetPlan,
  });

  factory TripPlanResponse.fromJson(Map<String, dynamic> json) {
    return TripPlanResponse(
      spotInfo: TouristSpot.fromJson(json['spotInfo'] as Map<String, dynamic>),
      routeInfo: json['routeInfo'] != null
          ? RouteInfo.fromJson(json['routeInfo'] as Map<String, dynamic>)
          : null,
      itinerary: (json['itinerary'] as List<dynamic>? ?? [])
          .map((e) => ItineraryDay.fromJson(e as Map<String, dynamic>))
          .toList(),
      budgetPlan: BudgetPlan.fromJson(json['budgetPlan'] as Map<String, dynamic>),
    );
  }
}
