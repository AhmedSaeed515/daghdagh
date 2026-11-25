// Sound effects (WebAudio tones). Muted through store key 'sound'.
class Sound {
  constructor(store) {
    this.store = store; this.ctx = null;
    ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, () => this.actx(), { passive: true }));
  }
  actx() { try { this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state !== 'running') this.ctx.resume(); } catch (e) {} return this.ctx; }
  tone(f, t0, d, type, vol, f2) { try { if (!this.store.get('sound', true)) return; const c = this.actx(); if (!c) return; const o = c.createOscillator(), g = c.createGain(); const t = c.currentTime + t0; o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.25, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.03); } catch (e) {} }
  beep(f, d = 0.12, type = 'sine') { this.tone(f, 0, d, type, 0.25); }
  tap() { this.tone(520, 0, 0.06, 'triangle', 0.18, 380); }
  tick() { this.tone(880, 0, 0.04, 'square', 0.08); }
  ok() { this.tone(660, 0, 0.12, 'triangle', 0.3); this.tone(880, 0.1, 0.12, 'triangle', 0.3); this.tone(1175, 0.2, 0.22, 'triangle', 0.3); window.burst && window.burst(14); }
  bad() { this.tone(220, 0, 0.18, 'sawtooth', 0.22, 150); this.tone(150, 0.16, 0.28, 'sawtooth', 0.22, 90); window.shake && window.shake(); }
  round() { this.tone(523, 0, 0.14, 'sine', 0.28); this.tone(659, 0.14, 0.14, 'sine', 0.28); this.tone(784, 0.28, 0.3, 'sine', 0.28); }
  win() { [523, 659, 784, 1047].forEach((f, k) => this.tone(f, k * 0.13, 0.2, 'triangle', 0.3)); this.tone(1047, 0.55, 0.5, 'triangle', 0.3); this.tone(1319, 0.55, 0.5, 'sine', 0.2); }
}
const sfx = new Sound(store);
