package com.tourism.backend.service;

import com.tourism.backend.dto.BudgetResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BudgetCacheService {

    private static final Logger log = LoggerFactory.getLogger(BudgetCacheService.class);
    private static final Duration TTL = Duration.ofHours(1);

    private record CacheEntry(BudgetResponse budget, Instant expiresAt) {
        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public String buildKey(String spotName, String city, String startLocation, long numberOfDays, int travelerCount, String startDate) {
        return String.format("%s|%s|%s|%d|%d|%s",
                (spotName != null ? spotName.trim().toLowerCase() : ""),
                (city != null ? city.trim().toLowerCase() : ""),
                (startLocation != null ? startLocation.trim().toLowerCase() : ""),
                numberOfDays,
                travelerCount,
                (startDate != null ? startDate.trim() : "")
        );
    }

    public BudgetResponse get(String key) {
        if (key == null) return null;
        CacheEntry entry = cache.get(key);
        if (entry == null) {
            return null;
        }
        if (entry.isExpired()) {
            cache.remove(key);
            log.debug("Budget cache expired for key: {}", key);
            return null;
        }
        log.info("Budget cache hit for key: {}", key);
        return entry.budget();
    }

    public void put(String key, BudgetResponse budget) {
        if (key == null || budget == null) return;
        cache.put(key, new CacheEntry(budget, Instant.now().plus(TTL)));
        log.info("Cached budget for 1 hour under key: {}", key);
    }

    public void evict(String key) {
        if (key != null) {
            cache.remove(key);
        }
    }
}
