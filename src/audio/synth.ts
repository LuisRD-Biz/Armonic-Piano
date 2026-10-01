class Synth {
  private context?: AudioContext;
  private master?: GainNode;
  private voices = new Map<number, { oscillator: OscillatorNode; gain: GainNode }>();
  private sequence = 0;
  private noteTokens = new Map<number, number>();
  volume = 0.45;
  async unlock() {
    this.context ??= new AudioContext();
    if (!this.master) {
      this.master = this.context.createGain();
      this.master.gain.value = this.volume * 0.22;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') await this.context.resume();
  }
  setVolume(value: number) {
    this.volume = value;
    if (this.context && this.master)
      this.master.gain.setTargetAtTime(value * 0.22, this.context.currentTime, 0.02);
  }
  async on(note: number, velocity = 90) {
    this.off(note);
    const token = (this.noteTokens.get(note) ?? 0) + 1,
      generation = this.sequence;
    this.noteTokens.set(note, token);
    await this.unlock();
    if (this.noteTokens.get(note) !== token || generation !== this.sequence) return;
    const ctx = this.context!;
    const oscillator = ctx.createOscillator(),
      gain = ctx.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 440 * 2 ** ((note - 69) / 12);
    const time = ctx.currentTime;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(velocity / 127, time + 0.012);
    gain.gain.exponentialRampToValueAtTime((0.26 * velocity) / 127, time + 0.65);
    oscillator.connect(gain);
    gain.connect(this.master!);
    oscillator.start();
    this.voices.set(note, { oscillator, gain });
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
  off(note: number) {
    this.noteTokens.set(note, (this.noteTokens.get(note) ?? 0) + 1);
    const entry = this.voices.get(note);
    if (!entry || !this.context) return;
    entry.gain.gain.cancelScheduledValues(this.context.currentTime);
    entry.gain.gain.setTargetAtTime(0.0001, this.context.currentTime, 0.08);
    entry.oscillator.stop(this.context.currentTime + 0.4);
    this.voices.delete(note);
  }
  stop() {
    this.sequence++;
    [...this.voices.keys()].forEach((n) => this.off(n));
  }
  async chord(notes: number[], duration = 850) {
    this.stop();
    const token = this.sequence;
    await this.unlock();
    if (token !== this.sequence) return;
    await Promise.all(notes.map((n) => this.on(n)));
    setTimeout(() => {
      if (token === this.sequence) notes.forEach((n) => this.off(n));
    }, duration);
  }
  async progression(chords: number[][], onStep: (index: number) => void, done: () => void) {
    this.stop();
    const token = this.sequence;
    await this.unlock();
    for (let i = 0; i < chords.length; i++) {
      if (token !== this.sequence) return;
      onStep(i);
      await Promise.all(chords[i].map((n) => this.on(n)));
      await new Promise((resolve) => setTimeout(resolve, 750));
      if (token !== this.sequence) return;
      chords[i].forEach((n) => this.off(n));
      await new Promise((resolve) => setTimeout(resolve, 180));
    }
    if (token === this.sequence) done();
  }
}
export const synth = new Synth();
