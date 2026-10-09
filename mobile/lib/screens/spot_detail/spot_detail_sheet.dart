import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/localization/app_localizations.dart';
import '../../models/tourist_spot.dart';
import '../../providers/trip_planner_provider.dart';

class SpotDetailSheet extends StatelessWidget {
  final TouristSpot spot;

  const SpotDetailSheet({super.key, required this.spot});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final imageUrl = spot.imageUrl?.trim() ?? '';

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, controller) {
        return Container(
          decoration: BoxDecoration(
            color: theme.scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            children: [
              // Drag Handle
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12, bottom: 8),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade400,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              Expanded(
                child: ListView(
                  controller: controller,
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                  children: [
                    // Spot Image
                    ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: AspectRatio(
                        aspectRatio: 16 / 9,
                        child: imageUrl.isNotEmpty && imageUrl.startsWith('http')
                            ? CachedNetworkImage(
                                imageUrl: imageUrl,
                                fit: BoxFit.cover,
                                placeholder: (_, __) => Container(color: Colors.grey.shade200),
                                errorWidget: (_, __, ___) => Container(
                                  color: Colors.grey.shade300,
                                  child: const Icon(Icons.image_not_supported, size: 40),
                                ),
                              )
                            : Container(
                                color: Colors.grey.shade300,
                                child: const Icon(Icons.location_on, size: 40),
                              ),
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Title & City
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
                        Text(
                          '${spot.city}, ${spot.state}, ${spot.country}',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),

                    // Quick Specs (Entry Fee, Best Time)
                    Row(
                      children: [
                        if (spot.entryFee != null) ...[
                          Expanded(
                            child: _InfoPill(
                              icon: Icons.confirmation_number_outlined,
                              title: context.tr('plan.entryFee'),
                              value: spot.entryFee! > 0 ? '₹${spot.entryFee!.toInt()}' : 'Free Entry',
                            ),
                          ),
                          const SizedBox(width: 10),
                        ],
                        if (spot.bestTimeToVisit != null && spot.bestTimeToVisit!.isNotEmpty)
                          Expanded(
                            child: _InfoPill(
                              icon: Icons.calendar_month_outlined,
                              title: context.tr('plan.bestTime'),
                              value: spot.bestTimeToVisit!,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Description
                    Text(
                      context.tr('common.description'),
                      style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      spot.description.isNotEmpty ? spot.description : 'Explore this fascinating attraction.',
                      style: theme.textTheme.bodyMedium?.copyWith(height: 1.5),
                    ),
                    const SizedBox(height: 16),

                    // Highlights
                    if (spot.attractions != null && spot.attractions!.isNotEmpty) ...[
                      Text(
                        context.tr('plan.nearbyAttractions'),
                        style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        spot.attractions!,
                        style: theme.textTheme.bodyMedium?.copyWith(height: 1.4),
                      ),
                      const SizedBox(height: 20),
                    ],

                    // "Plan Trip Here" Button
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        final planner = context.read<TripPlannerProvider>();
                        planner.reset();
                        planner.setDestination(spot.name, spot);
                        context.go('/home'); // Or to plan tab
                      },
                      icon: const Icon(Icons.arrow_forward),
                      label: Text(context.tr('explore.planHere')),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _InfoPill extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;

  const _InfoPill({
    required this.icon,
    required this.title,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.dividerColor.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: theme.colorScheme.primary),
              const SizedBox(width: 6),
              Text(
                title,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.bodySmall?.copyWith(fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
