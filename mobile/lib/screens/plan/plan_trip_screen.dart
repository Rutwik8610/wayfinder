import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/localization/app_localizations.dart';
import '../../providers/trip_planner_provider.dart';

class PlanTripScreen extends StatelessWidget {
  const PlanTripScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final planner = context.watch<TripPlannerProvider>();

    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.auto_awesome, color: theme.colorScheme.primary, size: 20),
                ),
                const SizedBox(width: 10),
                Text(
                  context.tr('plan.eyebrow'),
                  style: TextStyle(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                    letterSpacing: 1.1,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              context.tr('plan.title'),
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              context.tr('plan.intro'),
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: 20),

            // Step Indicator Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Step ${planner.currentStep} of 3',
                          style: TextStyle(
                            color: theme.colorScheme.primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                        Icon(
                          planner.currentStep == 1
                              ? Icons.location_on_outlined
                              : planner.currentStep == 2
                                  ? Icons.calendar_today_outlined
                                  : Icons.interests_outlined,
                          color: theme.colorScheme.primary,
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    LinearProgressIndicator(
                      value: planner.currentStep / 3.0,
                      backgroundColor: theme.colorScheme.surface,
                      color: theme.colorScheme.primary,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    const SizedBox(height: 20),

                    // Step 1: Location & Destination
                    if (planner.currentStep == 1) ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            context.tr('plan.currentLocation'),
                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                          ),
                          TextButton.icon(
                            onPressed: planner.isGeoLoading
                                ? null
                                : () => planner.detectCurrentLocation(),
                            icon: planner.isGeoLoading
                                ? const SizedBox(
                                    width: 12,
                                    height: 12,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  )
                                : const Icon(Icons.my_location, size: 14),
                            label: Text(
                              planner.isGeoLoading ? 'Detecting...' : 'Use GPS',
                              style: const TextStyle(fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      TextFormField(
                        initialValue: planner.currentLocation,
                        decoration: const InputDecoration(
                          hintText: 'e.g. Pune, Mumbai, Solapur',
                          prefixIcon: Icon(Icons.near_me_outlined),
                        ),
                        onChanged: (val) => planner.setCurrentLocation(val),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        context.tr('plan.destination'),
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                      const SizedBox(height: 4),
                      TextFormField(
                        initialValue: planner.destination,
                        decoration: InputDecoration(
                          hintText: context.tr('plan.destinationPlaceholder'),
                          prefixIcon: const Icon(Icons.place_outlined),
                        ),
                        onChanged: (val) => planner.setDestination(val),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        context.tr('plan.travelers'),
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          IconButton.outlined(
                            icon: const Icon(Icons.remove),
                            onPressed: planner.travelerCount > 1
                                ? () => planner.setTravelerCount(planner.travelerCount - 1)
                                : null,
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text(
                              '${planner.travelerCount}',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          IconButton.outlined(
                            icon: const Icon(Icons.add),
                            onPressed: () => planner.setTravelerCount(planner.travelerCount + 1),
                          ),
                        ],
                      ),
                    ],

                    // Step 2: Date Range
                    if (planner.currentStep == 2) ...[
                      Text(
                        context.tr('plan.whenHeading'),
                        style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () async {
                                final now = DateTime.now();
                                final picked = await showDatePicker(
                                  context: context,
                                  initialDate: planner.fromDate ?? now,
                                  firstDate: now,
                                  lastDate: now.add(const Duration(days: 365)),
                                );
                                if (picked != null) {
                                  planner.setDateRange(
                                    picked,
                                    planner.toDate != null && planner.toDate!.isAfter(picked)
                                        ? planner.toDate!
                                        : picked.add(const Duration(days: 2)),
                                  );
                                }
                              },
                              icon: const Icon(Icons.calendar_today, size: 16),
                              label: Text(
                                planner.fromDate != null
                                    ? DateFormat('dd MMM yyyy').format(planner.fromDate!)
                                    : context.tr('plan.from'),
                                style: const TextStyle(fontSize: 12),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () async {
                                final start = planner.fromDate ?? DateTime.now();
                                final picked = await showDatePicker(
                                  context: context,
                                  initialDate: planner.toDate ?? start.add(const Duration(days: 2)),
                                  firstDate: start,
                                  lastDate: start.add(const Duration(days: 365)),
                                );
                                if (picked != null) {
                                  planner.setDateRange(start, picked);
                                }
                              },
                              icon: const Icon(Icons.event, size: 16),
                              label: Text(
                                planner.toDate != null
                                    ? DateFormat('dd MMM yyyy').format(planner.toDate!)
                                    : context.tr('plan.to'),
                                style: const TextStyle(fontSize: 12),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],

                    // Step 3: Interests
                    if (planner.currentStep == 3) ...[
                      Text(
                        context.tr('plan.chooseInterests'),
                        style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: TripPlannerProvider.availableInterests.map((interest) {
                          final selected = planner.selectedInterests.contains(interest);
                          return FilterChip(
                            label: Text(interest),
                            selected: selected,
                            onSelected: (_) => planner.toggleInterest(interest),
                            backgroundColor: theme.colorScheme.surface,
                            selectedColor: theme.colorScheme.primary,
                            labelStyle: TextStyle(
                              color: selected
                                  ? theme.colorScheme.onPrimary
                                  : theme.textTheme.bodyMedium?.color,
                              fontWeight: selected ? FontWeight.bold : FontWeight.normal,
                            ),
                          );
                        }).toList(),
                      ),
                    ],

                    // Error Message
                    if (planner.errorMessage != null) ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.red.shade200),
                        ),
                        child: Text(
                          planner.errorMessage!,
                          style: TextStyle(color: Colors.red.shade800, fontSize: 12),
                        ),
                      ),
                    ],

                    const SizedBox(height: 24),

                    // Wizard Navigation Buttons
                    Row(
                      children: [
                        if (planner.currentStep > 1)
                          OutlinedButton(
                            onPressed: () => planner.setStep(planner.currentStep - 1),
                            child: const Text('Back'),
                          ),
                        const Spacer(),
                        if (planner.currentStep < 3)
                          ElevatedButton(
                            onPressed: (planner.currentStep == 1 && planner.canProceedStep1()) ||
                                    (planner.currentStep == 2 && planner.canProceedStep2())
                                ? () => planner.setStep(planner.currentStep + 1)
                                : null,
                            child: const Text('Next'),
                          )
                        else
                          ElevatedButton.icon(
                            onPressed: planner.canProceedStep3() && !planner.isLoading
                                ? () async {
                                    final ok = await planner.generatePlan();
                                    if (ok && context.mounted) {
                                      context.push('/plan-result');
                                    }
                                  }
                                : null,
                            icon: planner.isLoading
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Icon(Icons.bolt),
                            label: Text(planner.isLoading ? 'Generating Plan...' : 'Generate Plan'),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
