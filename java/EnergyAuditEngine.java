package energy;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Computational engine performing comprehensive household energy audits,
 * phantom vampire load detection, and lifestyle savings simulations.
 */
public class EnergyAuditEngine {

    /**
     * Run full household audit on a list of appliances
     */
    public static EnergyAuditReport runAudit(List<Appliance> appliances, TariffPlan tariff) {
        double totalConnectedWatts = 0.0;
        double totalStandbyWatts = 0.0;
        double totalDailyKwh = 0.0;
        double totalDailyStandbyKwh = 0.0;
        double totalMonthlyKwh = 0.0;

        List<Appliance> activeList = new ArrayList<>();

        for (Appliance app : appliances) {
            if (app.isActive()) {
                activeList.add(app);
                totalConnectedWatts += app.getWatts() * app.getQuantity();
                totalStandbyWatts += app.getStandbyWatts() * app.getQuantity();
                totalDailyKwh += app.getTotalDailyKwh();
                totalDailyStandbyKwh += app.getDailyStandbyKwh();
                totalMonthlyKwh += app.getMonthlyKwh();
            }
        }

        // Rank top consumers
        activeList.sort(Comparator.comparingDouble(Appliance::getMonthlyKwh).reversed());
        List<Appliance> topConsumers = activeList.subList(0, Math.min(5, activeList.size()));

        // Utility bill
        TariffPlan.BillResult bill = tariff.calculateBill(totalMonthlyKwh);

        // Phantom vampire calculations
        double monthlyStandbyKwh = totalDailyStandbyKwh * 30.4;
        double annualVampireCost = (monthlyStandbyKwh * 12.0) * bill.effectiveRatePerKwh;
        double vampirePct = totalMonthlyKwh > 0 ? (monthlyStandbyKwh / totalMonthlyKwh) * 100.0 : 0.0;

        // Environmental impact (~0.40 kg CO2 / kWh)
        double monthlyCo2Kg = totalMonthlyKwh * 0.40;
        int treesNeeded = (int) Math.round((monthlyCo2Kg * 12.0) / 22.0);

        // Solar sizing (~4.5 peak sun hours, 78% efficiency)
        double solarKw = totalDailyKwh / (4.5 * 0.78);
        int panelsCount = (int) Math.ceil((solarKw * 1000.0) / 400.0);

        // Efficiency grade
        String grade = computeGrade(totalDailyKwh, vampirePct);

        return new EnergyAuditReport(
            totalConnectedWatts, totalStandbyWatts, totalDailyKwh, totalMonthlyKwh,
            bill.totalBill, annualVampireCost, vampirePct, monthlyCo2Kg, treesNeeded,
            solarKw, panelsCount, grade, topConsumers
        );
    }

    private static String computeGrade(double dailyKwh, double vampirePct) {
        if (dailyKwh <= 18.0 && vampirePct <= 5.0) return "A+ (Exceptional)";
        if (dailyKwh <= 26.0 && vampirePct <= 8.0) return "A (Very Efficient)";
        if (dailyKwh <= 36.0 && vampirePct <= 12.0) return "B (Standard)";
        if (dailyKwh <= 48.0) return "C (Moderate Waste)";
        return "D / F (High Energy Drain)";
    }

    /**
     * Simulate What-If savings scenario
     */
    public static double simulateSavings(EnergyAuditReport baseline, TariffPlan tariff, 
                                          double acHoursCut, boolean eliminateVampire, boolean upgradeLeds) {
        double monthlySavedKwh = 0.0;

        if (eliminateVampire) {
            monthlySavedKwh += (baseline.totalStandbyWatts * 20.0 / 1000.0) * 30.4;
        }
        if (acHoursCut > 0) {
            // 1.4 kW typical inverter AC
            monthlySavedKwh += (1.4 * acHoursCut) * 30.4;
        }
        if (upgradeLeds) {
            // ~60W savings across 8 fixtures for 5 hrs/day
            monthlySavedKwh += (0.060 * 8.0 * 5.0) * 30.4;
        }

        double newMonthlyKwh = Math.max(0.0, baseline.totalMonthlyKwh - monthlySavedKwh);
        TariffPlan.BillResult newBill = tariff.calculateBill(newMonthlyKwh);

        return Math.max(0.0, baseline.monthlyBill - newBill.totalBill);
    }
}
