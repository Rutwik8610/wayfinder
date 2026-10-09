import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/localization/app_localizations.dart';
import '../assistant/chat_screen.dart';
import '../explore/explore_screen.dart';
import '../home/home_screen.dart';
import '../live_info/weather_screen.dart';
import '../plan/plan_trip_screen.dart';

class MainShell extends StatefulWidget {
  final int initialIndex;

  const MainShell({super.key, this.initialIndex = 0});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  late int _currentIndex;

  final List<Widget> _pages = const [
    HomeScreen(),
    ExploreScreen(),
    PlanTripScreen(),
    WeatherScreen(),
    ChatScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.explore, color: theme.colorScheme.primary, size: 22),
            const SizedBox(width: 8),
            const Text(
              'WayFinder',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: context.tr('settings.title'),
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined),
            selectedIcon: const Icon(Icons.home),
            label: context.tr('nav.home'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.compass_calibration_outlined),
            selectedIcon: const Icon(Icons.compass_calibration),
            label: context.tr('nav.explore'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.map_outlined),
            selectedIcon: const Icon(Icons.map),
            label: context.tr('nav.plan'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.cloud_outlined),
            selectedIcon: const Icon(Icons.cloud),
            label: context.tr('nav.liveInfo'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.auto_awesome_outlined),
            selectedIcon: const Icon(Icons.auto_awesome),
            label: context.tr('nav.assistant'),
          ),
        ],
      ),
    );
  }
}
