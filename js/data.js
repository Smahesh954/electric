/**
 * Home Energy & Appliance Wattage Data Catalog
 * Contains realistic default appliance specifications, room categories,
 * household profile presets, and energy-saving intelligence tips.
 */

const ENERGY_DATA = {
  // Common household rooms
  rooms: [
    { id: 'living', name: 'Living Room', icon: '🛋️' },
    { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
    { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
    { id: 'office', name: 'Home Office', icon: '💻' },
    { id: 'laundry', name: 'Laundry / Utility', icon: '🧺' },
    { id: 'climate', name: 'HVAC & Climate', icon: '❄️' },
    { id: 'other', name: 'Other / Outdoor', icon: '💡' }
  ],

  // Appliance catalog with realistic running watts & vampire (standby) watts
  catalog: [
    {
      id: 'inv_ac',
      name: 'Inverter Air Conditioner (1.5 Ton)',
      category: 'climate',
      room: 'bedroom',
      watts: 1400,
      standbyWatts: 6,
      hoursPerDay: 8,
      quantity: 1,
      starRating: 5,
      active: true,
      description: 'Modern variable-speed compressor cooling'
    },
    {
      id: 'old_ac',
      name: 'Window Air Conditioner (Non-Inverter)',
      category: 'climate',
      room: 'living',
      watts: 1950,
      standbyWatts: 8,
      hoursPerDay: 5,
      quantity: 1,
      starRating: 2,
      active: false,
      description: 'Older fixed-speed compressor with frequent cycling'
    },
    {
      id: 'refrigerator',
      name: 'Double-Door Refrigerator (350L)',
      category: 'kitchen',
      room: 'kitchen',
      watts: 180,
      standbyWatts: 0,
      hoursPerDay: 24, // Runs continuously with thermostat duty cycle ~40%
      dutyCycle: 0.45,
      quantity: 1,
      starRating: 4,
      active: true,
      description: 'Always plugged in, compressor runs ~10-12 hrs/day total'
    },
    {
      id: 'water_heater',
      name: 'Electric Water Geyser / Heater',
      category: 'laundry',
      room: 'laundry',
      watts: 2000,
      standbyWatts: 2,
      hoursPerDay: 1.5,
      quantity: 1,
      starRating: 3,
      active: true,
      description: 'High wattage resistive heating element'
    },
    {
      id: 'microwave',
      name: 'Microwave Oven with Clock',
      category: 'kitchen',
      room: 'kitchen',
      watts: 1200,
      standbyWatts: 4, // Clock & digital display standby
      hoursPerDay: 0.4,
      quantity: 1,
      starRating: 4,
      active: true,
      description: 'Continuous vampire load for digital clock display'
    },
    {
      id: 'induction',
      name: 'Induction Cooktop',
      category: 'kitchen',
      room: 'kitchen',
      watts: 1800,
      standbyWatts: 2,
      hoursPerDay: 1.2,
      quantity: 1,
      starRating: 5,
      active: true,
      description: 'High efficiency electromagnetic cooking'
    },
    {
      id: 'dishwasher',
      name: 'Automatic Dishwasher',
      category: 'kitchen',
      room: 'kitchen',
      watts: 1500,
      standbyWatts: 3,
      hoursPerDay: 1.0,
      quantity: 1,
      starRating: 4,
      active: true,
      description: 'Includes water heating cycle and drying element'
    },
    {
      id: 'washing_machine',
      name: 'Front-Load Washing Machine',
      category: 'laundry',
      room: 'laundry',
      watts: 800,
      standbyWatts: 3,
      hoursPerDay: 0.8,
      quantity: 1,
      starRating: 5,
      active: true,
      description: 'Inverter direct-drive motor with spin cycle'
    },
    {
      id: 'tv_smart',
      name: '65" 4K Smart OLED TV',
      category: 'living',
      room: 'living',
      watts: 140,
      standbyWatts: 5, // Standby WiFi listening & quick start
      hoursPerDay: 4.5,
      quantity: 1,
      starRating: 4,
      active: true,
      description: 'Smart TV with sleep standby network listening'
    },
    {
      id: 'gaming_pc',
      name: 'High-End Gaming PC & Monitor',
      category: 'office',
      room: 'office',
      watts: 450,
      standbyWatts: 12, // RGB peripherals + motherboard standby
      hoursPerDay: 4.0,
      quantity: 1,
      starRating: 3,
      active: true,
      description: 'Dedicated GPU, multi-monitors, and power supply idle draw'
    },
    {
      id: 'work_laptop',
      name: 'Laptop & External Monitor',
      category: 'office',
      room: 'office',
      watts: 85,
      standbyWatts: 4,
      hoursPerDay: 8.0,
      quantity: 1,
      starRating: 5,
      active: true,
      description: 'Energy-efficient workstation dock'
    },
    {
      id: 'wifi_router',
      name: 'Wi-Fi 6 Router & Mesh Node',
      category: 'office',
      room: 'living',
      watts: 18,
      standbyWatts: 0,
      hoursPerDay: 24,
      quantity: 2,
      starRating: 5,
      active: true,
      description: '24/7 background networking hardware'
    },
    {
      id: 'ceiling_fan',
      name: 'BLDC Energy-Saving Ceiling Fan',
      category: 'climate',
      room: 'living',
      watts: 32,
      standbyWatts: 1,
      hoursPerDay: 12,
      quantity: 3,
      starRating: 5,
      active: true,
      description: 'Brushless DC motor draws 60% less than older 75W induction fans'
    },
    {
      id: 'led_lights',
      name: 'LED Ceiling & Accent Bulbs (Set of 10)',
      category: 'other',
      room: 'living',
      watts: 90, // 9W x 10
      standbyWatts: 0,
      hoursPerDay: 6,
      quantity: 1,
      starRating: 5,
      active: true,
      description: 'Energy-efficient LED lighting group'
    },
    {
      id: 'set_top_box',
      name: 'Set-Top Cable Box / Streaming Box',
      category: 'living',
      room: 'living',
      watts: 25,
      standbyWatts: 18, // Infamous vampire draw: almost full power on standby!
      hoursPerDay: 4,
      quantity: 1,
      starRating: 2,
      active: true,
      description: 'Known phantom power hog: stays warm even when "turned off"'
    },
    {
      id: 'phone_chargers',
      name: 'Unused Phone/Tablet Chargers (Plugged In)',
      category: 'other',
      room: 'bedroom',
      watts: 0,
      standbyWatts: 3, // Idle wall-wart phantom draw
      hoursPerDay: 0,
      quantity: 4,
      starRating: 3,
      active: true,
      description: 'Draws continuous parasitic current when left in socket'
    }
  ],

  // Preset household profiles
  presets: {
    apartment: {
      name: '1-BHK Studio / Compact Apartment',
      description: 'Compact urban dwelling with essential appliances and moderate usage.',
      tariffRate: 0.14,
      currency: '$',
      appliances: [
        { name: '1 Ton Inverter AC', room: 'bedroom', watts: 950, standbyWatts: 4, hoursPerDay: 6, quantity: 1, starRating: 5, active: true },
        { name: 'Single Door Refrigerator (190L)', room: 'kitchen', watts: 120, standbyWatts: 0, hoursPerDay: 24, dutyCycle: 0.45, quantity: 1, starRating: 4, active: true },
        { name: '43" LED Smart TV', room: 'living', watts: 70, standbyWatts: 3, hoursPerDay: 4, quantity: 1, starRating: 4, active: true },
        { name: 'Laptop Workstation', room: 'office', watts: 65, standbyWatts: 3, hoursPerDay: 8, quantity: 1, starRating: 5, active: true },
        { name: 'Microwave Oven', room: 'kitchen', watts: 1100, standbyWatts: 3, hoursPerDay: 0.3, quantity: 1, starRating: 4, active: true },
        { name: 'Ceiling Fans (BLDC)', room: 'living', watts: 30, standbyWatts: 1, hoursPerDay: 10, quantity: 2, starRating: 5, active: true },
        { name: 'LED Lights (6 Bulbs)', room: 'other', watts: 54, standbyWatts: 0, hoursPerDay: 5, quantity: 1, starRating: 5, active: true },
        { name: 'Wi-Fi Router', room: 'living', watts: 12, standbyWatts: 0, hoursPerDay: 24, quantity: 1, starRating: 5, active: true },
        { name: 'Water Geyser (15L)', room: 'laundry', watts: 1500, standbyWatts: 1, hoursPerDay: 1.0, quantity: 1, starRating: 3, active: true }
      ]
    },
    family: {
      name: '3-BHK Family Suburban Home',
      description: 'Typical family home with multiple climate units, laundry, and media setup.',
      tariffRate: 0.16,
      currency: '$',
      appliances: [
        { name: 'Master Bedroom Inverter AC (1.5T)', room: 'bedroom', watts: 1400, standbyWatts: 6, hoursPerDay: 8, quantity: 1, starRating: 5, active: true },
        { name: 'Living Room Split AC (2.0T)', room: 'living', watts: 2100, standbyWatts: 7, hoursPerDay: 5, quantity: 1, starRating: 4, active: true },
        { name: 'Double-Door Refrigerator (400L)', room: 'kitchen', watts: 210, standbyWatts: 0, hoursPerDay: 24, dutyCycle: 0.45, quantity: 1, starRating: 4, active: true },
        { name: 'Electric Water Geysers', room: 'laundry', watts: 2000, standbyWatts: 2, hoursPerDay: 2.0, quantity: 2, starRating: 3, active: true },
        { name: '65" 4K Smart OLED TV', room: 'living', watts: 140, standbyWatts: 5, hoursPerDay: 5, quantity: 1, starRating: 4, active: true },
        { name: 'Set-Top Cable Box (Vampire Hog)', room: 'living', watts: 25, standbyWatts: 18, hoursPerDay: 4, quantity: 1, starRating: 2, active: true },
        { name: 'Gaming PC Setup', room: 'office', watts: 450, standbyWatts: 12, hoursPerDay: 4, quantity: 1, starRating: 3, active: true },
        { name: 'Front-Load Washing Machine', room: 'laundry', watts: 850, standbyWatts: 3, hoursPerDay: 1.2, quantity: 1, starRating: 5, active: true },
        { name: 'Dishwasher', room: 'kitchen', watts: 1400, standbyWatts: 3, hoursPerDay: 1.0, quantity: 1, starRating: 4, active: true },
        { name: 'Microwave & Convection', room: 'kitchen', watts: 1300, standbyWatts: 4, hoursPerDay: 0.5, quantity: 1, starRating: 4, active: true },
        { name: 'Ceiling Fans (x4)', room: 'living', watts: 65, standbyWatts: 0, hoursPerDay: 12, quantity: 4, starRating: 3, active: true },
        { name: 'LED Lights (x15)', room: 'other', watts: 135, standbyWatts: 0, hoursPerDay: 6, quantity: 1, starRating: 5, active: true },
        { name: 'Wi-Fi Mesh Routers', room: 'living', watts: 20, standbyWatts: 0, hoursPerDay: 24, quantity: 2, starRating: 5, active: true },
        { name: 'Idle Phone Chargers', room: 'bedroom', watts: 0, standbyWatts: 2.5, hoursPerDay: 0, quantity: 5, starRating: 3, active: true }
      ]
    },
    heavy: {
      name: 'High-Consumption Smart Residence',
      description: 'Multi-zone AC, electric vehicle charger, home server, and luxury appliances.',
      tariffRate: 0.22,
      currency: '$',
      appliances: [
        { name: 'Central Heat Pump / Multi-Split HVAC', room: 'climate', watts: 3600, standbyWatts: 25, hoursPerDay: 10, quantity: 1, starRating: 4, active: true },
        { name: 'EV Home Level 2 Charger (7.2 kW)', room: 'other', watts: 7200, standbyWatts: 5, hoursPerDay: 2.5, quantity: 1, starRating: 5, active: true },
        { name: 'French Door Refrigerator (600L)', room: 'kitchen', watts: 280, standbyWatts: 0, hoursPerDay: 24, dutyCycle: 0.5, quantity: 1, starRating: 4, active: true },
        { name: 'Heat Pump Water Heater', room: 'laundry', watts: 1200, standbyWatts: 3, hoursPerDay: 3.0, quantity: 1, starRating: 5, active: true },
        { name: 'Home Lab / NAS Server', room: 'office', watts: 120, standbyWatts: 0, hoursPerDay: 24, quantity: 1, starRating: 4, active: true },
        { name: '75" 8K TV & 7.1 Soundbar', room: 'living', watts: 260, standbyWatts: 14, hoursPerDay: 6, quantity: 1, starRating: 3, active: true },
        { name: 'Dual Gaming Stations', room: 'office', watts: 800, standbyWatts: 22, hoursPerDay: 5, quantity: 1, starRating: 3, active: true },
        { name: 'Washer & Heat Pump Dryer', room: 'laundry', watts: 1600, standbyWatts: 4, hoursPerDay: 2.0, quantity: 1, starRating: 5, active: true },
        { name: 'Pool Pump / Filter', room: 'other', watts: 1100, standbyWatts: 2, hoursPerDay: 6.0, quantity: 1, starRating: 3, active: true },
        { name: 'Smart Home Hub & IoT Sensors', room: 'living', watts: 35, standbyWatts: 0, hoursPerDay: 24, quantity: 1, starRating: 5, active: true }
      ]
    }
  },

  // Smart energy tips tailored to appliances
  savingTips: [
    {
      id: 'tip_vampire',
      title: 'Eliminate Phantom / Vampire Power',
      category: 'Vampire Draw',
      icon: '🧛‍♂️',
      savingsEst: '$120 - $220 / year',
      description: 'Devices like cable boxes, gaming consoles, and microwave clocks draw power 24/7. Plug them into smart surge strips that cut standby power completely when turned off.'
    },
    {
      id: 'tip_ac_temp',
      title: 'Optimize Air Conditioner to 24°C / 75°F',
      category: 'HVAC',
      icon: '❄️',
      savingsEst: '6% savings per degree set higher',
      description: 'Setting your AC just 1-2 degrees higher saves roughly 6-10% in electricity consumption. Use ceiling fans simultaneously to feel 3° cooler with minimal energy draw.'
    },
    {
      id: 'tip_geyser_timer',
      title: 'Put Water Heaters on a Smart Timer',
      category: 'Water Heating',
      icon: '⏱️',
      savingsEst: '$80 - $150 / year',
      description: 'Water heaters consume ~2000 Watts and constantly reheat water throughout the day. Turn them on only 30-45 minutes before bathing.'
    },
    {
      id: 'tip_fridge_coils',
      title: 'Clean Refrigerator Coils & Check Gasket',
      category: 'Refrigeration',
      icon: '🧊',
      savingsEst: '$30 - $60 / year',
      description: 'Dusty condenser coils force the compressor to work up to 35% harder. Vacuum coils every 6 months and ensure the door seal holds a dollar bill tightly.'
    },
    {
      id: 'tip_led_upgrade',
      title: 'Upgrade Old Incandescent / CFL to LED',
      category: 'Lighting',
      icon: '💡',
      savingsEst: '75% reduction in lighting load',
      description: 'A 9W modern LED gives the same illumination as a 60W incandescent bulb while lasting up to 25 times longer and emitting almost zero heat.'
    },
    {
      id: 'tip_washing_cold',
      title: 'Wash Laundry in Cold Water',
      category: 'Laundry',
      icon: '🧺',
      savingsEst: '90% savings per laundry cycle',
      description: 'Roughly 75% to 90% of the energy consumed by a washing machine goes into heating the water. Cold water detergents clean equally well for daily wear.'
    }
  ]
};

// Make accessible globally
window.ENERGY_DATA = ENERGY_DATA;
