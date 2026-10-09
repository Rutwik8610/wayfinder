package com.tourism.backend.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class BudgetResponse {

    private BigDecimal transportation;
    private BigDecimal accommodation;
    private BigDecimal food;
    private BigDecimal entryFees;
    private BigDecimal localTransport;
    private BigDecimal miscellaneous;
    private BigDecimal total;
    private Boolean isEstimate;
    private String note;

    private List<BudgetItemResponse> items = new ArrayList<>();
    private BigDecimal totalMin;
    private BigDecimal totalMax;
    private BigDecimal totalRecommended;
    private String currency = "INR";
    private String lastUpdated;

    public BudgetResponse() {
    }

    public BudgetResponse(
            BigDecimal transportation,
            BigDecimal accommodation,
            BigDecimal food,
            BigDecimal entryFees,
            BigDecimal localTransport,
            BigDecimal miscellaneous) {
        this(
            transportation,
            accommodation,
            food,
            entryFees,
            localTransport,
            miscellaneous,
            (transportation == null ? BigDecimal.ZERO : transportation)
                .add(accommodation == null ? BigDecimal.ZERO : accommodation)
                .add(food == null ? BigDecimal.ZERO : food)
                .add(entryFees == null ? BigDecimal.ZERO : entryFees)
                .add(localTransport == null ? BigDecimal.ZERO : localTransport)
                .add(miscellaneous == null ? BigDecimal.ZERO : miscellaneous),
            true,
            "Estimated based on regional travel averages."
        );
    }

    public BudgetResponse(
            BigDecimal transportation,
            BigDecimal accommodation,
            BigDecimal food,
            BigDecimal entryFees,
            BigDecimal localTransport,
            BigDecimal miscellaneous,
            BigDecimal total,
            Boolean isEstimate,
            String note) {

        this.transportation = transportation == null ? BigDecimal.ZERO : transportation;
        this.accommodation = accommodation == null ? BigDecimal.ZERO : accommodation;
        this.food = food == null ? BigDecimal.ZERO : food;
        this.entryFees = entryFees == null ? BigDecimal.ZERO : entryFees;
        this.localTransport = localTransport == null ? BigDecimal.ZERO : localTransport;
        this.miscellaneous = miscellaneous == null ? BigDecimal.ZERO : miscellaneous;
        this.total = total != null ? total : this.transportation
                .add(this.accommodation)
                .add(this.food)
                .add(this.entryFees)
                .add(this.localTransport)
                .add(this.miscellaneous);
        this.isEstimate = isEstimate != null ? isEstimate : false;
        this.note = note;
        this.totalMin = this.total.multiply(BigDecimal.valueOf(0.85));
        this.totalMax = this.total.multiply(BigDecimal.valueOf(1.30));
        this.totalRecommended = this.total;
    }

    public BudgetResponse(
            List<BudgetItemResponse> items,
            BigDecimal totalMin,
            BigDecimal totalMax,
            BigDecimal totalRecommended,
            Boolean isEstimate,
            String note,
            String lastUpdated) {
        this.items = items != null ? items : new ArrayList<>();
        this.totalMin = totalMin != null ? totalMin : BigDecimal.ZERO;
        this.totalMax = totalMax != null ? totalMax : BigDecimal.ZERO;
        this.totalRecommended = totalRecommended != null ? totalRecommended : BigDecimal.ZERO;
        this.total = this.totalRecommended;
        this.isEstimate = isEstimate != null ? isEstimate : false;
        this.note = note;
        this.lastUpdated = lastUpdated;

        // Populate category-level legacy getters from items
        BigDecimal trans = BigDecimal.ZERO;
        BigDecimal accom = BigDecimal.ZERO;
        BigDecimal fd = BigDecimal.ZERO;
        BigDecimal fees = BigDecimal.ZERO;
        BigDecimal local = BigDecimal.ZERO;
        BigDecimal misc = BigDecimal.ZERO;

        for (BudgetItemResponse item : this.items) {
            String cat = item.getCategory() == null ? "" : item.getCategory().toLowerCase();
            BigDecimal rec = item.getRecommended() != null ? item.getRecommended() : BigDecimal.ZERO;
            if (cat.contains("travel") || cat.contains("intercity") || cat.contains("transportation")) {
                trans = trans.add(rec);
            } else if (cat.contains("hotel") || cat.contains("accommodation") || cat.contains("stay")) {
                accom = accom.add(rec);
            } else if (cat.contains("food") || cat.contains("dining") || cat.contains("meal")) {
                fd = fd.add(rec);
            } else if (cat.contains("entry") || cat.contains("ticket") || cat.contains("activity") || cat.contains("guide")) {
                fees = fees.add(rec);
            } else if (cat.contains("local") || cat.contains("transit") || cat.contains("cab") || cat.contains("taxi")) {
                local = local.add(rec);
            } else {
                misc = misc.add(rec);
            }
        }

        this.transportation = trans;
        this.accommodation = accom;
        this.food = fd;
        this.entryFees = fees;
        this.localTransport = local;
        this.miscellaneous = misc;
    }

    public BigDecimal getTransportation() {
        return transportation;
    }

    public void setTransportation(BigDecimal transportation) {
        this.transportation = transportation;
    }

    public BigDecimal getAccommodation() {
        return accommodation;
    }

    public void setAccommodation(BigDecimal accommodation) {
        this.accommodation = accommodation;
    }

    public BigDecimal getFood() {
        return food;
    }

    public void setFood(BigDecimal food) {
        this.food = food;
    }

    public BigDecimal getEntryFees() {
        return entryFees;
    }

    public void setEntryFees(BigDecimal entryFees) {
        this.entryFees = entryFees;
    }

    public BigDecimal getLocalTransport() {
        return localTransport;
    }

    public void setLocalTransport(BigDecimal localTransport) {
        this.localTransport = localTransport;
    }

    public BigDecimal getMiscellaneous() {
        return miscellaneous;
    }

    public void setMiscellaneous(BigDecimal miscellaneous) {
        this.miscellaneous = miscellaneous;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public Boolean getIsEstimate() {
        return isEstimate;
    }

    public void setIsEstimate(Boolean isEstimate) {
        this.isEstimate = isEstimate;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public List<BudgetItemResponse> getItems() {
        return items;
    }

    public void setItems(List<BudgetItemResponse> items) {
        this.items = items;
    }

    public BigDecimal getTotalMin() {
        return totalMin;
    }

    public void setTotalMin(BigDecimal totalMin) {
        this.totalMin = totalMin;
    }

    public BigDecimal getTotalMax() {
        return totalMax;
    }

    public void setTotalMax(BigDecimal totalMax) {
        this.totalMax = totalMax;
    }

    public BigDecimal getTotalRecommended() {
        return totalRecommended;
    }

    public void setTotalRecommended(BigDecimal totalRecommended) {
        this.totalRecommended = totalRecommended;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}