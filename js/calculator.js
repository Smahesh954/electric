/**
 * Home Energy Calculator Engine
 * Performs detailed mathematical modeling for:
 * - Appliance daily & monthly kWh
 * - Phantom / Vampire power waste
 * - Flat & Multi-tier electricity tariff billing
 * - Carbon emissions & tree offset equivalence
 * - Solar PV generation offset & payback
 * - Household Energy Efficiency Grade (A+ to F)
 */

const EnergyCalculator = (function() {
  const DAYS_PER_MONTH = 30.4; // Average days per month

  /**
   * Calculate detailed energy stats for a single appliance
   */
  function calculateApplianceEnergy(app, settings) {
    if (!app.active) {
      return {
        dailyRunningKwh: 0,
        dailyStandbyKwh: 0,
        dailyKwh: 0,
        monthlyKwh: 0,
        monthlyCost: 0,
        annualCost: 0,
        annualStandbyCost: 0,
        currentDrawWatts: 0,
        totalConnectedWatts: (app.watts || 0) * (app.quantity || 1)
      };
    }

    const qty = Math.max(1, parseInt(app.quantity, 10) || 1);
    const operatingWatts = parseFloat(app.watts) || 0;
    const dutyCycle = app.dutyCycle !== undefined ? parseFloat(app.dutyCycle) : 1.0;
    const hoursPerDay = Math.min(24, Math.max(0, parseFloat(app.hoursPerDay) || 0));

    // Standby is active during the non-operating hours (24 - hoursPerDay)
    let standbyWatts = parseFloat(app.standbyWatts) || 0;
    if (settings.vampireKillSwitchActive) {
      standbyWatts = 0; // Cut off by smart switch
    }

    const standbyHours = Math.max(0, 24 - hoursPerDay);

    // kWh calculations
    const dailyRunningKwh = ((operatingWatts * dutyCycle * hoursPerDay) / 1000) * qty;
    const dailyStandbyKwh = ((standbyWatts * standbyHours) / 1000) * qty;
    const dailyKwh = dailyRunningKwh + dailyStandbyKwh;
    const monthlyKwh = dailyKwh * DAYS_PER_MONTH;

    // Cost estimation using effective flat rate (approximate for individual breakdown)
    const effectiveRate = getEffectiveRatePerKwh(settings);
    const monthlyCost = monthlyKwh * effectiveRate;
    const annualCost = monthlyCost * 12;
    const annualStandbyCost = (dailyStandbyKwh * 365) * effectiveRate;

    return {
      dailyRunningKwh,
      dailyStandbyKwh,
      dailyKwh,
      monthlyKwh,
      monthlyCost,
      annualCost,
      annualStandbyCost,
      currentDrawWatts: operatingWatts * qty,
      totalConnectedWatts: operatingWatts * qty,
      standbyWattsTotal: standbyWatts * qty
    };
  }

  /**
   * Determine effective average rate per kWh for single item estimations
   */
  function getEffectiveRatePerKwh(settings) {
    if (settings.tariffType === 'tiered') {
      return (settings.tier1Rate + settings.tier2Rate) / 2;
    }
    return parseFloat(settings.flatRate) || 0.16;
  }

  /**
   * Calculate tiered utility electricity bill
   */
  function computeUtilityBill(totalMonthlyKwh, settings) {
    const fixedFee = parseFloat(settings.fixedSupplyFee) || 0;
    const taxRate = (parseFloat(settings.taxPercentage) || 0) / 100;

    let energyCharge = 0;
    const tierBreakdown = [];

    if (settings.tariffType === 'tiered') {
      const t1Limit = parseFloat(settings.tier1Limit) || 150;
      const t1Rate = parseFloat(settings.tier1Rate) || 0.12;
      const t2Limit = parseFloat(settings.tier2Limit) || 350;
      const t2Rate = parseFloat(settings.tier2Rate) || 0.18;
      const t3Rate = parseFloat(settings.tier3Rate) || 0.26;

      let remainingKwh = totalMonthlyKwh;

      // Tier 1
      const t1Kwh = Math.min(remainingKwh, t1Limit);
      const t1Cost = t1Kwh * t1Rate;
      energyCharge += t1Cost;
      remainingKwh = Math.max(0, remainingKwh - t1Kwh);
      tierBreakdown.push({ tier: 'Tier 1 (Base)', kwh: t1Kwh, rate: t1Rate, cost: t1Cost });

      // Tier 2
      const t2Capacity = Math.max(0, t2Limit - t1Limit);
      const t2Kwh = Math.min(remainingKwh, t2Capacity);
      const t2Cost = t2Kwh * t2Rate;
      energyCharge += t2Cost;
      remainingKwh = Math.max(0, remainingKwh - t2Kwh);
      tierBreakdown.push({ tier: 'Tier 2 (Mid)', kwh: t2Kwh, rate: t2Rate, cost: t2Cost });

      // Tier 3
      if (remainingKwh > 0) {
        const t3Cost = remainingKwh * t3Rate;
        energyCharge += t3Cost;
        tierBreakdown.push({ tier: 'Tier 3 (High)', kwh: remainingKwh, rate: t3Rate, cost: t3Cost });
      }
    } else {
      // Flat rate
      const flatRate = parseFloat(settings.flatRate) || 0.16;
      energyCharge = totalMonthlyKwh * flatRate;
      tierBreakdown.push({ tier: 'Flat Rate', kwh: totalMonthlyKwh, rate: flatRate, cost: energyCharge });
    }

    const taxes = (energyCharge + fixedFee) * taxRate;
    const totalBill = energyCharge + fixedFee + taxes;

    return {
      energyCharge,
      fixedFee,
      taxes,
      totalBill,
      tierBreakdown,
      effectiveRatePerKwh: totalMonthlyKwh > 0 ? (totalBill / totalMonthlyKwh) : 0
    };
  }

  /**
   * Run full household energy audit computation
   */
  function computeHouseholdAudit(appliances, settings) {
    let totalConnectedWatts = 0;
    let totalStandbyWatts = 0;
    let totalDailyKwh = 0;
    let totalDailyStandbyKwh = 0;
    let totalMonthlyKwh = 0;
    let activeApplianceCount = 0;

    const roomBreakdown = {};
    const categoryBreakdown = {};
    const applianceStats = {};
    const sortedHogs = [];

    // Initialize rooms
    (window.ENERGY_DATA.rooms || []).forEach(r => {
      roomBreakdown[r.id] = { name: r.name, icon: r.icon, kwh: 0, cost: 0, count: 0 };
    });

    appliances.forEach(app => {
      const stats = calculateApplianceEnergy(app, settings);
      applianceStats[app.id] = stats;

      if (app.active) {
        activeApplianceCount++;
        totalConnectedWatts += stats.totalConnectedWatts;
        totalStandbyWatts += stats.standbyWattsTotal || 0;
        totalDailyKwh += stats.dailyKwh;
        totalDailyStandbyKwh += stats.dailyStandbyKwh;
        totalMonthlyKwh += stats.monthlyKwh;

        // Room breakdown
        const roomKey = app.room || 'other';
        if (!roomBreakdown[roomKey]) {
          roomBreakdown[roomKey] = { name: roomKey, icon: '🏠', kwh: 0, cost: 0, count: 0 };
        }
        roomBreakdown[roomKey].kwh += stats.monthlyKwh;
        roomBreakdown[roomKey].cost += stats.monthlyCost;
        roomBreakdown[roomKey].count += 1;

        // Category breakdown
        const catKey = app.category || 'other';
        categoryBreakdown[catKey] = (categoryBreakdown[catKey] || 0) + stats.monthlyKwh;

        // Sorted hogs list
        sortedHogs.push({
          id: app.id,
          name: app.name,
          room: app.room,
          monthlyKwh: stats.monthlyKwh,
          monthlyCost: stats.monthlyCost,
          watts: app.watts,
          hoursPerDay: app.hoursPerDay,
          percentageOfTotal: 0 // Will populate below
        });
      }
    });

    // Populate percentages & sort top hogs
    sortedHogs.sort((a, b) => b.monthlyKwh - a.monthlyKwh);
    sortedHogs.forEach(h => {
      h.percentageOfTotal = totalMonthlyKwh > 0 ? (h.monthlyKwh / totalMonthlyKwh) * 100 : 0;
    });

    // Compute bill
    const bill = computeUtilityBill(totalMonthlyKwh, settings);

    // Phantom / Vampire loss stats
    const monthlyStandbyKwh = totalDailyStandbyKwh * DAYS_PER_MONTH;
    const vampireBillPortion = bill.effectiveRatePerKwh * monthlyStandbyKwh;
    const annualVampireCost = vampireBillPortion * 12;
    const vampirePercentage = totalMonthlyKwh > 0 ? (monthlyStandbyKwh / totalMonthlyKwh) * 100 : 0;

    // Environmental calculations (CO2 factor in kg: ~0.4 kg CO2 per kWh)
    const monthlyCo2Kg = totalMonthlyKwh * 0.40;
    const annualCo2Kg = monthlyCo2Kg * 12;
    const matureTreesEquivalent = Math.round(annualCo2Kg / 22); // 1 mature tree absorbs ~22kg CO2/year

    // Solar PV sizing
    // Average 4.5 peak sun hours per day, 78% system performance ratio
    const dailyKwhNeeded = totalDailyKwh;
    const solarSystemKw = (dailyKwhNeeded / (4.5 * 0.78));
    const solarPanels400W = Math.ceil((solarSystemKw * 1000) / 400);
    const estimatedSolarAnnualSavings = bill.totalBill * 12 * 0.90; // ~90% bill offset

    // Energy Efficiency Grade (A+ to F)
    const grade = computeEfficiencyGrade(totalDailyKwh, vampirePercentage, appliances.length);

    return {
      totalConnectedWatts,
      totalStandbyWatts,
      totalDailyKwh,
      totalDailyStandbyKwh,
      totalMonthlyKwh,
      totalAnnualKwh: totalMonthlyKwh * 12,
      totalMonthlyCost: bill.totalBill,
      totalAnnualCost: bill.totalBill * 12,
      energyCharge: bill.energyCharge,
      fixedFee: bill.fixedFee,
      taxes: bill.taxes,
      tierBreakdown: bill.tierBreakdown,
      effectiveRatePerKwh: bill.effectiveRatePerKwh,
      activeApplianceCount,
      totalApplianceCount: appliances.length,
      // Vampire loss
      monthlyStandbyKwh,
      annualVampireCost,
      vampirePercentage,
      // Environmental
      monthlyCo2Kg,
      annualCo2Kg,
      matureTreesEquivalent,
      // Solar
      solarSystemKw: Math.max(0.8, Number(solarSystemKw.toFixed(2))),
      solarPanels400W: Math.max(2, solarPanels400W),
      estimatedSolarAnnualSavings,
      // Grouping
      roomBreakdown,
      categoryBreakdown,
      topHogs: sortedHogs.slice(0, 5),
      applianceStats,
      grade
    };
  }

  /**
   * Determine Home Energy Efficiency Grade
   */
  function computeEfficiencyGrade(dailyKwh, vampirePct, totalAppliances) {
    // Normal household benchmark: ~15 to 30 kWh/day
    let score = 100;

    if (dailyKwh > 45) score -= 35;
    else if (dailyKwh > 30) score -= 25;
    else if (dailyKwh > 20) score -= 15;
    else if (dailyKwh > 12) score -= 5;

    // Vampire penalties
    if (vampirePct > 15) score -= 20;
    else if (vampirePct > 8) score -= 10;
    else if (vampirePct > 4) score -= 5;

    if (score >= 90) return { letter: 'A+', color: '#10b981', label: 'Exceptional Efficiency', desc: 'Minimal energy waste and optimized usage.' };
    if (score >= 80) return { letter: 'A', color: '#059669', label: 'Very Efficient', desc: 'Low idle drain and balanced consumption.' };
    if (score >= 70) return { letter: 'B', color: '#3b82f6', label: 'Good Standard', desc: 'Average modern household consumption.' };
    if (score >= 55) return { letter: 'C', color: '#f59e0b', label: 'Moderate Waste', desc: 'Significant standby power or heavy HVAC cycling detected.' };
    if (score >= 40) return { letter: 'D', color: '#f97316', label: 'High Consumption', desc: 'Noticeable waste; high opportunity for savings.' };
    return { letter: 'F', color: '#ef4444', label: 'Severe Energy Waste', desc: 'Heavy vampire drain and continuous unoptimized high-wattage loads.' };
  }

  /**
   * What-If Scenario Calculation
   */
  function simulateWhatIf(currentAudit, settings, modifications) {
    // modifications: { acHoursReduction: 2, eliminateVampire: true, ledUpgrade: true, geyserReduction: 0.5 }
    let monthlySavedKwh = 0;

    if (modifications.eliminateVampire) {
      monthlySavedKwh += currentAudit.monthlyStandbyKwh;
    }

    if (modifications.acHoursReduction) {
      // 1.5 kW AC * hours * 30 days
      monthlySavedKwh += (1.4 * modifications.acHoursReduction * DAYS_PER_MONTH);
    }

    if (modifications.geyserReduction) {
      // 2 kW Geyser * hours * 30 days
      monthlySavedKwh += (2.0 * modifications.geyserReduction * DAYS_PER_MONTH);
    }

    if (modifications.ledUpgrade) {
      // Saving ~60W over 8 bulbs for 5 hrs/day
      monthlySavedKwh += (0.06 * 8 * 5 * DAYS_PER_MONTH);
    }

    const newMonthlyKwh = Math.max(0, currentAudit.totalMonthlyKwh - monthlySavedKwh);
    const newBill = computeUtilityBill(newMonthlyKwh, settings);
    const monthlySavingsCost = Math.max(0, currentAudit.totalMonthlyCost - newBill.totalBill);
    const annualSavingsCost = monthlySavingsCost * 12;

    return {
      savedMonthlyKwh: monthlySavedKwh,
      newMonthlyKwh,
      currentMonthlyCost: currentAudit.totalMonthlyCost,
      newMonthlyCost: newBill.totalBill,
      monthlySavingsCost,
      annualSavingsCost,
      percentCut: currentAudit.totalMonthlyCost > 0 ? (monthlySavingsCost / currentAudit.totalMonthlyCost) * 100 : 0
    };
  }

  return {
    calculateApplianceEnergy,
    computeUtilityBill,
    computeHouseholdAudit,
    simulateWhatIf
  };
})();

window.EnergyCalculator = EnergyCalculator;
