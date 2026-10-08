package energy;

import java.util.List;

/**
 * Encapsulates the results of a household energy audit.
 */
public class EnergyAuditReport {
    public final double totalConnectedWatts;
    public final double totalStandbyWatts;
    public final double totalDailyKwh;
    public final double totalMonthlyKwh;
    public final double totalAnnualKwh;
    public final double monthlyBill;
    public final double annualBill;
    public final double annualVampireCost;
    public final double vampirePercentage;
    public final double monthlyCo2Kg;
    public final double annualCo2Kg;
    public final int treesNeededToOffset;
    public final double recommendedSolarKw;
    public final int solarPanelsCount;
    public final String efficiencyGrade;
    public final List<Appliance> topConsumers;

    public EnergyAuditReport(double totalConnectedWatts, double totalStandbyWatts, double totalDailyKwh,
                             double totalMonthlyKwh, double monthlyBill, double annualVampireCost,
                             double vampirePercentage, double monthlyCo2Kg, int treesNeededToOffset,
                             double recommendedSolarKw, int solarPanelsCount, String efficiencyGrade,
                             List<Appliance> topConsumers) {
        this.totalConnectedWatts = totalConnectedWatts;
        this.totalStandbyWatts = totalStandbyWatts;
        this.totalDailyKwh = totalDailyKwh;
        this.totalMonthlyKwh = totalMonthlyKwh;
        this.totalAnnualKwh = totalMonthlyKwh * 12.0;
        this.monthlyBill = monthlyBill;
        this.annualBill = monthlyBill * 12.0;
        this.annualVampireCost = annualVampireCost;
        this.vampirePercentage = vampirePercentage;
        this.monthlyCo2Kg = monthlyCo2Kg;
        this.annualCo2Kg = monthlyCo2Kg * 12.0;
        this.treesNeededToOffset = treesNeededToOffset;
        this.recommendedSolarKw = recommendedSolarKw;
        this.solarPanelsCount = solarPanelsCount;
        this.efficiencyGrade = efficiencyGrade;
        this.topConsumers = topConsumers;
    }
}
