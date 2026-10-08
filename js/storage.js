/**
 * Storage & State Persistence Manager
 * Handles LocalStorage persistence, preset profiles, backup JSON export/import,
 * and CSV spreadsheet report generation.
 */

const StorageManager = (function() {
  const STORAGE_KEY_APPLIANCES = 'hem_appliances_v1';
  const STORAGE_KEY_SETTINGS = 'hem_settings_v1';
  const STORAGE_KEY_THEME = 'hem_theme_v1';

  // Default system settings
  const defaultSettings = {
    currency: '$',
    tariffType: 'flat', // 'flat' or 'tiered'
    flatRate: 0.16, // per kWh
    // Tiered pricing: e.g. 0-100 kWh @ 0.10, 101-300 kWh @ 0.16, >300 kWh @ 0.24
    tier1Limit: 150,
    tier1Rate: 0.12,
    tier2Limit: 350,
    tier2Rate: 0.18,
    tier3Rate: 0.26,
    fixedSupplyFee: 12.00, // Monthly base connection charge
    taxPercentage: 5.0, // Sales / energy tax %
    vampireKillSwitchActive: false, // If true, simulates all phantom loads cut off
    co2EmissionFactor: 0.85 // lbs CO2 per kWh (approx ~0.385 kg or 0.85 lbs)
  };

  /**
   * Deep clone an object
   */
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Get all active & saved appliances
   */
  function getAppliances() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_APPLIANCES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to parse appliances from localStorage:', e);
    }
    // Return deep cloned default catalog
    return clone(window.ENERGY_DATA.catalog);
  }

  /**
   * Save appliances array to localStorage
   */
  function saveAppliances(appliances) {
    try {
      localStorage.setItem(STORAGE_KEY_APPLIANCES, JSON.stringify(appliances));
      return true;
    } catch (e) {
      console.error('Failed to save appliances:', e);
      return false;
    }
  }

  /**
   * Get user settings
   */
  function getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (data) {
        return Object.assign({}, defaultSettings, JSON.parse(data));
      }
    } catch (e) {
      console.error('Failed to parse settings:', e);
    }
    return clone(defaultSettings);
  }

  /**
   * Save user settings
   */
  function saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Failed to save settings:', e);
      return false;
    }
  }

  /**
   * Load a preset profile (apartment, family, heavy)
   */
  function loadPreset(presetKey) {
    const preset = window.ENERGY_DATA.presets[presetKey];
    if (!preset) return null;

    const newAppliances = preset.appliances.map((app, idx) => ({
      id: 'app_' + Date.now() + '_' + idx,
      name: app.name,
      category: app.room === 'bedroom' || app.room === 'living' ? 'climate' : app.room,
      room: app.room,
      watts: app.watts,
      standbyWatts: app.standbyWatts || 0,
      hoursPerDay: app.hoursPerDay,
      dutyCycle: app.dutyCycle || 1.0,
      quantity: app.quantity || 1,
      starRating: app.starRating || 4,
      active: app.active !== undefined ? app.active : true,
      description: 'Configured from ' + preset.name
    }));

    saveAppliances(newAppliances);

    const currentSettings = getSettings();
    currentSettings.flatRate = preset.tariffRate || currentSettings.flatRate;
    currentSettings.currency = preset.currency || currentSettings.currency;
    saveSettings(currentSettings);

    return { appliances: newAppliances, settings: currentSettings, name: preset.name };
  }

  /**
   * Reset everything to initial demo defaults
   */
  function resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY_APPLIANCES);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    return {
      appliances: clone(window.ENERGY_DATA.catalog),
      settings: clone(defaultSettings)
    };
  }

  /**
   * Export all data as a downloadable JSON file
   */
  function exportJSON() {
    const backup = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      settings: getSettings(),
      appliances: getAppliances()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `energy_audit_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Import data from parsed JSON object
   */
  function importJSON(parsedData) {
    if (!parsedData || !Array.isArray(parsedData.appliances)) {
      throw new Error('Invalid backup file format. Must contain an "appliances" array.');
    }
    saveAppliances(parsedData.appliances);
    if (parsedData.settings) {
      saveSettings(Object.assign({}, defaultSettings, parsedData.settings));
    }
    return true;
  }

  /**
   * Export audit data to CSV for Excel / Google Sheets
   */
  function exportCSV(appliances, calculations, settings) {
    const headers = [
      'Appliance Name',
      'Room',
      'Operating Watts',
      'Standby Watts',
      'Hours Per Day',
      'Quantity',
      'Active Status',
      'Daily kWh',
      'Monthly kWh',
      `Monthly Cost (${settings.currency})`,
      `Annual Vampire Cost (${settings.currency})`
    ];

    const rows = appliances.map((app) => {
      const calc = calculations.applianceStats[app.id] || {
        dailyKwh: 0,
        monthlyKwh: 0,
        monthlyCost: 0,
        annualStandbyCost: 0
      };
      return [
        `"${app.name.replace(/"/g, '""')}"`,
        `"${app.room}"`,
        app.watts,
        app.standbyWatts,
        app.hoursPerDay,
        app.quantity,
        app.active ? 'Active' : 'Disabled',
        calc.dailyKwh.toFixed(2),
        calc.monthlyKwh.toFixed(2),
        calc.monthlyCost.toFixed(2),
        calc.annualStandbyCost.toFixed(2)
      ].join(',');
    });

    // Add summary row
    rows.push('');
    rows.push(`"TOTAL HOUSEHOLD",,,,,"",,${calculations.totalDailyKwh.toFixed(2)},${calculations.totalMonthlyKwh.toFixed(2)},${calculations.totalMonthlyCost.toFixed(2)},${calculations.annualVampireCost.toFixed(2)}`);

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `household_energy_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Theme mode preference (dark / light)
   */
  function getTheme() {
    return localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
  }

  function setTheme(theme) {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  return {
    getAppliances,
    saveAppliances,
    getSettings,
    saveSettings,
    loadPreset,
    resetToDefaults,
    exportJSON,
    importJSON,
    exportCSV,
    getTheme,
    setTheme
  };
})();

window.StorageManager = StorageManager;
