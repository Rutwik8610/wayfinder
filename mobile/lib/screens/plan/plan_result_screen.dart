import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/localization/app_localizations.dart';
import '../../providers/trip_planner_provider.dart';

class PlanResultScreen extends StatefulWidget {
  const PlanResultScreen({super.key});

  @override
  State<PlanResultScreen> createState() => _PlanResultScreenState();
}

class _PlanResultScreenState extends State<PlanResultScreen> {
  final Set<Marker> _markers = {};
  final Set<Polyline> _polylines = {};

  final currencyFormatter = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 0,
  );

  @override
  void initState() {
    super.initState();
    _setupMapData();
  }

  void _setupMapData() {
    final planner = context.read<TripPlannerProvider>();
    final plan = planner.planResult;
    if (plan == null) return;

    final route = plan.routeInfo;
    final spot = plan.spotInfo;

    final destLat = route?.destinationLat ?? spot.latitude ?? 17.6599;
    final destLng = route?.destinationLng ?? spot.longitude ?? 75.9064;
    final origLat = route?.originLat ?? (destLat - 0.2);
    final origLng = route?.originLng ?? (destLng - 0.2);

    _markers.add(
      Marker(
        markerId: const MarkerId('origin'),
        position: LatLng(origLat, origLng),
        infoWindow: InfoWindow(title: planner.currentLocation.isNotEmpty ? planner.currentLocation : 'Starting Point'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
      ),
    );

    _markers.add(
      Marker(
        markerId: const MarkerId('destination'),
        position: LatLng(destLat, destLng),
        infoWindow: InfoWindow(title: spot.name),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
      ),
    );

    _polylines.add(
      Polyline(
        polylineId: const PolylineId('route_line'),
        color: const Color(0xFF0F766E),
        width: 4,
        points: [
          LatLng(origLat, origLng),
          LatLng(destLat, destLng),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final planner = context.watch<TripPlannerProvider>();
    final plan = planner.planResult;

    if (plan == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Trip Plan')),
        body: const Center(child: Text('No active trip plan.')),
      );
    }

    final spot = plan.spotInfo;
    final route = plan.routeInfo;
    final budget = plan.budgetPlan;

    final destLat = route?.destinationLat ?? spot.latitude ?? 17.6599;
    final destLng = route?.destinationLng ?? spot.longitude ?? 75.9064;
    final origLat = route?.originLat ?? (destLat - 0.2);
    final origLng = route?.originLng ?? (destLng - 0.2);

    final midLat = (origLat + destLat) / 2.0;
    final midLng = (origLng + destLng) / 2.0;

    return Scaffold(
      appBar: AppBar(
        title: Text(spot.name),
        actions: [
          IconButton(
            icon: planner.isRefreshingBudget
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.refresh),
            tooltip: 'Refresh Budget',
            onPressed: planner.isRefreshingBudget
                ? null
                : () => planner.refreshBudget(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // -----------------------------------------------------------
            // 1. SPOT INFO FIRST (As required by instructions)
            // -----------------------------------------------------------
            Card(
              clipBehavior: Clip.antiAlias,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (spot.imageUrl != null && spot.imageUrl!.trim().startsWith('http'))
                    AspectRatio(
                      aspectRatio: 16 / 9,
                      child: CachedNetworkImage(
                        imageUrl: spot.imageUrl!.trim(),
                        fit: BoxFit.cover,
                        placeholder: (_, __) => Container(color: Colors.grey.shade200),
                        errorWidget: (_, __, ___) => Container(
                          color: Colors.grey.shade300,
                          child: const Icon(Icons.location_on, size: 40),
                        ),
                      ),
                    ),
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          spot.name,
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(Icons.location_on, size: 16, color: theme.colorScheme.primary),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                '${spot.city}, ${spot.state}, ${spot.country}',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 24),
                        Text(
                          context.tr('common.description'),
                          style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          spot.description.isNotEmpty ? spot.description : 'Scenic and historic destination.',
                          style: theme.textTheme.bodyMedium?.copyWith(height: 1.4),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            if (spot.entryFee != null)
                              Expanded(
                                child: _InfoBox(
                                  title: context.tr('plan.entryFee'),
                                  value: spot.entryFee! > 0
                                      ? currencyFormatter.format(spot.entryFee!)
                                      : 'Free',
                                ),
                              ),
                            if (spot.bestTimeToVisit != null) ...[
                              const SizedBox(width: 8),
                              Expanded(
                                child: _InfoBox(
                                  title: context.tr('plan.bestTime'),
                                  value: spot.bestTimeToVisit!,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // -----------------------------------------------------------
            // 2. VIEW MAP SECTION WITH ROUTE (google_maps_flutter)
            // -----------------------------------------------------------
            Row(
              children: [
                Icon(Icons.navigation_outlined, color: theme.colorScheme.primary, size: 20),
                const SizedBox(width: 8),
                Text(
                  'View Map & Route',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Card(
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  SizedBox(
                    height: 260,
                    child: GoogleMap(
                      initialCameraPosition: CameraPosition(
                        target: LatLng(midLat, midLng),
                        zoom: 9.5,
                      ),
                      markers: _markers,
                      polylines: _polylines,
                      zoomControlsEnabled: false,
                      myLocationButtonEnabled: false,
                    ),
                  ),

                  // Distance and Time BELOW the map (As explicitly requested)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.straighten, color: theme.colorScheme.primary, size: 20),
                            const SizedBox(width: 8),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Distance',
                                  style: TextStyle(fontSize: 11, color: Colors.grey),
                                ),
                                Text(
                                  route?.distanceKm != null
                                      ? '${route!.distanceKm!.toStringAsFixed(1)} km'
                                      : 'Calculated in route',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Container(width: 1, height: 28, color: Colors.grey.withOpacity(0.3)),
                        Row(
                          children: [
                            Icon(Icons.access_time, color: theme.colorScheme.primary, size: 20),
                            const SizedBox(width: 8),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Est. Travel Time',
                                  style: TextStyle(fontSize: 11, color: Colors.grey),
                                ),
                                Text(
                                  route?.durationText.isNotEmpty == true
                                      ? route!.durationText
                                      : 'Estimated',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // -----------------------------------------------------------
            // 3. BUDGET PLAN AT THE BOTTOM (Accommodation, Entry fee, Food, Travel)
            // -----------------------------------------------------------
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.currency_rupee, color: theme.colorScheme.primary, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Budget Plan Breakdown',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                if (budget.isEstimate)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.amber.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'AI Grounded',
                      style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  children: [
                    _BudgetRow(
                      icon: Icons.directions_bus_outlined,
                      label: 'Travel & Transportation',
                      amount: currencyFormatter.format(budget.transportation),
                    ),
                    const Divider(height: 18),
                    _BudgetRow(
                      icon: Icons.hotel_outlined,
                      label: 'Accommodation',
                      amount: currencyFormatter.format(budget.accommodation),
                    ),
                    const Divider(height: 18),
                    _BudgetRow(
                      icon: Icons.restaurant_outlined,
                      label: 'Food & Dining',
                      amount: currencyFormatter.format(budget.food),
                    ),
                    const Divider(height: 18),
                    _BudgetRow(
                      icon: Icons.confirmation_number_outlined,
                      label: 'Entry Fees & Tickets',
                      amount: currencyFormatter.format(budget.entryFees),
                    ),
                    if (budget.localTransport > 0) ...[
                      const Divider(height: 18),
                      _BudgetRow(
                        icon: Icons.local_taxi_outlined,
                        label: 'Local Transport',
                        amount: currencyFormatter.format(budget.localTransport),
                      ),
                    ],
                    if (budget.miscellaneous > 0) ...[
                      const Divider(height: 18),
                      _BudgetRow(
                        icon: Icons.shopping_bag_outlined,
                        label: 'Miscellaneous',
                        amount: currencyFormatter.format(budget.miscellaneous),
                      ),
                    ],
                    const Divider(height: 24, thickness: 1.5),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Total Estimated Budget',
                          style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          currencyFormatter.format(budget.total),
                          style: theme.textTheme.titleLarge?.copyWith(
                            color: theme.colorScheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    if (budget.note != null && budget.note!.isNotEmpty) ...[
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          budget.note!,
                          style: theme.textTheme.bodySmall?.copyWith(fontSize: 11),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}

class _BudgetRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String amount;

  const _BudgetRow({
    required this.icon,
    required this.label,
    required this.amount,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Colors.grey.shade600),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
          ),
        ),
        Text(
          amount,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
      ],
    );
  }
}

class _InfoBox extends StatelessWidget {
  final String title;
  final String value;

  const _InfoBox({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 11, color: Colors.grey)),
          const SizedBox(height: 4),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          ),
        ],
      ),
    );
  }
}
