# ⚡ WattWise — Home Appliance Power & Energy Monitor

An interactive, responsive smart-home power monitor and energy audit application designed to give families clear, actionable visibility into their appliance power usage, uncover sneaky phantom / vampire loads, simulate lifestyle savings, and significantly slash electricity bills.

---

## 📁 Clean Architecture & Folder Structure

As requested, all files are strictly differentiated and organized into separate dedicated folders:

```
home-energy-monitor/
├── index.html                   # Master single-page app & command center entry point
├── html/                        # Dedicated HTML Sub-Pages
│   ├── dashboard.html           # Real-time power telemetry & smart meter gauge
│   ├── appliances.html          # Appliance inventory auditor & vampire detector
│   ├── calculator.html          # What-if lifestyle savings & tiered tariff simulator
│   ├── analytics.html           # Deep energy analytics & rooftop solar PV sizing
│   └── report.html              # Printable family energy audit & action plan
├── css/                         # Dedicated CSS Stylesheets
│   ├── style.css                # Design tokens, themes (dark/light), layout & header
│   ├── dashboard.css            # Live gauge, telemetry oscilloscope & KPI cards
│   ├── components.css           # Modals, toggles, tables, range sliders & toasts
│   └── analytics.css            # Analytics page-specific solar and metric styles
├── js/                          # Dedicated JavaScript Client Engine
│   ├── data.js                  # Appliance catalogue, room presets & energy tips
│   ├── storage.js               # LocalStorage persistence, backup JSON & CSV export
│   ├── calculator.js            # Kilowatt-hour math, tiered billing & vampire logic
│   ├── charts.js                # Zero-dependency canvas donut, bar & oscilloscope
│   ├── simulator.js             # Real-time smart meter telemetry jitter & spike tester
│   ├── app.js                   # Master application orchestrator & event bus
│   └── analytics.js             # Solar metrics and energy-consumer analytics view
├── java/                        # Dedicated Java Object-Oriented Engine
│   ├── Appliance.java           # Model with running watts, standby draw & duty cycle
│   ├── TariffPlan.java          # Utility billing model (flat & multi-tier slabs)
│   ├── EnergyAuditReport.java   # Data transfer object for audit metrics
│   ├── EnergyAuditEngine.java   # Core calculation engine & ranking algorithms
│   └── EnergyMonitorApp.java    # Standalone executable Java console application
└── README.md                    # Project documentation & usage guide
```

---

## 🌟 Key Features

### 1. ⚡ Real-Time Live Smart Meter & Waveform Telemetry
- **Live Dial Gauge**: Displays current active wattage in real-time with color-coded safety zones (Normal, Elevated, Danger Peak).
- **Oscilloscope Waveform**: Canvas-rendered animated waveform simulating realistic compressor duty cycles and micro-fluctuations.
- **Spike Simulator**: 1-click test button simulates turning on a 2200W electric kettle or microwave oven to verify circuit response.

### 2. 🧛‍♂️ Phantom / Vampire Load Spotter
- **Standby Drain Isolation**: Identifies devices that draw power 24/7 even when turned off (cable boxes, gaming PCs, microwave clocks, chargers).
- **Financial Waste Counter**: Calculates the exact annual dollar amount lost to phantom power and its percentage of the total electric bill.
- **Smart Kill Switch**: Interactive toggle simulates cutting off all standby loads using smart power strips.

### 3. 🔌 Comprehensive Appliance Inventory
- Pre-populated with realistic household appliances (Inverter AC, Window AC, Double-door Fridge, Water Geyser, Dishwasher, OLED TV, PS5/PC, Wi-Fi Routers, etc.).
- Filter by room (**Living Room, Kitchen, Bedroom, Office, Laundry, HVAC, Outdoor**).
- Real-time search by appliance name.
- Add, Edit, Duplicate, Delete, and Active/Inactive toggle switches with immediate recalculation.

### 4. 💰 What-If Savings Scenario Planner
- Interactive range sliders for AC reduction, water heater run time, vampire power elimination, and LED lighting upgrades.
- Real-time calculation of monthly and annual savings and percentage bill cut.

### 5. ☀️ Rooftop Solar PV Sizing & Carbon Footprint
- Automatically calculates recommended solar array size (kW) and number of 400W monocrystalline panels needed to offset 100% of grid power.
- Annual CO₂ emissions calculation in kilograms and the equivalent number of mature trees required to absorb the emissions.

### 6. ⚙️ Multi-Tier Tariff & Currency Customizer
- Currency support: `$`, `₹`, `€`, `£`, `¥`.
- Choose between **Flat Rate** or **3-Tier Utility Slabs** (Base tier, Mid tier, Peak penalty tier).
- Configure monthly fixed base fees and energy taxes.

### 7. 📥 Export, Backup & Printable Reports
- **1-Click Print / PDF Report**: Formatted executive energy audit ready for printing or saving to PDF.
- **CSV Spreadsheet Export**: Export appliance inventory and energy audit into Microsoft Excel or Google Sheets.
- **JSON Backup & Restore**: Download full configurations or import existing audits.

### 8. 🌓 Dark & Light Mode Support
- Sleek modern dark mode (default) with high contrast glowing telemetry and clean light mode toggle.

---

## 🚀 How to Run the Website

### Option 1: Direct Browser Launch (Zero Dependencies)
Simply double-click `index.html` (or any file in `html/`) in your file browser (or open with Google Chrome, Microsoft Edge, Firefox, or Safari).
No installation, Node.js, or build step is required!

### Option 2: Local HTTP Server (Optional)
If using Python:
```bash
python -m http.server 8000
```
Then navigate to: `http://localhost:8000`

---

## ☕ How to Run the Java Backend Simulation

The `java/` folder contains a standalone object-oriented engine. If you have the Java JDK installed:

```bash
# Navigate to the project folder
cd home-energy-monitor

# Compile Java classes
javac -d bin java/*.java

# Run the console audit simulation
java -cp bin energy.EnergyMonitorApp
```
