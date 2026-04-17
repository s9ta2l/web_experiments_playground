// src/experiments/shared/ecgData.js

// Generate a synthetic ECG-like signal
export function generateECG({
  length = 2000,
  bpm = 60,
  sampleRate = 250
} = {}) {
  const data = [];
  const secondsPerBeat = 60 / bpm;
  const samplesPerBeat = Math.floor(secondsPerBeat * sampleRate);

  for (let i = 0; i < length; i++) {
    const t = (i % samplesPerBeat) / samplesPerBeat;

    // --- ECG components (Gaussian bumps) ---
    const p  = gaussian(t, 0.18, 0.025, 0.15);
    const q  = gaussian(t, 0.38, 0.01, -0.15);
    const r  = gaussian(t, 0.40, 0.008, 1.0);
    const s  = gaussian(t, 0.43, 0.01, -0.25);
    const tw = gaussian(t, 0.65, 0.05, 0.35);

    const noise = (Math.random() - 0.5) * 0.03;

    data.push(p + q + r + s + tw + noise);
  }

  return data;
}

function gaussian(x, mu, sigma, amp) {
  return amp * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
}
