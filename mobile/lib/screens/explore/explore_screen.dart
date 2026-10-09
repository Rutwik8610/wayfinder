import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/localization/app_localizations.dart';
import '../../models/tourist_spot.dart';
import '../../providers/spots_provider.dart';
import '../spot_detail/spot_detail_sheet.dart';

class ExploreScreen extends StatelessWidget {
  const ExploreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final spotsProvider = context.watch<SpotsProvider>();

    return Scaffold(
      body: Column(
        children: [
          // Search & Filter Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              decoration: InputDecoration(
                hintText: context.tr('explore.searchPlaceholder'),
                prefixIcon: const Icon(Icons.search),
                isDense: true,
              ),
              onChanged: (val) => spotsProvider.setSearchQuery(val),
            ),
          ),

          // Categories Horizontal List
          SizedBox(
            height: 48,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: SpotsProvider.categories.length,
              itemBuilder: (context, index) {
                final category = SpotsProvider.categories[index];
                final isSelected = spotsProvider.selectedCategory == category;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(category),
                    selected: isSelected,
                    onSelected: (_) => spotsProvider.selectCategory(category),
                    backgroundColor: theme.colorScheme.surface,
                    selectedColor: theme.colorScheme.primary,
                    labelStyle: TextStyle(
                      color: isSelected
                          ? theme.colorScheme.onPrimary
                          : theme.textTheme.bodyMedium?.color,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      fontSize: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 8),

          // Spots Grid / List
          Expanded(
            child: spotsProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : spotsProvider.error != null
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(spotsProvider.error!, textAlign: TextAlign.center),
                              const SizedBox(height: 12),
                              ElevatedButton(
                                onPressed: () => spotsProvider.loadSpots(),
                                child: const Text('Retry'),
                              ),
                            ],
                          ),
                        ),
                      )
                    : spotsProvider.spots.isEmpty
                        ? Center(
                            child: Text(
                              context.tr('explore.noSpotsFound'),
                              style: theme.textTheme.bodyMedium,
                            ),
                          )
                        : GridView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              childAspectRatio: 0.75,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                            ),
                            itemCount: spotsProvider.spots.length,
                            itemBuilder: (context, index) {
                              final spot = spotsProvider.spots[index];
                              return _SpotGridCard(
                                spot: spot,
                                onTap: () => _openSpotModal(context, spot),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }

  void _openSpotModal(BuildContext context, TouristSpot spot) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SpotDetailSheet(spot: spot),
    );
  }
}

class _SpotGridCard extends StatelessWidget {
  final TouristSpot spot;
  final VoidCallback onTap;

  const _SpotGridCard({required this.spot, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final imageUrl = spot.imageUrl?.trim() ?? '';

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (imageUrl.isNotEmpty && imageUrl.startsWith('http'))
                    CachedNetworkImage(
                      imageUrl: imageUrl,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(color: Colors.grey.shade200),
                      errorWidget: (_, __, ___) => Container(
                        color: Colors.grey.shade300,
                        child: const Icon(Icons.image_not_supported, color: Colors.grey),
                      ),
                    )
                  else
                    Container(
                      color: Colors.grey.shade300,
                      child: const Icon(Icons.location_on, color: Colors.grey),
                    ),
                  if (spot.entryFee != null)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.7),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          spot.entryFee! > 0 ? '₹${spot.entryFee!.toInt()}' : 'Free',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    spot.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${spot.city}, ${spot.state}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontSize: 11,
                      color: theme.textTheme.bodySmall?.color?.withOpacity(0.6),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
