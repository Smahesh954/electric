/**
 * Main Application Orchestrator
 * Coordinates state, UI views, appliance manager, modals,
 * calculator scenarios, charts, and simulation loop.
 */

(function() {
  // Application State
  let state = {
    appliances: [],
    settings: {},
    currentTab: 'dashboard',
    filterRoom: 'all',
    searchQuery: '',
    audit: null,
    editingApplianceId: null,
    liveChart: null
  };

  // DOM Elements cache
  const elements = {};

  function init() {
    cacheElements();
    loadState();
    setupTheme();
    setupLiveCharts();
    bindEvents();
    renderAll();

    // Start live smart meter simulation
    PowerSimulator.start();
  }

  function cacheElements() {
    elements.themeToggle = document.getElementById('theme-toggle');
    elements.vampireKillSwitch = document.getElementById('vampire-kill-switch');
    elements.presetSelect = document.getElementById('preset-select');
    elements.applianceList = document.getElementById('appliance-table-body');
    elements.roomFilterContainer = document.getElementById('room-filter-container');
    elements.searchInput = document.getElementById('appliance-search-input');
    elements.addApplianceBtn = document.getElementById('btn-add-appliance');
    elements.applianceModal = document.getElementById('appliance-modal');
    elements.applianceForm = document.getElementById('appliance-form');
    elements.modalCloseBtn = document.getElementById('modal-close-btn');
    elements.modalCancelBtn = document.getElementById('modal-cancel-btn');
    elements.modalTitle = document.getElementById('modal-title');
    elements.toastContainer = document.getElementById('toast-container');

    // What-if elements
    elements.whatifAcSlider = document.getElementById('whatif-ac-slider');
    elements.whatifAcValue = document.getElementById('whatif-ac-val');
    elements.whatifGeyserSlider = document.getElementById('whatif-geyser-slider');
    elements.whatifGeyserValue = document.getElementById('whatif-geyser-val');
    elements.whatifVampireCheck = document.getElementById('whatif-vampire-check');
    elements.whatifLedCheck = document.getElementById('whatif-led-check');

    // Settings elements
    elements.currencySelect = document.getElementById('setting-currency');
    elements.tariffTypeSelect = document.getElementById('setting-tariff-type');
    elements.flatRateInput = document.getElementById('setting-flat-rate');
    elements.fixedFeeInput = document.getElementById('setting-fixed-fee');
    elements.taxInput = document.getElementById('setting-tax');
    elements.tieredSettingsGroup = document.getElementById('tiered-settings-group');
    elements.tier1LimitInput = document.getElementById('setting-tier1-limit');
    elements.tier1RateInput = document.getElementById('setting-tier1-rate');
    elements.tier2LimitInput = document.getElementById('setting-tier2-limit');
    elements.tier2RateInput = document.getElementById('setting-tier2-rate');
    elements.tier3RateInput = document.getElementById('setting-tier3-rate');
  }

  function loadState() {
    state.appliances = StorageManager.getAppliances();
    state.settings = StorageManager.getSettings();
  }

  function setupTheme() {
    const savedTheme = StorageManager.getTheme();
    StorageManager.setTheme(savedTheme);
    if (elements.themeToggle) {
      elements.themeToggle.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
    }
  }

  function setupLiveCharts() {
    state.liveChart = ChartRenderer.createLivePowerChart('live-power-stream-canvas');

    PowerSimulator.subscribe(data => {
      // Update gauge meter and live text
      ChartRenderer.renderGauge('live-gauge-canvas', data.watts);
      if (state.liveChart) {
        state.liveChart.addPoint(data.watts);
      }

      const liveWattText = document.getElementById('live-meter-watts');
      if (liveWattText) {
        liveWattText.textContent = `${data.watts} W`;
      }

      const liveStatusPill = document.getElementById('live-meter-status');
      if (liveStatusPill) {
        if (data.watts > 3500) {
          liveStatusPill.className = 'status-pill status-danger';
          liveStatusPill.textContent = '⚠️ High Peak Draw';
        } else if (data.watts > 2000) {
          liveStatusPill.className = 'status-pill status-warning';
          liveStatusPill.textContent = '⚡ Elevated Usage';
        } else {
          liveStatusPill.className = 'status-pill status-normal';
          liveStatusPill.textContent = '🟢 Normal Baseline';
        }
      }
    });
  }

  function bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });

    // Theme toggle
    if (elements.themeToggle) {
      elements.themeToggle.addEventListener('click', () => {
        const currentTheme = StorageManager.getTheme();
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        StorageManager.setTheme(nextTheme);
        elements.themeToggle.innerHTML = nextTheme === 'dark' ? '☀️' : '🌙';
        showToast(`Switched to ${nextTheme} mode`, 'info');
      });
    }

    // Vampire Kill Switch in Top Bar
    if (elements.vampireKillSwitch) {
      elements.vampireKillSwitch.checked = !!state.settings.vampireKillSwitchActive;
      elements.vampireKillSwitch.addEventListener('change', (e) => {
        state.settings.vampireKillSwitchActive = e.target.checked;
        StorageManager.saveSettings(state.settings);
        renderAll();
        if (e.target.checked) {
          showToast('🧛‍♂️ Smart Vampire Kill Switch ACTIVATED! All phantom standby loads cut.', 'success');
        } else {
          showToast('Vampire Kill Switch deactivated. Standby draw restored.', 'info');
        }
      });
    }

    // Search and filter
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        renderApplianceList();
      });
    }

    // Preset selection
    if (elements.presetSelect) {
      elements.presetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (!val) return;
        if (confirm(`Load preset profile "${val.toUpperCase()}"? This will replace your current appliance list with realistic standard settings.`)) {
          const res = StorageManager.loadPreset(val);
          if (res) {
            state.appliances = res.appliances;
            state.settings = res.settings;
            populateSettingsForm();
            renderAll();
            showToast(`Loaded preset profile: ${res.name}`, 'success');
          }
        }
        elements.presetSelect.value = '';
      });
    }

    // Modal triggers
    if (elements.addApplianceBtn) {
      elements.addApplianceBtn.addEventListener('click', () => openApplianceModal());
    }
    if (elements.modalCloseBtn) {
      elements.modalCloseBtn.addEventListener('click', () => closeApplianceModal());
    }
    if (elements.modalCancelBtn) {
      elements.modalCancelBtn.addEventListener('click', () => closeApplianceModal());
    }

    // Modal backdrop click
    if (elements.applianceModal) {
      elements.applianceModal.addEventListener('click', (e) => {
        if (e.target === elements.applianceModal) closeApplianceModal();
      });
    }

    // Appliance Form Submit
    if (elements.applianceForm) {
      elements.applianceForm.addEventListener('submit', handleApplianceFormSubmit);
    }

    // Quick Spike Test Button
    const spikeBtn = document.getElementById('btn-spike-test');
    if (spikeBtn) {
      spikeBtn.addEventListener('click', () => {
        PowerSimulator.triggerSpike(2200, 7000);
        showToast('⚡ Simulated 2200W High-Draw Appliance Spike (7s duration)!', 'warning');
      });
    }

    // What-If Sliders
    if (elements.whatifAcSlider) {
      elements.whatifAcSlider.addEventListener('input', (e) => {
        if (elements.whatifAcValue) elements.whatifAcValue.textContent = `${e.target.value} hrs`;
        updateWhatIfResults();
      });
    }
    if (elements.whatifGeyserSlider) {
      elements.whatifGeyserSlider.addEventListener('input', (e) => {
        if (elements.whatifGeyserValue) elements.whatifGeyserValue.textContent = `${e.target.value} hrs`;
        updateWhatIfResults();
      });
    }
    if (elements.whatifVampireCheck) {
      elements.whatifVampireCheck.addEventListener('change', () => updateWhatIfResults());
    }
    if (elements.whatifLedCheck) {
      elements.whatifLedCheck.addEventListener('change', () => updateWhatIfResults());
    }

    // Settings tariff toggle
    if (elements.tariffTypeSelect) {
      elements.tariffTypeSelect.addEventListener('change', (e) => {
        const isTiered = e.target.value === 'tiered';
        if (elements.tieredSettingsGroup) {
          elements.tieredSettingsGroup.style.display = isTiered ? 'block' : 'none';
        }
      });
    }

    // Settings save button
    const saveSettingsBtn = document.getElementById('btn-save-settings');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', handleSaveSettings);
    }

    // Reset defaults button
    const resetBtn = document.getElementById('btn-reset-defaults');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all appliances and settings to factory defaults?')) {
          const res = StorageManager.resetToDefaults();
          state.appliances = res.appliances;
          state.settings = res.settings;
          populateSettingsForm();
          renderAll();
          showToast('Reset to default configurations!', 'info');
        }
      });
    }

    // Export / Import buttons
    const exportJsonBtn = document.getElementById('btn-export-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        StorageManager.exportJSON();
        showToast('JSON backup exported successfully!', 'success');
      });
    }

    const exportCsvBtn = document.getElementById('btn-export-csv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        StorageManager.exportCSV(state.appliances, state.audit, state.settings);
        showToast('Spreadsheet CSV audit exported!', 'success');
      });
    }

    const importInput = document.getElementById('input-import-json');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            StorageManager.importJSON(parsed);
            state.appliances = StorageManager.getAppliances();
            state.settings = StorageManager.getSettings();
            populateSettingsForm();
            renderAll();
            showToast('Backup successfully imported!', 'success');
          } catch (err) {
            alert('Error parsing JSON backup file: ' + err.message);
          }
        };
        reader.readAsText(file);
        e.target.value = '';
      });
    }

    // Print audit report button
    const printBtn = document.getElementById('btn-print-report');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }
  }

  function switchTab(tabId) {
    state.currentTab = tabId;
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.toggle('active', view.id === `tab-view-${tabId}`);
    });

    if (tabId === 'calculator') {
      updateWhatIfResults();
    } else if (tabId === 'analytics') {
      renderAnalyticsView();
    } else if (tabId === 'report') {
      renderReportView();
    }
  }

  function renderAll() {
    // 1. Calculate Audit
    state.audit = EnergyCalculator.computeHouseholdAudit(state.appliances, state.settings);

    // 2. Feed simulator baseline wattage
    PowerSimulator.setBaseWattage(state.audit.totalConnectedWatts * 0.35 + state.audit.totalStandbyWatts);

    // 3. Render Dashboard KPIs
    renderDashboardKPIs();

    // 4. Render Room Filters
    renderRoomFilters();

    // 5. Render Appliance Table
    renderApplianceList();

    // 6. Render Charts
    renderCharts();

    // 7. Render Recommendations & Tips
    renderTips();

    // 8. Populate Settings form if on that view
    populateSettingsForm();
  }

  function renderDashboardKPIs() {
    const audit = state.audit;
    const curr = state.settings.currency;

    // Projected Monthly Bill
    setElementText('kpi-monthly-bill', `${curr}${audit.totalMonthlyCost.toFixed(2)}`);
    setElementText('kpi-monthly-kwh', `${audit.totalMonthlyKwh.toFixed(1)} kWh/mo`);

    // Daily Consumption
    setElementText('kpi-daily-kwh', `${audit.totalDailyKwh.toFixed(2)} kWh`);
    setElementText('kpi-daily-cost', `${curr}${(audit.totalMonthlyCost / 30.4).toFixed(2)} / day`);

    // Total Connected Load & Standby
    setElementText('kpi-connected-load', `${(audit.totalConnectedWatts / 1000).toFixed(2)} kW`);
    setElementText('kpi-active-appliances', `${audit.activeApplianceCount} of ${audit.totalApplianceCount} active`);

    // Phantom / Vampire Waste
    setElementText('kpi-vampire-watts', `${audit.totalStandbyWatts} W`);
    setElementText('kpi-vampire-cost', `${curr}${audit.annualVampireCost.toFixed(2)}/yr wasted`);
    setElementText('kpi-vampire-pct', `${audit.vampirePercentage.toFixed(1)}% of total bill`);

    // Energy Grade Card
    const gradeBadge = document.getElementById('kpi-grade-badge');
    if (gradeBadge) {
      gradeBadge.textContent = audit.grade.letter;
      gradeBadge.style.backgroundColor = audit.grade.color;
    }
    setElementText('kpi-grade-label', audit.grade.label);
    setElementText('kpi-grade-desc', audit.grade.desc);

    // Carbon Footprint
    setElementText('kpi-co2-monthly', `${audit.monthlyCo2Kg.toFixed(1)} kg CO₂`);
    setElementText('kpi-trees-needed', `🌲 Needs ${audit.matureTreesEquivalent} trees to offset`);
  }

  function renderRoomFilters() {
    if (!elements.roomFilterContainer) return;
    const rooms = window.ENERGY_DATA.rooms;

    let html = `<button class="filter-pill ${state.filterRoom === 'all' ? 'active' : ''}" data-room="all">All Rooms (${state.appliances.length})</button>`;
    rooms.forEach(r => {
      const count = state.appliances.filter(a => a.room === r.id).length;
      html += `<button class="filter-pill ${state.filterRoom === r.id ? 'active' : ''}" data-room="${r.id}">${r.icon} ${r.name} (${count})</button>`;
    });

    elements.roomFilterContainer.innerHTML = html;

    // Attach click listeners
    elements.roomFilterContainer.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        state.filterRoom = btn.getAttribute('data-room');
        renderRoomFilters();
        renderApplianceList();
      });
    });
  }

  function renderApplianceList() {
    if (!elements.applianceList) return;

    let filtered = state.appliances;
    if (state.filterRoom !== 'all') {
      filtered = filtered.filter(a => a.room === state.filterRoom);
    }
    if (state.searchQuery) {
      filtered = filtered.filter(a => a.name.toLowerCase().includes(state.searchQuery));
    }

    if (filtered.length === 0) {
      elements.applianceList.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">
            No appliances match the current filter or search criteria.
          </td>
        </tr>
      `;
      return;
    }

    const curr = state.settings.currency;
    let html = '';

    filtered.forEach(app => {
      const stats = state.audit.applianceStats[app.id] || {
        dailyKwh: 0,
        monthlyKwh: 0,
        monthlyCost: 0,
        annualStandbyCost: 0
      };

      const roomObj = window.ENERGY_DATA.rooms.find(r => r.id === app.room) || { name: app.room, icon: '🏠' };

      // High consumption badge
      const isHighHog = stats.monthlyKwh > 50;
      const isVampireHog = (app.standbyWatts || 0) >= 8;

      html += `
        <tr class="${!app.active ? 'row-disabled' : ''}">
          <td>
            <label class="toggle-switch">
              <input type="checkbox" ${app.active ? 'checked' : ''} data-toggle-id="${app.id}">
              <span class="toggle-slider"></span>
            </label>
          </td>
          <td>
            <div class="appliance-name-cell">
              <strong>${escapeHtml(app.name)}</strong>
              ${isHighHog ? '<span class="badge badge-warning">High Load</span>' : ''}
              ${isVampireHog ? '<span class="badge badge-vampire">Vampire Hog</span>' : ''}
              <div class="appliance-desc-sub">${escapeHtml(app.description || '')}</div>
            </div>
          </td>
          <td>
            <span class="room-pill">${roomObj.icon} ${roomObj.name}</span>
          </td>
          <td>
            <div><strong>${app.watts} W</strong></div>
            <div class="text-muted small">Qty: ${app.quantity || 1}</div>
          </td>
          <td>
            <span class="${app.standbyWatts > 5 ? 'text-danger font-semibold' : 'text-muted'}">
              ${state.settings.vampireKillSwitchActive ? '0 W <s class="text-muted">(' + app.standbyWatts + 'W)</s>' : app.standbyWatts + ' W'}
            </span>
          </td>
          <td>
            <div>${app.hoursPerDay} hrs/day</div>
            <div class="text-muted small">${stats.dailyKwh.toFixed(2)} kWh/d</div>
          </td>
          <td>
            <div><strong>${curr}${stats.monthlyCost.toFixed(2)}</strong></div>
            <div class="text-muted small">${stats.monthlyKwh.toFixed(1)} kWh/mo</div>
          </td>
          <td class="action-buttons-cell">
            <button class="btn-icon" title="Edit Appliance" data-edit-id="${app.id}">✏️</button>
            <button class="btn-icon" title="Duplicate" data-duplicate-id="${app.id}">📋</button>
            <button class="btn-icon btn-icon-danger" title="Delete" data-delete-id="${app.id}">🗑️</button>
          </td>
        </tr>
      `;
    });

    elements.applianceList.innerHTML = html;

    // Attach row events
    elements.applianceList.querySelectorAll('[data-toggle-id]').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-toggle-id');
        toggleApplianceActive(id, e.target.checked);
      });
    });

    elements.applianceList.querySelectorAll('[data-edit-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-edit-id');
        openApplianceModal(id);
      });
    });

    elements.applianceList.querySelectorAll('[data-duplicate-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-duplicate-id');
        duplicateAppliance(id);
      });
    });

    elements.applianceList.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-delete-id');
        deleteAppliance(id);
      });
    });
  }

  function renderCharts() {
    const audit = state.audit;
    const curr = state.settings.currency;

    // Donut chart of Top Consumers
    const donutItems = audit.topHogs.map(h => ({
      name: h.name,
      value: h.monthlyKwh
    }));

    ChartRenderer.renderDonut('dashboard-donut-canvas', donutItems, curr);

    // Room breakdown bar chart
    const roomItems = Object.keys(audit.roomBreakdown).map(k => {
      const r = audit.roomBreakdown[k];
      return {
        name: r.name,
        icon: r.icon,
        value: r.kwh,
        cost: r.cost,
        percent: audit.totalMonthlyKwh > 0 ? (r.kwh / audit.totalMonthlyKwh) * 100 : 0
      };
    }).filter(r => r.value > 0);

    ChartRenderer.renderBarBreakdown('room-bar-container', roomItems, curr);
  }

  function renderAnalyticsView() {
    const audit = state.audit;
    const curr = state.settings.currency;

    // Sizing solar system
    setElementText('solar-system-size', `${audit.solarSystemKw} kW`);
    setElementText('solar-panel-count', `${audit.solarPanels400W} Panels (400W each)`);
    setElementText('solar-annual-savings', `${curr}${audit.estimatedSolarAnnualSavings.toFixed(2)} / yr`);
    setElementText('solar-co2-offset', `${(audit.annualCo2Kg).toFixed(0)} kg CO₂ / yr`);

    // Render large analytics breakdown
    const applianceItems = audit.topHogs.map(h => ({
      name: h.name,
      value: h.monthlyKwh,
      cost: h.monthlyCost,
      percent: h.percentageOfTotal
    }));
    ChartRenderer.renderBarBreakdown('analytics-top-hogs-container', applianceItems, curr);
  }

  function renderReportView() {
    const audit = state.audit;
    const curr = state.settings.currency;
    const container = document.getElementById('report-content-container');
    if (!container) return;

    let html = `
      <div class="report-header">
        <h2>🏠 Comprehensive Home Energy Audit & Optimization Plan</h2>
        <p class="text-muted">Generated: ${new Date().toLocaleDateString()} | Active Appliances: ${audit.activeApplianceCount} | Total Monthly Load: ${audit.totalMonthlyKwh.toFixed(1)} kWh</p>
      </div>

      <div class="report-summary-boxes">
        <div class="report-box">
          <span class="report-box-title">Efficiency Rating</span>
          <h3 style="color: ${audit.grade.color};">${audit.grade.letter} - ${audit.grade.label}</h3>
          <p>${audit.grade.desc}</p>
        </div>
        <div class="report-box">
          <span class="report-box-title">Projected Electric Bill</span>
          <h3>${curr}${audit.totalMonthlyCost.toFixed(2)} / month</h3>
          <p>${curr}${audit.totalAnnualCost.toFixed(2)} annualized</p>
        </div>
        <div class="report-box">
          <span class="report-box-title">Phantom Vampire Waste</span>
          <h3 class="text-danger">${curr}${audit.annualVampireCost.toFixed(2)} / year</h3>
          <p>${audit.vampirePercentage.toFixed(1)}% of your bill is wasted on turned-off appliances</p>
        </div>
      </div>

      <div class="report-section">
        <h3>Top 5 Energy Drainers</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>Appliance</th>
              <th>Monthly kWh</th>
              <th>Share of Bill</th>
              <th>Estimated Monthly Cost</th>
            </tr>
          </thead>
          <tbody>
            ${audit.topHogs.map(h => `
              <tr>
                <td><strong>${escapeHtml(h.name)}</strong></td>
                <td>${h.monthlyKwh.toFixed(1)} kWh</td>
                <td>${h.percentageOfTotal.toFixed(1)}%</td>
                <td>${curr}${h.monthlyCost.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="report-section">
        <h3>Tailored Action Checklist to Slash Bills</h3>
        <ul class="report-checklist">
          <li>
            <strong>Cut Standby Vampire Loads:</strong> Install smart power strips for entertainment center and computers. Immediate savings: <em>${curr}${audit.annualVampireCost.toFixed(2)}/year</em>.
          </li>
          <li>
            <strong>HVAC Thermostat Calibration:</strong> Running AC at 24°C instead of 20°C reduces compressor work by ~20%, saving an estimated <em>${curr}${(audit.totalMonthlyCost * 0.18).toFixed(2)}/month</em>.
          </li>
          <li>
            <strong>Water Heater Timing:</strong> Use water geyser only 45 minutes before use rather than continuous reheat, saving <em>~${curr}${(audit.totalMonthlyCost * 0.12).toFixed(2)}/month</em>.
          </li>
          <li>
            <strong>Clean Refrigerator Coils:</strong> Improve compressor efficiency by 15-25% with simple vacuuming.
          </li>
        </ul>
      </div>
    `;

    container.innerHTML = html;
  }

  function renderTips() {
    const container = document.getElementById('saving-tips-container');
    if (!container) return;

    const tips = window.ENERGY_DATA.savingTips;
    let html = '';

    tips.forEach(t => {
      html += `
        <div class="tip-card">
          <div class="tip-icon">${t.icon}</div>
          <div class="tip-body">
            <div class="tip-title-row">
              <h4>${t.title}</h4>
              <span class="tip-badge">${t.savingsEst}</span>
            </div>
            <p class="tip-desc">${t.description}</p>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function updateWhatIfResults() {
    const audit = state.audit;
    if (!audit) return;

    const acHours = parseFloat(elements.whatifAcSlider ? elements.whatifAcSlider.value : 0);
    const geyserHours = parseFloat(elements.whatifGeyserSlider ? elements.whatifGeyserSlider.value : 0);
    const killVampire = elements.whatifVampireCheck ? elements.whatifVampireCheck.checked : false;
    const upgradeLeds = elements.whatifLedCheck ? elements.whatifLedCheck.checked : false;

    const res = EnergyCalculator.simulateWhatIf(audit, state.settings, {
      acHoursReduction: acHours,
      geyserReduction: geyserHours,
      eliminateVampire: killVampire,
      ledUpgrade: upgradeLeds
    });

    const curr = state.settings.currency;
    setElementText('whatif-monthly-savings', `${curr}${res.monthlySavingsCost.toFixed(2)} / mo`);
    setElementText('whatif-annual-savings', `${curr}${res.annualSavingsCost.toFixed(2)} / yr`);
    setElementText('whatif-percent-cut', `${res.percentCut.toFixed(1)}% Bill Reduction`);
    setElementText('whatif-new-bill', `New Bill: ${curr}${res.newMonthlyCost.toFixed(2)}/mo (Saved ${res.savedMonthlyKwh.toFixed(1)} kWh)`);
  }

  // Appliance CRUD
  function toggleApplianceActive(id, isActive) {
    const app = state.appliances.find(a => a.id === id);
    if (app) {
      app.active = isActive;
      StorageManager.saveAppliances(state.appliances);
      renderAll();
    }
  }

  function openApplianceModal(id = null) {
    state.editingApplianceId = id;
    if (id) {
      const app = state.appliances.find(a => a.id === id);
      if (!app) return;
      elements.modalTitle.textContent = 'Edit Appliance';
      document.getElementById('input-app-name').value = app.name;
      document.getElementById('input-app-room').value = app.room;
      document.getElementById('input-app-watts').value = app.watts;
      document.getElementById('input-app-standby').value = app.standbyWatts || 0;
      document.getElementById('input-app-hours').value = app.hoursPerDay;
      document.getElementById('input-app-qty').value = app.quantity || 1;
      document.getElementById('input-app-rating').value = app.starRating || 4;
      document.getElementById('input-app-desc').value = app.description || '';
    } else {
      elements.modalTitle.textContent = 'Add New Appliance';
      elements.applianceForm.reset();
      document.getElementById('input-app-qty').value = '1';
      document.getElementById('input-app-rating').value = '4';
    }
    elements.applianceModal.classList.add('active');
  }

  function closeApplianceModal() {
    elements.applianceModal.classList.remove('active');
    state.editingApplianceId = null;
  }

  function handleApplianceFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('input-app-name').value.trim();
    const room = document.getElementById('input-app-room').value;
    const watts = parseFloat(document.getElementById('input-app-watts').value) || 0;
    const standbyWatts = parseFloat(document.getElementById('input-app-standby').value) || 0;
    const hoursPerDay = parseFloat(document.getElementById('input-app-hours').value) || 0;
    const quantity = parseInt(document.getElementById('input-app-qty').value, 10) || 1;
    const starRating = parseInt(document.getElementById('input-app-rating').value, 10) || 4;
    const description = document.getElementById('input-app-desc').value.trim();

    if (!name) {
      alert('Please enter an appliance name.');
      return;
    }

    if (state.editingApplianceId) {
      // Update existing
      const app = state.appliances.find(a => a.id === state.editingApplianceId);
      if (app) {
        app.name = name;
        app.room = room;
        app.watts = watts;
        app.standbyWatts = standbyWatts;
        app.hoursPerDay = hoursPerDay;
        app.quantity = quantity;
        app.starRating = starRating;
        app.description = description;
        showToast(`Updated "${name}"`, 'success');
      }
    } else {
      // Add new
      const newApp = {
        id: 'custom_' + Date.now(),
        name,
        room,
        category: room === 'bedroom' || room === 'living' ? 'climate' : room,
        watts,
        standbyWatts,
        hoursPerDay,
        quantity,
        starRating,
        description,
        active: true
      };
      state.appliances.unshift(newApp);
      showToast(`Added "${name}" to your appliances!`, 'success');
    }

    StorageManager.saveAppliances(state.appliances);
    closeApplianceModal();
    renderAll();
  }

  function duplicateAppliance(id) {
    const orig = state.appliances.find(a => a.id === id);
    if (!orig) return;

    const copy = Object.assign({}, orig, {
      id: 'copy_' + Date.now(),
      name: `${orig.name} (Copy)`
    });

    state.appliances.push(copy);
    StorageManager.saveAppliances(state.appliances);
    renderAll();
    showToast(`Duplicated "${orig.name}"`, 'info');
  }

  function deleteAppliance(id) {
    const app = state.appliances.find(a => a.id === id);
    if (!app) return;

    if (confirm(`Are you sure you want to remove "${app.name}" from your energy monitor?`)) {
      state.appliances = state.appliances.filter(a => a.id !== id);
      StorageManager.saveAppliances(state.appliances);
      renderAll();
      showToast(`Removed "${app.name}"`, 'info');
    }
  }

  // Settings
  function populateSettingsForm() {
    if (elements.currencySelect) elements.currencySelect.value = state.settings.currency;
    if (elements.tariffTypeSelect) elements.tariffTypeSelect.value = state.settings.tariffType;
    if (elements.flatRateInput) elements.flatRateInput.value = state.settings.flatRate;
    if (elements.fixedFeeInput) elements.fixedFeeInput.value = state.settings.fixedSupplyFee;
    if (elements.taxInput) elements.taxInput.value = state.settings.taxPercentage;

    if (elements.tieredSettingsGroup) {
      elements.tieredSettingsGroup.style.display = state.settings.tariffType === 'tiered' ? 'block' : 'none';
      if (elements.tier1LimitInput) elements.tier1LimitInput.value = state.settings.tier1Limit;
      if (elements.tier1RateInput) elements.tier1RateInput.value = state.settings.tier1Rate;
      if (elements.tier2LimitInput) elements.tier2LimitInput.value = state.settings.tier2Limit;
      if (elements.tier2RateInput) elements.tier2RateInput.value = state.settings.tier2Rate;
      if (elements.tier3RateInput) elements.tier3RateInput.value = state.settings.tier3Rate;
    }
  }

  function handleSaveSettings() {
    state.settings.currency = elements.currencySelect ? elements.currencySelect.value : '$';
    state.settings.tariffType = elements.tariffTypeSelect ? elements.tariffTypeSelect.value : 'flat';
    state.settings.flatRate = parseFloat(elements.flatRateInput.value) || 0.16;
    state.settings.fixedSupplyFee = parseFloat(elements.fixedFeeInput.value) || 0;
    state.settings.taxPercentage = parseFloat(elements.taxInput.value) || 0;

    if (state.settings.tariffType === 'tiered') {
      state.settings.tier1Limit = parseFloat(elements.tier1LimitInput.value) || 150;
      state.settings.tier1Rate = parseFloat(elements.tier1RateInput.value) || 0.12;
      state.settings.tier2Limit = parseFloat(elements.tier2LimitInput.value) || 350;
      state.settings.tier2Rate = parseFloat(elements.tier2RateInput.value) || 0.18;
      state.settings.tier3Rate = parseFloat(elements.tier3RateInput.value) || 0.26;
    }

    StorageManager.saveSettings(state.settings);
    renderAll();
    showToast('Tariff & system preferences saved successfully!', 'success');
  }

  // Toast Notification System
  function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // Utilities
  function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  // Run initialization on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
