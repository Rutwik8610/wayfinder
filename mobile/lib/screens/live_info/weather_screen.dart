import 'package:flutter/material.dart';
import '../../models/weather_info.dart';
import '../../services/weather_service.dart';

class WeatherScreen extends StatefulWidget {
  const WeatherScreen({super.key});

  @override
  State<WeatherScreen> createState() => _WeatherScreenState();
}

class _WeatherScreenState extends State<WeatherScreen> {
  final WeatherService _weatherService = WeatherService();
  final TextEditingController _searchCtrl = TextEditingController(text: 'Pune');

  bool _loading = false;
  String? _error;
  WeatherInfo? _weather;

  @override
  void initState() {
    super.initState();
    _fetchWeather('Pune');
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchWeather(String city) async {
    if (city.trim().isEmpty) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final info = await _weatherService.getWeatherForCity(city.trim());
      if (!mounted) return;
      setState(() {
        _weather = info;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'Unable to find weather for "$city". Please try another city.';
        _loading = false;
      });
    }
  }

  IconData _getIconData(String iconCode) {
    switch (iconCode) {
      case '01d':
      case '01n':
        return Icons.wb_sunny_rounded;
      case '02d':
      case '02n':
      case '03d':
      case '03n':
      case '04d':
      case '04n':
        return Icons.wb_cloudy_rounded;
      case '09d':
      case '09n':
      case '10d':
      case '10n':
        return Icons.water_drop_rounded;
      case '11d':
      case '11n':
        return Icons.thunderstorm_rounded;
      case '13d':
      case '13n':
        return Icons.ac_unit_rounded;
      case '50d':
      case '50n':
        return Icons.foggy;
      default:
        return Icons.cloud_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Weather'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Search Bar
            TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: 'Search city or destination...',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.arrow_forward_rounded),
                  onPressed: () => _fetchWeather(_searchCtrl.text),
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                filled: true,
              ),
              onSubmitted: _fetchWeather,
            ),
            const SizedBox(height: 16),

            if (_loading) ...[
              const SizedBox(height: 60),
              const Center(child: CircularProgressIndicator()),
            ] else if (_error != null) ...[
              const SizedBox(height: 40),
              Card(
                color: theme.colorScheme.errorContainer,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline_rounded, color: theme.colorScheme.error),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _error!,
                          style: TextStyle(color: theme.colorScheme.onErrorContainer),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ] else if (_weather != null) ...[
              _buildCurrentWeatherCard(theme, _weather!),
              const SizedBox(height: 20),
              Text(
                '5-Day Forecast',
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _buildForecastList(theme, _weather!.forecast),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentWeatherCard(ThemeData theme, WeatherInfo info) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      elevation: 2,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: theme.brightness == Brightness.dark
              ? LinearGradient(
                  colors: [
                    theme.colorScheme.surfaceContainerHighest,
                    theme.colorScheme.surface,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : LinearGradient(
                  colors: [
                    theme.colorScheme.primaryContainer.withValues(alpha: 0.6),
                    theme.colorScheme.surface,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      info.location,
                      style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      'Live Conditions',
                      style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                    ),
                  ],
                ),
                Icon(_getIconData(info.icon), size: 48, color: theme.colorScheme.primary),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  '${info.temperature}°C',
                  style: theme.textTheme.displayMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: theme.colorScheme.primary,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    info.description,
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const Divider(height: 28),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem(Icons.thermostat_outlined, 'Feels Like', '${info.feelsLike}°C', theme),
                _buildStatItem(Icons.water_drop_outlined, 'Humidity', '${info.humidity}%', theme),
                _buildStatItem(Icons.air_rounded, 'Wind', '${info.windSpeed} km/h', theme),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String label, String value, ThemeData theme) {
    return Row(
      children: [
        Icon(icon, size: 20, color: theme.colorScheme.secondary),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
            Text(value, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
          ],
        ),
      ],
    );
  }

  Widget _buildForecastList(ThemeData theme, List<ForecastDay> forecast) {
    return Column(
      children: forecast.map((day) {
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                SizedBox(
                  width: 95,
                  child: Text(
                    day.date,
                    style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                ),
                Icon(_getIconData(day.icon), color: theme.colorScheme.primary, size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    day.description,
                    style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(
                  '${day.maxTemp}° / ${day.minTemp}°',
                  style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}
