package energy;

import java.util.ArrayList;
import java.util.List;

/**
 * Standalone executable Java application for Home Appliance Power & Energy Monitoring.
 * Demonstrates the OOP calculation engine, utility billing, vampire load detection,
 * and what-if lifestyle scenario planning.
 */
public class EnergyMonitorApp {

    public static void main(String[] args) {
        System.out.println("================================================================================");
        System.out.println("         WATTWISE HOME ENERGY & APPLIANCE POWER AUDIT SYSTEM (JAVA)");
        System.out.println("================================================================================\n");

        // 1. Setup realistic 3-BHK household appliance catalog
        List<Appliance> appliances = new ArrayList<>();
        appliances.add(new Appliance("app_1", "Master Bedroom Inverter AC (1.5T)", "bedroom", 1400, 6, 8.0, 1.0, 1, 5, true));
        appliances.add(new Appliance("app_2", "Living Room Split AC (2.0T)", "living", 2100, 7, 5.0, 1.0, 1, 4, true));
        appliances.add(new Appliance("app_3", "Double-Door Refrigerator (400L)", "kitchen", 210, 0, 24.0, 0.45, 1, 4, true));
        appliances.add(new Appliance("app_4", "Electric Water Geyser", "laundry", 2000, 2, 2.0, 1.0, 2, 3, true));
        appliances.add(new Appliance("app_5", "65\" Smart OLED 4K TV", "living", 140, 5, 5.0, 1.0, 1, 4, true));
        appliances.add(new Appliance("app_6", "Set-Top Cable Box (Vampire Draw)", "living", 25, 18, 4.0, 1.0, 1, 2, true));
        appliances.add(new Appliance("app_7", "Gaming PC & Monitor Setup", "office", 450, 12, 4.0, 1.0, 1, 3, true));
        appliances.add(new Appliance("app_8", "Front-Load Washing Machine", "laundry", 850, 3, 1.2, 1.0, 1, 5, true));
        appliances.add(new Appliance("app_9", "Automatic Dishwasher", "kitchen", 1400, 3, 1.0, 1.0, 1, 4, true));
        appliances.add(new Appliance("app_10", "Microwave & Oven", "kitchen", 1300, 4, 0.5, 1.0, 1, 4, true));
        appliances.add(new Appliance("app_11", "Ceiling Fans (4 units)", "living", 65, 0, 12.0, 1.0, 4, 3, true));
        appliances.add(new Appliance("app_12", "LED Ceiling Lights (15 units)", "other", 9, 0, 6.0, 1.0, 15, 5, true));
        appliances.add(new Appliance("app_13", "Wi-Fi Mesh Routers (24/7)", "living", 18, 0, 24.0, 1.0, 2, 5, true));
        appliances.add(new Appliance("app_14", "Idle Phone Chargers (x5)", "bedroom", 0, 2.5, 0.0, 1.0, 5, 3, true));

        // 2. Setup Tariff Plan ($0.16/kWh, $12 base fee, 5% tax)
        TariffPlan tariff = new TariffPlan();
        tariff.setCurrency("$");
        tariff.setFlatRate(0.16);

        // 3. Execute baseline household audit
        EnergyAuditReport report = EnergyAuditEngine.runAudit(appliances, tariff);

        // 4. Output Formatted Report
        System.out.printf("  [+] Total Connected Capacity : %,.2f kW across %d appliances%n", (report.totalConnectedWatts / 1000.0), appliances.size());
        System.out.printf("  [+] Continuous Vampire Draw  : %.1f Watts (Appliances idle/off)%n", report.totalStandbyWatts);
        System.out.printf("  [+] Daily Energy Used        : %.2f kWh / day%n", report.totalDailyKwh);
        System.out.printf("  [+] Monthly Energy Used      : %.2f kWh / month (%,.1f kWh / year)%n", report.totalMonthlyKwh, report.totalAnnualKwh);
        System.out.printf("  [+] Projected Monthly Bill   : %s%,.2f%n", tariff.getCurrency(), report.monthlyBill);
        System.out.printf("  [+] Annualized Bill Total    : %s%,.2f%n", tariff.getCurrency(), report.annualBill);
        System.out.printf("  [+] Efficiency Grade         : %s%n", report.efficiencyGrade);
        System.out.println("--------------------------------------------------------------------------------");

        System.out.println("\n  [!] VAMPIRE / PHANTOM LOAD SPOTTER:");
        System.out.printf("      Annual Money Wasted on Idle Standby: %s%,.2f / year%n", tariff.getCurrency(), report.annualVampireCost);
        System.out.printf("      Share of Electric Bill Wasted     : %.1f%%%n", report.vampirePercentage);

        System.out.println("\n  [#] TOP 5 HIGHEST CONSUMING APPLIANCES:");
        for (int i = 0; i < report.topConsumers.size(); i++) {
            Appliance hog = report.topConsumers.get(i);
            double hogMonthlyKwh = hog.getMonthlyKwh();
            double pct = (hogMonthlyKwh / report.totalMonthlyKwh) * 100.0;
            double estCost = hogMonthlyKwh * 0.16;
            System.out.printf("      %d. %-36s | %6.1f kWh/mo | %4.1f%% | %s%6.2f/mo%n",
                (i + 1), hog.getName(), hogMonthlyKwh, pct, tariff.getCurrency(), estCost);
        }

        System.out.println("\n  [☀️] ROOFTOP SOLAR PV SYSTEM SIZING:");
        System.out.printf("      Recommended System Size : %.2f kW system%n", report.recommendedSolarKw);
        System.out.printf("      Recommended Panels (400W): %d Panels%n", report.solarPanelsCount);
        System.out.printf("      Annual Carbon Avoided   : %,.1f kg CO2 (Equivalent to %d mature trees)%n",
            report.annualCo2Kg, report.treesNeededToOffset);

        System.out.println("\n--------------------------------------------------------------------------------");
        System.out.println("  [💡] WHAT-IF SCENARIO SAVINGS SIMULATION:");
        System.out.println("      Simulating habits:");
        System.out.println("        * Reduce AC run time by 2.0 hours daily (or set to 24°C)");
        System.out.println("        * Cut all phantom vampire draw using smart power strips");
        System.out.println("        * Swap 8 remaining lights to LEDs");

        double monthlySavings = EnergyAuditEngine.simulateSavings(report, tariff, 2.0, true, true);
        double annualSavings = monthlySavings * 12.0;
        double pctCut = (monthlySavings / report.monthlyBill) * 100.0;

        System.out.printf("      >>> Projected Monthly Savings: %s%,.2f / month%n", tariff.getCurrency(), monthlySavings);
        System.out.printf("      >>> Projected Annual Savings : %s%,.2f / year%n", tariff.getCurrency(), annualSavings);
        System.out.printf("      >>> Total Bill Cut           : %.1f%% reduction!%n", pctCut);
        System.out.println("================================================================================\n");
    }
}
