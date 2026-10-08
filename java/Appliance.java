package energy;

/**
 * Represents an individual home appliance with operating wattage,
 * phantom/standby vampire draw, daily usage patterns, and energy star rating.
 */
public class Appliance {
    private String id;
    private String name;
    private String room;
    private double watts;           // Active operating power in Watts
    private double standbyWatts;    // Vampire / phantom load in Watts
    private double hoursPerDay;     // Daily active usage hours (0 to 24)
    private double dutyCycle;       // For cycling compressors (e.g., 0.45 for refrigerators)
    private int quantity;
    private int starRating;         // 1 to 5 star rating
    private boolean active;

    public Appliance(String id, String name, String room, double watts, double standbyWatts, 
                     double hoursPerDay, double dutyCycle, int quantity, int starRating, boolean active) {
        this.id = id;
        this.name = name;
        this.room = room;
        this.watts = watts;
        this.standbyWatts = standbyWatts;
        this.hoursPerDay = hoursPerDay;
        this.dutyCycle = dutyCycle;
        this.quantity = quantity;
        this.starRating = starRating;
        this.active = active;
    }

    public Appliance(String name, String room, double watts, double standbyWatts, double hoursPerDay) {
        this(name.toLowerCase().replaceAll("\\s+", "_"), name, room, watts, standbyWatts, hoursPerDay, 1.0, 1, 4, true);
    }

    /**
     * Active daily energy consumption in Kilowatt-Hours (kWh)
     */
    public double getDailyRunningKwh() {
        if (!active) return 0.0;
        return ((watts * dutyCycle * hoursPerDay) / 1000.0) * quantity;
    }

    /**
     * Standby (Vampire / Phantom) energy consumed during non-operating hours
     */
    public double getDailyStandbyKwh() {
        if (!active) return 0.0;
        double standbyHours = Math.max(0.0, 24.0 - hoursPerDay);
        return ((standbyWatts * standbyHours) / 1000.0) * quantity;
    }

    /**
     * Total daily energy consumption
     */
    public double getTotalDailyKwh() {
        return getDailyRunningKwh() + getDailyStandbyKwh();
    }

    /**
     * Projected monthly consumption (average 30.4 days)
     */
    public double getMonthlyKwh() {
        return getTotalDailyKwh() * 30.4;
    }

    // Getters and Setters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getRoom() { return room; }
    public double getWatts() { return watts; }
    public double getStandbyWatts() { return standbyWatts; }
    public double getHoursPerDay() { return hoursPerDay; }
    public void setHoursPerDay(double hours) { this.hoursPerDay = hours; }
    public double getDutyCycle() { return dutyCycle; }
    public int getQuantity() { return quantity; }
    public int getStarRating() { return starRating; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
