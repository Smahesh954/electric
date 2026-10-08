package energy;

/**
 * Utility tariff model supporting flat rate or 3-tier tiered pricing slabs,
 * fixed connection charges, and energy taxes.
 */
public class TariffPlan {
    private String currency;
    private boolean isTiered;
    private double flatRate;        // Cost per kWh
    private double tier1Limit;      // e.g. up to 150 kWh
    private double tier1Rate;
    private double tier2Limit;      // e.g. 151 - 350 kWh
    private double tier2Rate;
    private double tier3Rate;       // > 350 kWh
    private double fixedSupplyFee;  // Monthly base charge
    private double taxPercentage;   // Energy surcharge %

    public TariffPlan() {
        // Defaults: $0.16/kWh flat rate, $12 base supply fee, 5% tax
        this.currency = "$";
        this.isTiered = false;
        this.flatRate = 0.16;
        this.tier1Limit = 150.0;
        this.tier1Rate = 0.12;
        this.tier2Limit = 350.0;
        this.tier2Rate = 0.18;
        this.tier3Rate = 0.26;
        this.fixedSupplyFee = 12.00;
        this.taxPercentage = 5.0;
    }

    /**
     * Compute total utility electricity bill
     */
    public BillResult calculateBill(double monthlyKwh) {
        double energyCharge = 0.0;

        if (isTiered) {
            double remaining = monthlyKwh;

            // Tier 1
            double t1Kwh = Math.min(remaining, tier1Limit);
            energyCharge += t1Kwh * tier1Rate;
            remaining = Math.max(0, remaining - t1Kwh);

            // Tier 2
            double t2Capacity = Math.max(0, tier2Limit - tier1Limit);
            double t2Kwh = Math.min(remaining, t2Capacity);
            energyCharge += t2Kwh * tier2Rate;
            remaining = Math.max(0, remaining - t2Kwh);

            // Tier 3
            if (remaining > 0) {
                energyCharge += remaining * tier3Rate;
            }
        } else {
            energyCharge = monthlyKwh * flatRate;
        }

        double taxes = (energyCharge + fixedSupplyFee) * (taxPercentage / 100.0);
        double totalBill = energyCharge + fixedSupplyFee + taxes;
        double effectiveRate = monthlyKwh > 0 ? (totalBill / monthlyKwh) : flatRate;

        return new BillResult(energyCharge, fixedSupplyFee, taxes, totalBill, effectiveRate);
    }

    public static class BillResult {
        public final double energyCharge;
        public final double fixedFee;
        public final double taxes;
        public final double totalBill;
        public final double effectiveRatePerKwh;

        public BillResult(double energyCharge, double fixedFee, double taxes, double totalBill, double effectiveRatePerKwh) {
            this.energyCharge = energyCharge;
            this.fixedFee = fixedFee;
            this.taxes = taxes;
            this.totalBill = totalBill;
            this.effectiveRatePerKwh = effectiveRatePerKwh;
        }
    }

    // Getters and Setters
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public boolean isTiered() { return isTiered; }
    public void setTiered(boolean tiered) { isTiered = tiered; }
    public double getFlatRate() { return flatRate; }
    public void setFlatRate(double flatRate) { this.flatRate = flatRate; }
    public double getFixedSupplyFee() { return fixedSupplyFee; }
    public void setFixedSupplyFee(double fee) { this.fixedSupplyFee = fee; }
    public double getTaxPercentage() { return taxPercentage; }
    public void setTaxPercentage(double tax) { this.taxPercentage = tax; }
}
