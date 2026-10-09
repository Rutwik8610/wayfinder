class TouristSpot {
  final int id;
  final String name;
  final String city;
  final String state;
  final String country;
  final double? latitude;
  final double? longitude;
  final String description;
  final String? history;
  final String? attractions;
  final String? openingTime;
  final String? closingTime;
  final double? entryFee;
  final String? bestTimeToVisit;
  final String? safetyInformation;
  final String? imageUrl;
  final String? interests;

  TouristSpot({
    required this.id,
    required this.name,
    required this.city,
    required this.state,
    required this.country,
    this.latitude,
    this.longitude,
    required this.description,
    this.history,
    this.attractions,
    this.openingTime,
    this.closingTime,
    this.entryFee,
    this.bestTimeToVisit,
    this.safetyInformation,
    this.imageUrl,
    this.interests,
  });

  factory TouristSpot.fromJson(Map<String, dynamic> json) {
    int parsedId = 0;
    if (json['id'] is num) {
      parsedId = (json['id'] as num).toInt();
    } else if (json['id'] != null) {
      parsedId = int.tryParse(json['id'].toString()) ?? 0;
    }

    double? parsedLat;
    if (json['latitude'] is num) {
      parsedLat = (json['latitude'] as num).toDouble();
    } else if (json['latitude'] != null) {
      parsedLat = double.tryParse(json['latitude'].toString());
    }

    double? parsedLng;
    if (json['longitude'] is num) {
      parsedLng = (json['longitude'] as num).toDouble();
    } else if (json['longitude'] != null) {
      parsedLng = double.tryParse(json['longitude'].toString());
    }

    double? parsedEntryFee;
    final feeRaw = json['entryFee'] ?? json['entry_fee'];
    if (feeRaw is num) {
      parsedEntryFee = feeRaw.toDouble();
    } else if (feeRaw != null) {
      parsedEntryFee = double.tryParse(feeRaw.toString());
    }

    return TouristSpot(
      id: parsedId,
      name: json['name'] as String? ?? '',
      city: json['city'] as String? ?? '',
      state: json['state'] as String? ?? '',
      country: json['country'] as String? ?? 'India',
      latitude: parsedLat,
      longitude: parsedLng,
      description: json['description'] as String? ?? '',
      history: json['history'] as String?,
      attractions: json['attractions'] as String?,
      openingTime: (json['openingTime'] ?? json['opening_time']) as String?,
      closingTime: (json['closingTime'] ?? json['closing_time']) as String?,
      entryFee: parsedEntryFee,
      bestTimeToVisit: (json['bestTimeToVisit'] ?? json['best_time_to_visit']) as String?,
      safetyInformation: (json['safetyInformation'] ?? json['safety_information']) as String?,
      imageUrl: (json['imageUrl'] ?? json['image_url']) as String?,
      interests: json['interests'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'city': city,
        'state': state,
        'country': country,
        'latitude': latitude,
        'longitude': longitude,
        'description': description,
        'history': history,
        'attractions': attractions,
        'openingTime': openingTime,
        'closingTime': closingTime,
        'entryFee': entryFee,
        'bestTimeToVisit': bestTimeToVisit,
        'safetyInformation': safetyInformation,
        'imageUrl': imageUrl,
        'interests': interests,
      };
}
