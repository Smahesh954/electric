document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const appliances = StorageManager.getAppliances();
    const settings = StorageManager.getSettings();
    const audit = EnergyCalculator.computeHouseholdAudit(appliances, settings);
    const currency = settings.currency;

    const sizeEl = document.getElementById('solar-system-size');
    if (sizeEl) sizeEl.textContent = `${audit.solarSystemKw} kW`;

    const countEl = document.getElementById('solar-panel-count');
    if (countEl) countEl.textContent = `${audit.solarPanels400W} Panels (400W each)`;

    const savingsEl = document.getElementById('solar-annual-savings');
    if (savingsEl) {
      savingsEl.textContent = `${currency}${audit.estimatedSolarAnnualSavings.toFixed(2)} / yr`;
    }

    const co2El = document.getElementById('solar-co2-offset');
    if (co2El) co2El.textContent = `${audit.annualCo2Kg.toFixed(0)} kg CO₂ / yr`;

    const items = audit.topHogs.map(hog => ({
      name: hog.name,
      value: hog.monthlyKwh,
      cost: hog.monthlyCost,
      percent: hog.percentageOfTotal
    }));

    ChartRenderer.renderBarBreakdown('analytics-top-hogs-container', items, currency);
  }, 100);
});
