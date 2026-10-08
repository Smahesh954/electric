/**
 * Real-Time Telemetry & Smart Meter Simulator
 * Simulates real-time household power draw fluctuations, compressor cycling,
 * and high-demand spikes with interactive controls.
 */

const PowerSimulator = (function() {
  let isRunning = false;
  let timerId = null;
  let listeners = [];
  let baseWatts = 1200;
  let currentSimulatedWatts = 1200;
  let spikeWatts = 0;
  let spikeTimeout = null;

  function setBaseWattage(watts) {
    baseWatts = Math.max(0, watts);
  }

  function subscribe(callback) {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter(cb => cb !== callback);
    };
  }

  function notify(data) {
    listeners.forEach(cb => {
      try {
        cb(data);
      } catch (e) {
        console.error('Simulator listener error:', e);
      }
    });
  }

  function tick() {
    if (!isRunning) return;

    // Realistic micro-jitter between -4% and +4%
    const jitterFactor = 1.0 + (Math.random() * 0.08 - 0.04);
    // Occasional compressor cycling fluctuation (+/- 80W)
    const cycleNoise = Math.sin(Date.now() / 5000) * 60;

    let targetWatts = (baseWatts * jitterFactor) + cycleNoise + spikeWatts;
    targetWatts = Math.max(15, Math.round(targetWatts));

    // Smooth transition
    currentSimulatedWatts = Math.round(currentSimulatedWatts * 0.4 + targetWatts * 0.6);

    notify({
      watts: currentSimulatedWatts,
      kw: (currentSimulatedWatts / 1000).toFixed(2),
      isSpiking: spikeWatts > 0,
      timestamp: new Date()
    });
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    timerId = setInterval(tick, 1500);
    tick(); // immediate first tick
  }

  function stop() {
    isRunning = false;
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function toggle() {
    if (isRunning) stop();
    else start();
    return isRunning;
  }

  /**
   * Simulate sudden spike (e.g., turning on microwave + electric kettle)
   */
  function triggerSpike(extraWatts = 1800, durationMs = 8000) {
    if (spikeTimeout) clearTimeout(spikeTimeout);
    spikeWatts = extraWatts;
    tick();

    spikeTimeout = setTimeout(() => {
      spikeWatts = 0;
      tick();
    }, durationMs);

    return extraWatts;
  }

  function getCurrentWatts() {
    return currentSimulatedWatts;
  }

  function getStatus() {
    return isRunning;
  }

  return {
    start,
    stop,
    toggle,
    setBaseWattage,
    triggerSpike,
    subscribe,
    getCurrentWatts,
    getStatus
  };
})();

window.PowerSimulator = PowerSimulator;
