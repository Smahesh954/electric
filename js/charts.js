/**
 * Lightweight Zero-Dependency Canvas & SVG Chart Renderer
 * Provides:
 * - Interactive Donut Chart for energy distribution
 * - Responsive Bar Chart for room/appliance consumption
 * - Real-Time Live Wattage Oscilloscope (smooth animated streaming chart)
 * - Circular Power Gauge Meter
 */

const ChartRenderer = (function() {
  const PALETTE = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#14b8a6', // Teal
    '#6366f1', // Indigo
    '#84cc16'  // Lime
  ];

  /**
   * Render Donut Chart into HTML5 Canvas
   */
  function renderDonut(canvasId, items, currency) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const validItems = items.filter(it => it.value > 0);
    const total = validItems.reduce((acc, it) => acc + it.value, 0);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.78;
    const innerRadius = radius * 0.58;

    if (total === 0) {
      // Draw empty gray ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.arc(centerX, centerY, innerRadius, 2 * Math.PI, 0, true);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No active loads', centerX, centerY);
      return;
    }

    let startAngle = -Math.PI / 2;

    validItems.forEach((item, idx) => {
      const sliceAngle = (item.value / total) * (2 * Math.PI);
      const endAngle = startAngle + sliceAngle;
      const color = item.color || PALETTE[idx % PALETTE.length];

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Subtle border between segments
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Center text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${total.toFixed(1)}`, centerX, centerY - 8);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('kWh / month', centerX, centerY + 14);
  }

  /**
   * Render Horizontal Bar Breakdown Chart
   */
  function renderBarBreakdown(containerId, items, currency) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = '<div class="empty-state">No appliance data to display.</div>';
      return;
    }

    const maxValue = Math.max(...items.map(it => it.value), 0.001);

    let html = '<div class="bar-chart-list">';
    items.forEach((item, idx) => {
      const pct = Math.min(100, (item.value / maxValue) * 100);
      const color = item.color || PALETTE[idx % PALETTE.length];
      html += `
        <div class="bar-chart-row">
          <div class="bar-chart-label-group">
            <span class="bar-chart-name">${item.icon ? item.icon + ' ' : ''}${item.name}</span>
            <span class="bar-chart-val">${item.value.toFixed(1)} kWh <span class="text-muted">(${item.percent ? item.percent.toFixed(1) + '%' : currency + item.cost.toFixed(2)})</span></span>
          </div>
          <div class="bar-chart-track">
            <div class="bar-chart-fill" style="width: ${pct}%; background: ${color};"></div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Live Real-Time Power Telemetry Oscilloscope
   */
  function createLivePowerChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const history = [];
    const maxPoints = 50;

    // Fill initial baseline
    for (let i = 0; i < maxPoints; i++) {
      history.push(0);
    }

    function addPoint(wattage) {
      history.push(wattage);
      if (history.length > maxPoints) {
        history.shift();
      }
      draw();
    }

    function draw() {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Max scale with headroom
      const maxVal = Math.max(3000, Math.max(...history) * 1.25);

      // Draw faint grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let y = 0; y <= 4; y++) {
        const lineY = (height / 4) * y;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(width, lineY);
        ctx.stroke();
      }

      // Draw area gradient
      const stepX = width / (maxPoints - 1);
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.45)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');

      ctx.beginPath();
      ctx.moveTo(0, height);

      history.forEach((val, i) => {
        const x = i * stepX;
        const normalizedY = height - (val / maxVal) * (height - 15);
        if (i === 0) {
          ctx.lineTo(x, normalizedY);
        } else {
          // Smooth curve
          const prevX = (i - 1) * stepX;
          const prevY = height - (history[i - 1] / maxVal) * (height - 15);
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, normalizedY, x, normalizedY);
        }
      });

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw top glowing line
      ctx.beginPath();
      history.forEach((val, i) => {
        const x = i * stepX;
        const normalizedY = height - (val / maxVal) * (height - 15);
        if (i === 0) {
          ctx.moveTo(x, normalizedY);
        } else {
          const prevX = (i - 1) * stepX;
          const prevY = height - (history[i - 1] / maxVal) * (height - 15);
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, normalizedY, x, normalizedY);
        }
      });
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Current pulse dot at the latest point
      const lastVal = history[history.length - 1];
      const lastX = (history.length - 1) * stepX;
      const lastY = height - (lastVal / maxVal) * (height - 15);

      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    return { addPoint, draw };
  }

  /**
   * Draw Circular Power Gauge Meter
   */
  function renderGauge(canvasId, currentWatts, maxCapacityWatts = 6000) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height * 0.72;
    const radius = Math.min(width, height) * 0.44;

    const startAngle = Math.PI * 0.85;
    const endAngle = Math.PI * 2.15;
    const totalSweep = endAngle - startAngle;

    // Background track
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Colored progress arc
    const clampedWatts = Math.min(maxCapacityWatts, Math.max(0, currentWatts));
    const pct = clampedWatts / maxCapacityWatts;
    const currentAngle = startAngle + (totalSweep * pct);

    // Color gradient depending on load
    let arcColor = '#10b981'; // Green < 1500W
    if (clampedWatts > 3500) arcColor = '#ef4444'; // Red
    else if (clampedWatts > 2000) arcColor = '#f59e0b'; // Amber

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
    ctx.strokeStyle = arcColor;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Needle or Center Text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(currentWatts)} W`, centerX, centerY - 12);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(`${(currentWatts / 1000).toFixed(2)} kW Active Load`, centerX, centerY + 18);
  }

  return {
    renderDonut,
    renderBarBreakdown,
    createLivePowerChart,
    renderGauge,
    PALETTE
  };
})();

window.ChartRenderer = ChartRenderer;
