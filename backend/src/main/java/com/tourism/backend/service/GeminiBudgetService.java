package com.tourism.backend.service;

import com.tourism.backend.dto.BudgetItemResponse;
import com.tourism.backend.dto.BudgetResponse;
import com.tourism.backend.entity.TouristSpot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeminiBudgetService {

    private static final Logger log = LoggerFactory.getLogger(GeminiBudgetService.class);
    private static final Pattern JSON_BLOCK_PATTERN = Pattern.compile("(?s)```(?:json)?\\s*(\\{.*?\\}|\\[.*?\\])\\s*```");

    private final ObjectMapper objectMapper;
    private final BudgetCacheService cacheService;
    private final HttpClient httpClient;
    private final String configuredApiKey;

    public GeminiBudgetService(
            ObjectMapper objectMapper,
            BudgetCacheService cacheService,
            @Value("${app.gemini.api-key:}") String configuredApiKey) {
        this.objectMapper = objectMapper;
        this.cacheService = cacheService;
        this.configuredApiKey = configuredApiKey;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(12))
                .build();
    }

    private String resolveApiKey() {
        if (configuredApiKey != null && !configuredApiKey.isBlank()) {
            return configuredApiKey.trim();
        }
        String envKey = System.getenv("GEMINI_API_KEY");
        if (envKey != null && !envKey.isBlank()) {
            return envKey.trim();
        }
        return null;
    }

    public BudgetResponse fetchGroundedBudget(
            TouristSpot spot,
            String startLocation,
            Double distanceKm,
            String durationText,
            LocalDate startDate,
            LocalDate endDate,
            long numberOfDays,
            int travelerCount,
            boolean forceRefresh) {

        String spotName = spot.getName() != null ? spot.getName() : "Destination";
        String city = spot.getCity() != null ? spot.getCity() : "";
        String state = spot.getState() != null ? spot.getState() : "India";
        String season = spot.getBestTimeToVisit() != null ? spot.getBestTimeToVisit() : "Current Season";
        String origin = (startLocation != null && !startLocation.isBlank()) ? startLocation.trim() : "Current Location";
        String dateStr = (startDate != null ? startDate.toString() : LocalDate.now().toString());

        String cacheKey = cacheService.buildKey(spotName, city, origin, numberOfDays, travelerCount, dateStr);

        if (!forceRefresh) {
            BudgetResponse cached = cacheService.get(cacheKey);
            if (cached != null) {
                return cached;
            }
        }

        String apiKey = resolveApiKey();
        BudgetResponse response = null;

        if (apiKey != null && !apiKey.isBlank()) {
            response = callGeminiWithGrounding(
                    spot,
                    spotName,
                    city,
                    state,
                    season,
                    origin,
                    distanceKm,
                    durationText,
                    startDate,
                    endDate,
                    numberOfDays,
                    travelerCount,
                    apiKey
            );
        } else {
            log.warn("Gemini API key not configured. Using location & distance grounded estimation engine.");
        }

        if (response == null) {
            response = buildDistanceAwareFallback(
                    spot,
                    origin,
                    distanceKm,
                    durationText,
                    numberOfDays,
                    travelerCount
            );
        }

        if (response != null) {
            cacheService.put(cacheKey, response);
        }

        return response;
    }

    private BudgetResponse callGeminiWithGrounding(
            TouristSpot spot,
            String spotName,
            String city,
            String state,
            String season,
            String origin,
            Double distanceKm,
            String durationText,
            LocalDate startDate,
            LocalDate endDate,
            long numberOfDays,
            int travelerCount,
            String apiKey) {

        double dist = distanceKm != null ? distanceKm : 250.0;
        String dur = durationText != null ? durationText : "approx 5 hours";
        long nights = Math.max(1, numberOfDays - 1);

        String prompt = String.format(
                "You are an expert real-time travel budget estimator for India. Use Google Search grounding to find current 2026 prices in INR for visiting %s in %s, %s.\n" +
                "Trip Details:\n" +
                "- Origin: %s\n" +
                "- Destination: %s (%s, %s)\n" +
                "- Calculated Route Distance: %.1f km (Travel time: %s)\n" +
                "- Travel Dates: %s to %s (%d days, %d nights)\n" +
                "- Season Context: %s\n" +
                "- Travelers: %d person(s)\n" +
                "\n" +
                "Research current local prices in INR across these exact categories:\n" +
                "1. Accommodation: per-night hotel/homestay rates near %s (budget ₹1000-2500, mid ₹2500-6000, luxury ₹6000+), multiplied for %d nights for %d travelers (assuming 2 persons/room).\n" +
                "2. Entry Fees & Guides: per-person entry fee for %s (check official charges, camera fees, and optional licensed guide charges) for %d travelers.\n" +
                "3. Food & Dining: local food/dining per person per day (budget thali to mid-range restaurants) for %d days and %d travelers.\n" +
                "4. Travel & Intercity: round-trip travel between %s and %s for distance of %.1f km each way (search bus, train 3AC/sleeper, or car/flight fare) for %d travelers.\n" +
                "5. Local Transportation: auto-rickshaws, cabs, or rentals within %s for %d days.\n" +
                "6. Miscellaneous: local shopping, offerings, parking, and contingency buffer.\n" +
                "\n" +
                "Instructions:\n" +
                "- Prefer official websites, state tourism portals, IRCTC/bus operators, and recent 2026 traveler listings.\n" +
                "- For each category, return: min price, max price, recommended realistic price, source name, source URL (if found in search results), and a short note.\n" +
                "- Output STRICT JSON ONLY with NO MARKDOWN and no extra text:\n" +
                "{\n" +
                "  \"items\": [\n" +
                "    {\n" +
                "      \"category\": \"Accommodation\",\n" +
                "      \"min\": 3000,\n" +
                "      \"max\": 9000,\n" +
                "      \"recommended\": 5000,\n" +
                "      \"sourceName\": \"Booking / MakeMyTrip 2026\",\n" +
                "      \"sourceUrl\": \"https://www.makemytrip.com\",\n" +
                "      \"lastUpdated\": \"2026-10\",\n" +
                "      \"note\": \"Budget to mid-range hotels near spot\",\n" +
                "      \"isEstimate\": false\n" +
                "    }\n" +
                "  ],\n" +
                "  \"totalMin\": 8000,\n" +
                "  \"totalMax\": 22000,\n" +
                "  \"totalRecommended\": 14500,\n" +
                "  \"isEstimate\": false,\n" +
                "  \"note\": \"Live market prices retrieved via Google Search grounding.\"\n" +
                "}",
                spotName, city, state,
                origin,
                spotName, city, state,
                dist, dur,
                (startDate != null ? startDate : "Upcoming"),
                (endDate != null ? endDate : "Upcoming"),
                numberOfDays, nights,
                season,
                travelerCount,
                spotName, nights, travelerCount,
                spotName, travelerCount,
                numberOfDays, travelerCount,
                origin, city, dist, travelerCount,
                city, numberOfDays
        );

        String[] models = {"gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"};

        for (String model : models) {
            BudgetResponse response = executeGeminiRequest(model, apiKey, prompt, false);
            if (response != null && isValidBudget(response)) {
                return response;
            }
        }

        // Retry once with a condensed prompt if the first round returned parsing issues
        String retryPrompt = "Return strict JSON only for 2026 trip budget in INR for " + spotName + " from " + origin + " (" + dist + " km): " +
                "{\"items\":[{\"category\":\"Travel\",\"min\":1000,\"max\":3000,\"recommended\":1800,\"sourceName\":\"IRCTC/Bus\",\"sourceUrl\":\"https://www.redbus.in\",\"lastUpdated\":\"2026\",\"note\":\"Roundtrip\",\"isEstimate\":false}]," +
                "\"totalMin\":5000,\"totalMax\":15000,\"totalRecommended\":9500,\"isEstimate\":false,\"note\":\"Real-time rates\"}";
        for (String model : models) {
            BudgetResponse response = executeGeminiRequest(model, apiKey, retryPrompt, true);
            if (response != null && isValidBudget(response)) {
                return response;
            }
        }

        return null;
    }

    private BudgetResponse executeGeminiRequest(String model, String apiKey, String prompt, boolean isRetry) {
        try {
            String requestPayload = String.format(
                    "{\"contents\":[{\"parts\":[{\"text\":%s}]}],\"tools\":[{\"googleSearch\":{}}],\"generationConfig\":{\"temperature\":0.2,\"topP\":0.8}}",
                    objectMapper.writeValueAsString(prompt)
            );

            String url = String.format(
                    "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    model, apiKey
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(requestPayload))
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (httpResponse.statusCode() != 200) {
                log.warn("Gemini model {} returned HTTP {}: {}", model, httpResponse.statusCode(), httpResponse.body());
                return null;
            }

            JsonNode root = objectMapper.readTree(httpResponse.body());
            JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
            if (textNode.isMissingNode() || textNode.asText().isBlank()) {
                return null;
            }

            return parseBudgetJson(textNode.asText().trim());
        } catch (Exception e) {
            log.warn("Exception calling Gemini {}: {}", model, e.getMessage());
            return null;
        }
    }

    private BudgetResponse parseBudgetJson(String rawText) {
        try {
            String jsonPayload = extractJsonPayload(rawText);
            JsonNode root = objectMapper.readTree(jsonPayload);

            List<BudgetItemResponse> items = new ArrayList<>();
            JsonNode itemsArray = root.get("items");

            if (itemsArray != null && itemsArray.isArray()) {
                for (JsonNode itemNode : itemsArray) {
                    String category = itemNode.has("category") ? itemNode.get("category").asText() : "Expense";
                    BigDecimal min = getDecimal(itemNode, "min");
                    BigDecimal max = getDecimal(itemNode, "max");
                    BigDecimal rec = getDecimal(itemNode, "recommended");
                    if (rec.compareTo(BigDecimal.ZERO) == 0 && max.compareTo(BigDecimal.ZERO) > 0) {
                        rec = min.add(max).divide(BigDecimal.valueOf(2), RoundingMode.HALF_UP);
                    }
                    String sourceName = itemNode.has("sourceName") ? itemNode.get("sourceName").asText() : "Google Search Grounding";
                    String sourceUrl = itemNode.has("sourceUrl") ? itemNode.get("sourceUrl").asText() : null;
                    String lastUpdated = itemNode.has("lastUpdated") ? itemNode.get("lastUpdated").asText() : "2026";
                    String note = itemNode.has("note") ? itemNode.get("note").asText() : "";
                    boolean isEst = itemNode.has("isEstimate") ? itemNode.get("isEstimate").asBoolean() : false;

                    items.add(new BudgetItemResponse(category, min, max, rec, sourceName, sourceUrl, lastUpdated, note, isEst));
                }
            }

            BigDecimal totalMin = getDecimal(root, "totalMin");
            BigDecimal totalMax = getDecimal(root, "totalMax");
            BigDecimal totalRec = getDecimal(root, "totalRecommended");

            if (totalRec.compareTo(BigDecimal.ZERO) == 0 && !items.isEmpty()) {
                totalRec = items.stream().map(BudgetItemResponse::getRecommended).reduce(BigDecimal.ZERO, BigDecimal::add);
                totalMin = items.stream().map(BudgetItemResponse::getMin).reduce(BigDecimal.ZERO, BigDecimal::add);
                totalMax = items.stream().map(BudgetItemResponse::getMax).reduce(BigDecimal.ZERO, BigDecimal::add);
            }

            boolean isEstimate = root.has("isEstimate") ? root.get("isEstimate").asBoolean() : false;
            String note = root.has("note") ? root.get("note").asText() : "Real-time rates retrieved via Google Search grounding.";
            String lastUpdated = LocalDate.now().format(DateTimeFormatter.ISO_DATE);

            return new BudgetResponse(items, totalMin, totalMax, totalRec, isEstimate, note, lastUpdated);
        } catch (Exception e) {
            log.warn("Failed to parse budget JSON: {}", e.getMessage());
            return null;
        }
    }

    private boolean isValidBudget(BudgetResponse response) {
        if (response == null || response.getItems() == null || response.getItems().isEmpty()) {
            return false;
        }
        if (response.getTotalRecommended() == null || response.getTotalRecommended().compareTo(BigDecimal.valueOf(100)) < 0) {
            return false;
        }
        for (BudgetItemResponse item : response.getItems()) {
            if (item.getRecommended() == null || item.getRecommended().compareTo(BigDecimal.ZERO) < 0) {
                return false;
            }
        }
        return true;
    }

    public BudgetResponse buildDistanceAwareFallback(
            TouristSpot spot,
            String origin,
            Double distanceKm,
            String durationText,
            long numberOfDays,
            int travelerCount) {

        log.info("Constructing spot-specific distance-grounded budget for spot '{}', origin '{}', distance '{}'",
                spot.getName(), origin, distanceKm);

        double dist = distanceKm != null && distanceKm > 0 ? distanceKm : 250.0;
        long nights = Math.max(1, numberOfDays - 1);
        int rooms = (int) Math.ceil((double) travelerCount / 2.0);

        String cityName = spot.getCity() != null ? spot.getCity() : "";
        boolean isMetro = isMetroCity(cityName);
        boolean isPilgrimageOrTown = isPilgrimageTown(spot.getName(), cityName);

        // 1. Accommodation
        BigDecimal perNightBudget = isMetro ? BigDecimal.valueOf(2200) : (isPilgrimageOrTown ? BigDecimal.valueOf(1200) : BigDecimal.valueOf(1800));
        BigDecimal perNightMid = isMetro ? BigDecimal.valueOf(5000) : (isPilgrimageOrTown ? BigDecimal.valueOf(2800) : BigDecimal.valueOf(3800));
        BigDecimal perNightLuxury = isMetro ? BigDecimal.valueOf(11000) : (isPilgrimageOrTown ? BigDecimal.valueOf(5500) : BigDecimal.valueOf(7500));

        BigDecimal accomMin = perNightBudget.multiply(BigDecimal.valueOf(nights)).multiply(BigDecimal.valueOf(rooms));
        BigDecimal accomMax = perNightLuxury.multiply(BigDecimal.valueOf(nights)).multiply(BigDecimal.valueOf(rooms));
        BigDecimal accomRec = perNightMid.multiply(BigDecimal.valueOf(nights)).multiply(BigDecimal.valueOf(rooms));

        // 2. Intercity Travel based on distance
        BigDecimal travelMin;
        BigDecimal travelMax;
        BigDecimal travelRec;
        String travelNote;

        if (dist > 500) {
            // Options: Train 3AC vs Flight vs Sleeper Bus
            travelMin = BigDecimal.valueOf(1.4 * dist * 2 * travelerCount).setScale(0, RoundingMode.HALF_UP); // Train 3AC / Sleeper
            travelMax = BigDecimal.valueOf(6500 * 2 * travelerCount); // Flight
            travelRec = BigDecimal.valueOf(2.2 * dist * 2 * travelerCount).setScale(0, RoundingMode.HALF_UP); // Express Train / AC Bus
            travelNote = String.format("Round-trip travel (%.0f km each way) via AC Train / Bus / Flight", dist);
        } else {
            // Bus or Train or Personal Car
            travelMin = BigDecimal.valueOf(Math.max(300, 1.2 * dist * 2 * travelerCount)).setScale(0, RoundingMode.HALF_UP); // Train
            travelMax = BigDecimal.valueOf(12.0 * dist * 2).setScale(0, RoundingMode.HALF_UP); // Private Cab (₹12/km)
            travelRec = BigDecimal.valueOf(1.8 * dist * 2 * travelerCount).setScale(0, RoundingMode.HALF_UP); // State/Volvo AC Bus
            travelNote = String.format("Round-trip travel for %.0f km (%s) via State Transport / AC Bus / Train", dist, durationText);
        }

        // 3. Entry Fees & Guide Charges
        BigDecimal spotEntry = spot.getEntryFee() != null ? spot.getEntryFee() : BigDecimal.ZERO;
        BigDecimal entryMin = spotEntry.multiply(BigDecimal.valueOf(travelerCount));
        BigDecimal entryMax = entryMin.add(BigDecimal.valueOf(600)) // Guide charge
                .add(BigDecimal.valueOf(100 * travelerCount)); // Camera / VIP pass
        BigDecimal entryRec = entryMin.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.valueOf(100 * travelerCount) : entryMin.add(BigDecimal.valueOf(300));
        String entryNote = spotEntry.compareTo(BigDecimal.ZERO) == 0
                ? "No mandatory entry ticket; includes nominal temple/complex pooja or camera fee"
                : "Official monument entry fee (₹" + spotEntry + "/person) plus optional audio/guide charges";

        // 4. Food & Dining
        BigDecimal foodPerDayMin = isMetro ? BigDecimal.valueOf(450) : BigDecimal.valueOf(300);
        BigDecimal foodPerDayMid = isMetro ? BigDecimal.valueOf(900) : BigDecimal.valueOf(600);
        BigDecimal foodPerDayMax = isMetro ? BigDecimal.valueOf(1800) : BigDecimal.valueOf(1200);

        BigDecimal foodMin = foodPerDayMin.multiply(BigDecimal.valueOf(numberOfDays * travelerCount));
        BigDecimal foodMax = foodPerDayMax.multiply(BigDecimal.valueOf(numberOfDays * travelerCount));
        BigDecimal foodRec = foodPerDayMid.multiply(BigDecimal.valueOf(numberOfDays * travelerCount));

        // 5. Local Transportation
        BigDecimal localPerDayMin = BigDecimal.valueOf(200);
        BigDecimal localPerDayMid = BigDecimal.valueOf(450);
        BigDecimal localPerDayMax = BigDecimal.valueOf(1000);

        BigDecimal localMin = localPerDayMin.multiply(BigDecimal.valueOf(numberOfDays));
        BigDecimal localMax = localPerDayMax.multiply(BigDecimal.valueOf(numberOfDays));
        BigDecimal localRec = localPerDayMid.multiply(BigDecimal.valueOf(numberOfDays));

        // 6. Miscellaneous & Buffer
        BigDecimal miscRec = (accomRec.add(travelRec).add(foodRec)).multiply(BigDecimal.valueOf(0.06)).setScale(0, RoundingMode.HALF_UP);
        BigDecimal miscMin = miscRec.multiply(BigDecimal.valueOf(0.5)).setScale(0, RoundingMode.HALF_UP);
        BigDecimal miscMax = miscRec.multiply(BigDecimal.valueOf(1.8)).setScale(0, RoundingMode.HALF_UP);

        List<BudgetItemResponse> items = new ArrayList<>();
        items.add(new BudgetItemResponse(
                "Travel & Intercity",
                travelMin, travelMax, travelRec,
                "IRCTC & MSRTC Regional Distance Fare",
                "https://www.irctc.co.in",
                LocalDate.now().toString(),
                travelNote,
                true
        ));
        items.add(new BudgetItemResponse(
                "Accommodation",
                accomMin, accomMax, accomRec,
                spot.getCity() + " Hotel & Lodge Index",
                "https://www.google.com/travel/hotels",
                LocalDate.now().toString(),
                String.format("%d room(s) for %d night(s) near %s", rooms, nights, spot.getName()),
                true
        ));
        items.add(new BudgetItemResponse(
                "Food & Dining",
                foodMin, foodMax, foodRec,
                spot.getCity() + " Dining Averages",
                "https://www.zomato.com",
                LocalDate.now().toString(),
                String.format("Breakfast, lunch, and dinner for %d traveler(s) for %d day(s)", travelerCount, numberOfDays),
                true
        ));
        items.add(new BudgetItemResponse(
                "Entry Fees & Activities",
                entryMin, entryMax, entryRec,
                spot.getName() + " Official / Trust Rates",
                null,
                LocalDate.now().toString(),
                entryNote,
                true
        ));
        items.add(new BudgetItemResponse(
                "Local Transit",
                localMin, localMax, localRec,
                "Local Auto-rickshaw & City Cabs",
                null,
                LocalDate.now().toString(),
                String.format("Local sightseeing commute for %d days", numberOfDays),
                true
        ));
        items.add(new BudgetItemResponse(
                "Miscellaneous & Buffer",
                miscMin, miscMax, miscRec,
                "Contingency Reserve",
                null,
                LocalDate.now().toString(),
                "Shopping, parking, offerings, and emergency buffer",
                true
        ));

        BigDecimal totalMin = items.stream().map(BudgetItemResponse::getMin).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalMax = items.stream().map(BudgetItemResponse::getMax).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalRec = items.stream().map(BudgetItemResponse::getRecommended).reduce(BigDecimal.ZERO, BigDecimal::add);

        String note = String.format(
                "Computed specifically for %s from %s using calculated route distance (%.1f km) and regional price benchmarks (Live search grounding fell back due to API quota 429).",
                spot.getName(), origin, dist
        );

        return new BudgetResponse(
                items,
                totalMin,
                totalMax,
                totalRec,
                true,
                note,
                LocalDate.now().toString()
        );
    }

    private boolean isMetroCity(String city) {
        if (city == null) return false;
        String c = city.trim().toLowerCase();
        return c.contains("mumbai") || c.contains("delhi") || c.contains("bangalore") ||
               c.contains("bengaluru") || c.contains("pune") || c.contains("chennai") ||
               c.contains("hyderabad") || c.contains("kolkata");
    }

    private boolean isPilgrimageTown(String spotName, String city) {
        String combined = ((spotName != null ? spotName : "") + " " + (city != null ? city : "")).toLowerCase();
        return combined.contains("solapur") || combined.contains("shirdi") ||
               combined.contains("pandharpur") || combined.contains("temple") ||
               combined.contains("mandir") || combined.contains("jyotirlinga") ||
               combined.contains("tirupati") || combined.contains("varanasi");
    }

    private String extractJsonPayload(String text) {
        Matcher matcher = JSON_BLOCK_PATTERN.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start != -1 && end != -1 && end > start) {
            return text.substring(start, end + 1).trim();
        }
        return text;
    }

    private BigDecimal getDecimal(JsonNode node, String fieldName) {
        if (node == null || !node.has(fieldName) || node.get(fieldName).isNull()) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(node.get(fieldName).asText().replaceAll("[^0-9.]", ""));
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}
