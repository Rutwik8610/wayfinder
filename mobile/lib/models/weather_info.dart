class ForecastDay {
  final String date;
  final int maxTemp;
  final int minTemp;
  final String description;
  final String icon;

  ForecastDay({
    required this.date,
    required this.maxTemp,
    required this.minTemp,
    required this.description,
    required this.icon,
  });
}

class WeatherInfo {
  final String location;
  final int temperature;
  final int feelsLike;
  final int windSpeed;
  final int humidity;
  final String description;
  final String icon;
  final List<ForecastDay> forecast;

  WeatherInfo({
    required this.location,
    required this.temperature,
    required this.feelsLike,
    required this.windSpeed,
    required this.humidity,
    required this.description,
    required this.icon,
    required this.forecast,
  });
}
