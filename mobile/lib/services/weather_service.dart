import 'package:dio/dio.dart';
import '../models/weather_info.dart';

class WeatherService {
  final Dio _dio = Dio();

  String _weatherDescription(int code) {
    if (code == 0 || code == 1) return 'Clear Sky';
    if (code == 2 || code == 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 82) return 'Rain Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Cloudy';
  }

  String _weatherIcon(int code) {
    if (code == 0 || code == 1) return 'sun';
    if (code >= 51 && code <= 82) return 'rain';
    return 'cloud';
  }

  Future<WeatherInfo> getWeatherForCity(String city) => fetchWeatherForLocation(city);

  Future<WeatherInfo> fetchWeatherForLocation(String locationName, {double? lat, double? lng}) async {
    try {
      double latitude = lat ?? 0.0;
      double longitude = lng ?? 0.0;
      String displayName = locationName;

      if (lat == null || lng == null) {
        final geoUrl =
            'https://geocoding-api.open-meteo.com/v1/search?name=${Uri.encodeComponent(locationName)}&count=1&format=json';
        final geoRes = await _dio.get(geoUrl);
        final results = geoRes.data['results'] as List<dynamic>?;
        if (results == null || results.isEmpty) {
          throw Exception('Location "$locationName" not found.');
        }
        final first = results[0];
        latitude = (first['latitude'] as num).toDouble();
        longitude = (first['longitude'] as num).toDouble();
        displayName = '${first['name']}, ${first['country'] ?? ''}';
      }

      final weatherUrl =
          'https://api.open-meteo.com/v1/forecast?latitude=$latitude&longitude=$longitude&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto';
      final weatherRes = await _dio.get(weatherUrl);

      final current = weatherRes.data['current'] as Map<String, dynamic>;
      final daily = weatherRes.data['daily'] as Map<String, dynamic>;

      final temp = (current['temperature_2m'] as num).round();
      final feelsLike = (current['apparent_temperature'] as num).round();
      final humidity = (current['relative_humidity_2m'] as num).round();
      final wind = (current['wind_speed_10m'] as num).round();
      final weatherCode = (current['weather_code'] as num).toInt();

      final dates = daily['time'] as List<dynamic>;
      final maxTemps = daily['temperature_2m_max'] as List<dynamic>;
      final minTemps = daily['temperature_2m_min'] as List<dynamic>;
      final codes = daily['weather_code'] as List<dynamic>;

      final List<ForecastDay> forecast = [];
      for (int i = 0; i < dates.length && i < 5; i++) {
        final code = (codes[i] as num).toInt();
        forecast.add(
          ForecastDay(
            date: dates[i].toString(),
            maxTemp: (maxTemps[i] as num).round(),
            minTemp: (minTemps[i] as num).round(),
            description: _weatherDescription(code),
            icon: _weatherIcon(code),
          ),
        );
      }

      return WeatherInfo(
        location: displayName,
        temperature: temp,
        feelsLike: feelsLike,
        windSpeed: wind,
        humidity: humidity,
        description: _weatherDescription(weatherCode),
        icon: _weatherIcon(weatherCode),
        forecast: forecast,
      );
    } catch (e) {
      throw Exception('Failed to load weather: $e');
    }
  }
}
