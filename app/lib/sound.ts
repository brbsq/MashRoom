export function chime() {
  try {
    if (localStorage.getItem("mashroom:sound") !== "true") return;
    const a = new AudioContext(),
      o = a.createOscillator(),
      g = a.createGain();
    o.connect(g);
    g.connect(a.destination);
    o.frequency.value = 660;
    g.gain.setValueAtTime(0.045, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.22);
    o.start();
    o.stop(a.currentTime + 0.22);
    o.onended = () => void a.close();
  } catch {
    /* Audio is optional; unavailable output never blocks an action. */
  }
}
