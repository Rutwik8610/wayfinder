package com.tourism.backend.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.tourism.backend.dto.AssistantChatRequest;
import com.tourism.backend.dto.AssistantChatResponse;
import com.tourism.backend.entity.TouristSpot;
import com.tourism.backend.repository.TouristSpotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AssistantService {

    private static final Logger log = LoggerFactory.getLogger(AssistantService.class);

    private final TouristSpotRepository spotRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String configuredApiKey;

    // In-memory IP rate-limiting tracker (sliding 60-second window, max 25 requests/min)
    private static final int MAX_REQUESTS_PER_MINUTE = 25;
    private final Map<String, List<Long>> rateLimitMap = new ConcurrentHashMap<>();

    public AssistantService(
            TouristSpotRepository spotRepository,
            ObjectMapper objectMapper,
            @Value("${app.gemini.api-key:}") String configuredApiKey) {
        this.spotRepository = spotRepository;
        this.objectMapper = objectMapper;
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

    public boolean isRateLimited(String clientIp) {
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = "anonymous";
        }
        long now = System.currentTimeMillis();
        long windowStart = now - 60_000L;

        List<Long> timestamps = rateLimitMap.computeIfAbsent(clientIp, k -> Collections.synchronizedList(new ArrayList<>()));
        synchronized (timestamps) {
            timestamps.removeIf(t -> t < windowStart);
            if (timestamps.size() >= MAX_REQUESTS_PER_MINUTE) {
                return true;
            }
            timestamps.add(now);
            return false;
        }
    }

    public AssistantChatResponse processChat(AssistantChatRequest request, String clientIp) {
        if (isRateLimited(clientIp)) {
            return new AssistantChatResponse(
                    "You are sending messages too quickly. Please wait a moment before sending another message.",
                    null,
                    false
            );
        }

        String userMessage = request.getMessage() != null ? request.getMessage().trim() : "";
        if (userMessage.isBlank()) {
            return new AssistantChatResponse("How can I help you plan your next journey?", null, false);
        }

        // 1. Detect Spot from Database
        TouristSpot matchedSpot = resolveSpotContext(request.getCurrentSpot(), userMessage);
        String spotContextText = "";
        String spotName = null;
        if (matchedSpot != null) {
            spotName = matchedSpot.getName();
            spotContextText = formatSpotContext(matchedSpot);
        }

        // 2. Call Gemini with Google Search Grounding
        String apiKey = resolveApiKey();
        if (apiKey != null && !apiKey.isBlank()) {
            String geminiReply = callGeminiForChat(request, spotContextText, apiKey);
            if (geminiReply != null && !geminiReply.isBlank()) {
                return new AssistantChatResponse(geminiReply, spotName, true);
            }
        }

        // 3. Graceful Fallback if Gemini is unreachable
        String fallbackReply = buildFallbackReply(userMessage, matchedSpot, request.getLanguage());
        return new AssistantChatResponse(fallbackReply, spotName, false);
    }

    private TouristSpot resolveSpotContext(String currentSpot, String message) {
        // Priority 1: explicitly passed currentSpot
        if (currentSpot != null && !currentSpot.isBlank()) {
            Optional<TouristSpot> direct = spotRepository.findFirstByNameIgnoreCase(currentSpot.trim());
            if (direct.isPresent()) return direct.get();

            List<TouristSpot> matches = spotRepository.findByNameContainingIgnoreCase(currentSpot.trim());
            if (!matches.isEmpty()) return matches.get(0);
        }

        // Priority 2: check if message mentions any known spot in database
        try {
            List<TouristSpot> allSpots = spotRepository.findAll();
            for (TouristSpot s : allSpots) {
                if (s.getName() != null && !s.getName().isBlank()) {
                    if (message.toLowerCase().contains(s.getName().toLowerCase().trim())) {
                        return s;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Could not scan spots from database: {}", e.getMessage());
        }

        return null;
    }

    private String formatSpotContext(TouristSpot spot) {
        StringBuilder sb = new StringBuilder();
        sb.append("[Website Database Spot Details: ");
        sb.append("Spot Name: ").append(spot.getName()).append("; ");
        if (spot.getCity() != null) sb.append("City: ").append(spot.getCity()).append("; ");
        if (spot.getState() != null) sb.append("State: ").append(spot.getState()).append("; ");
        if (spot.getEntryFee() != null) {
            if (spot.getEntryFee().doubleValue() == 0) {
                sb.append("Entry Fee: Free entry; ");
            } else {
                sb.append("Entry Fee: ₹").append(spot.getEntryFee()).append("; ");
            }
        }
        if (spot.getOpeningTime() != null && spot.getClosingTime() != null) {
            sb.append("Timings: ").append(spot.getOpeningTime()).append(" to ").append(spot.getClosingTime()).append("; ");
        }
        if (spot.getBestTimeToVisit() != null) sb.append("Best Time to Visit: ").append(spot.getBestTimeToVisit()).append("; ");
        if (spot.getDescription() != null) sb.append("Description: ").append(spot.getDescription()).append("; ");
        if (spot.getAttractions() != null) sb.append("Highlights/Attractions: ").append(spot.getAttractions()).append("; ");
        sb.append("]");
        return sb.toString();
    }

    private String callGeminiForChat(AssistantChatRequest request, String spotContextText, String apiKey) {
        String isHindi = "hi".equalsIgnoreCase(request.getLanguage()) ? "Respond in clear, natural Hindi." : "Respond in English.";
        String baseSystemPrompt = "You are a friendly, knowledgeable travel assistant for this tourism website (ExploreSphere / Wayfinder). " +
                "Help travelers with tourist spots, trip itineraries, budgets, weather, transportation routes, local food and practical travel tips. " +
                "Keep answers concise, helpful, and formatted with clean paragraphs or bullet points where appropriate. " +
                "If asked about something completely unrelated to travel, tourism, geography, culture, food, or trip planning, politely redirect back to travel. " +
                isHindi;

        if (!spotContextText.isBlank()) {
            baseSystemPrompt += " Use the following real database information about the destination whenever relevant: " + spotContextText;
        }

        String[] models = {"gemini-flash-lite-latest", "gemini-flash-latest", "gemini-3.5-flash-lite"};

        for (String model : models) {
            String reply = executeGeminiChat(model, apiKey, baseSystemPrompt, request, true);
            if (reply != null && !reply.isBlank()) {
                return reply;
            }
            // If search tool was rate-limited, immediately try standard fast completion without search
            reply = executeGeminiChat(model, apiKey, baseSystemPrompt, request, false);
            if (reply != null && !reply.isBlank()) {
                return reply;
            }
        }

        return null;
    }

    private String executeGeminiChat(String model, String apiKey, String baseSystemPrompt, AssistantChatRequest request, boolean withSearch) {
        try {
            List<Map<String, Object>> contentsList = new ArrayList<>();

            if (request.getHistory() != null && !request.getHistory().isEmpty()) {
                int start = Math.max(0, request.getHistory().size() - 6);
                for (int i = start; i < request.getHistory().size(); i++) {
                    AssistantChatRequest.ChatMessage hist = request.getHistory().get(i);
                    String role = "assistant".equalsIgnoreCase(hist.getRole()) ? "model" : "user";
                    if (hist.getContent() != null && !hist.getContent().isBlank()) {
                        contentsList.add(Map.of(
                                "role", role,
                                "parts", List.of(Map.of("text", hist.getContent().trim()))
                        ));
                    }
                }
            }

            contentsList.add(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", request.getMessage().trim()))
            ));

            Map<String, Object> payloadMap = new LinkedHashMap<>();
            payloadMap.put("system_instruction", Map.of(
                    "parts", List.of(Map.of("text", baseSystemPrompt))
            ));
            payloadMap.put("contents", contentsList);
            if (withSearch) {
                payloadMap.put("tools", List.of(Map.of("googleSearch", Collections.emptyMap())));
            }
            payloadMap.put("generationConfig", Map.of(
                    "temperature", 0.6,
                    "topP", 0.9,
                    "maxOutputTokens", 1024
            ));

            String requestPayload = objectMapper.writeValueAsString(payloadMap);
            String url = String.format(
                    "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    model, apiKey
            );

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(requestPayload))
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (httpResponse.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(httpResponse.body());
                JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
                if (!textNode.isMissingNode() && !textNode.asText().isBlank()) {
                    return textNode.asText().trim();
                }
            } else {
                log.warn("Gemini model {} (withSearch={}) returned HTTP {}: {}", model, withSearch, httpResponse.statusCode(), httpResponse.body());
            }
        } catch (Exception e) {
            log.warn("Gemini chat exception with model {} (withSearch={}): {}", model, withSearch, e.getMessage());
        }
        return null;
    }

    private String buildFallbackReply(String userMessage, TouristSpot spot, String language) {
        boolean isHindi = "hi".equalsIgnoreCase(language);

        if (spot != null) {
            String name = spot.getName();
            String fee = (spot.getEntryFee() != null && spot.getEntryFee().doubleValue() == 0) ? "Free Entry" : ("₹" + spot.getEntryFee());
            String hours = (spot.getOpeningTime() != null && spot.getClosingTime() != null) ? (spot.getOpeningTime() + " - " + spot.getClosingTime()) : "Daytime hours";
            String bestTime = spot.getBestTimeToVisit() != null ? spot.getBestTimeToVisit() : "October through March";

            if (isHindi) {
                return String.format(
                        "**%s** (%s) के बारे में जानकारी:\n\n" +
                                "• **प्रवेश शुल्क**: %s\n" +
                                "• **समय**: %s\n" +
                                "• **घूमने का सबसे अच्छा समय**: %s\n\n" +
                                "%s\n\nआप इस गंतव्य के लिए 'Plan Trip' पृष्ठ पर संपूर्ण बजट और मार्ग योजना भी देख सकते हैं!",
                        name,
                        spot.getCity() != null ? spot.getCity() : "महाराष्ट्र",
                        fee,
                        hours,
                        bestTime,
                        spot.getDescription() != null ? spot.getDescription() : ""
                );
            } else {
                return String.format(
                        "Here is what you need to know about **%s** (%s):\n\n" +
                                "• **Entry Fee**: %s\n" +
                                "• **Hours**: %s\n" +
                                "• **Best Time to Visit**: %s\n\n" +
                                "%s\n\nYou can also click 'Plan Trip' to generate a full route map and real-time budget for this destination!",
                        name,
                        spot.getCity() != null ? spot.getCity() : "India",
                        fee,
                        hours,
                        bestTime,
                        spot.getDescription() != null ? spot.getDescription() : ""
                );
            }
        }

        // Generic fallback redirect
        if (isHindi) {
            return "नमस्ते! मैं आपका पर्यटन सहायक हूँ। आप मुझसे किसी भी पर्यटन स्थल, यात्रा कार्यक्रम, बजट या स्थानीय व्यंजनों के बारे में पूछ सकते हैं। आप एक्सप्लोर पेज पर जाकर भी नए गंतव्य देख सकते हैं!";
        } else {
            return "Hello! I'm your AI travel companion. Ask me anything about destination spots, trip itineraries, budgets, weather, or local cuisine. You can also explore curated spots on our Explore page or generate a custom itinerary on the Plan Trip page!";
        }
    }
}
