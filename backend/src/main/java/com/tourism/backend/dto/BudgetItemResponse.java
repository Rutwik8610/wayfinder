package com.tourism.backend.dto;

import java.math.BigDecimal;

public class BudgetItemResponse {

    private String category;
    private BigDecimal min;
    private BigDecimal max;
    private BigDecimal recommended;
    private String sourceName;
    private String sourceUrl;
    private String lastUpdated;
    private String note;
    private Boolean isEstimate;

    public BudgetItemResponse() {
    }

    public BudgetItemResponse(
            String category,
            BigDecimal min,
            BigDecimal max,
            BigDecimal recommended,
            String sourceName,
            String sourceUrl,
            String lastUpdated,
            String note,
            Boolean isEstimate) {
        this.category = category;
        this.min = min;
        this.max = max;
        this.recommended = recommended;
        this.sourceName = sourceName;
        this.sourceUrl = sourceUrl;
        this.lastUpdated = lastUpdated;
        this.note = note;
        this.isEstimate = isEstimate != null ? isEstimate : false;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getMin() {
        return min;
    }

    public void setMin(BigDecimal min) {
        this.min = min;
    }

    public BigDecimal getMax() {
        return max;
    }

    public void setMax(BigDecimal max) {
        this.max = max;
    }

    public BigDecimal getRecommended() {
        return recommended;
    }

    public void setRecommended(BigDecimal recommended) {
        this.recommended = recommended;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Boolean getIsEstimate() {
        return isEstimate;
    }

    public void setIsEstimate(Boolean isEstimate) {
        this.isEstimate = isEstimate;
    }
}
