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
    return TouristSpot(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String? ?? '',
      city: json['city'] as String? ?? '',
      state: json['state'] as String? ?? '',
      country: json['country'] as String? ?? 'India',
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      description: json['description'] as String? ?? '',
      history: json['history'] as String?,
      attractions: json['attractions'] as String?,
      openingTime: json['openingTime'] as String?,
      closingTime: json['closingTime'] as String?,
      entryFee: (json['entryFee'] as num?)?.toDouble(),
      bestTimeToVisit: json['bestTimeToVisit'] as String?,
      safetyInformation: json['safetyInformation'] as String?,
      imageUrl: json['imageUrl'] as String?,
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
