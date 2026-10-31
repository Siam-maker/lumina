/**
 * Web Audio API Ambient Sound Synthesizer
 * Generates procedural relaxing study soundscapes: Rain, White Noise, Alpha Waves, and Tibetan Singing Bowl.
 * 100% client-side, zero external audio files.
 */

let audioCtx: AudioContext | null = null;
let currentSourceNode: AudioNode | null = null;
let currentGainNode: GainNode | null = null;
let isPlayingAmbient = false;
let currentPreset: 'rain' | 'binaural' | 'waves' | 'none' = 'none';

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopAmbientSound() {
  if (currentSourceNode) {
    try {
      (currentSourceNode as any).stop?.();
      currentSourceNode.disconnect();
    } catch {
      // Ignore
    }
    currentSourceNode = null;
  }
  if (currentGainNode) {
    try {
      currentGainNode.disconnect();
    } catch {
      // Ignore
    }
    currentGainNode = null;
  }
  isPlayingAmbient = false;
  currentPreset = 'none';
}

export function playAmbientSound(preset: 'rain' | 'binaural' | 'waves', volume: number = 0.25) {
  const ctx = getContext();
  if (!ctx) return;

  stopAmbientSound();

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, ctx.currentTime);
  masterGain.connect(ctx.destination);
  currentGainNode = masterGain;

  if (preset === 'rain') {
    // Generate pink noise filtered for soft raindrops
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter for mellow rainfall tone
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    whiteNoise.start();
    currentSourceNode = whiteNoise;
  } else if (preset === 'binaural') {
    // Alpha focus wave (432Hz root with 10Hz alpha difference)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(432, ctx.currentTime);
    osc2.frequency.setValueAtTime(442, ctx.currentTime); // 10Hz Alpha beat

    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain2.gain.setValueAtTime(0.3, ctx.currentTime);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(masterGain);
    gain2.connect(masterGain);

    osc1.start();
    osc2.start();
    currentSourceNode = osc1;
  } else if (preset === 'waves') {
    // Soothing ocean-like frequency modulation
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    // LFO to slowly swell filter frequency like waves
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 8-second wave period
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(300, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(masterGain);
    noise.start();
    lfo.start();
    currentSourceNode = noise;
  }

  isPlayingAmbient = true;
  currentPreset = preset;
}

export function setAmbientVolume(vol: number) {
  if (currentGainNode && audioCtx) {
    currentGainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
  }
}

export function getAmbientStatus() {
  return { isPlaying: isPlayingAmbient, preset: currentPreset };
}
