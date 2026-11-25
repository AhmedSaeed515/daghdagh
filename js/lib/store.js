// localStorage wrapper. The key prefix stays 'lo3ba_' so saved profiles keep working.
class Store {
  constructor(prefix) { this.prefix = prefix; }
  get(k, d) { try { const v = localStorage.getItem(this.prefix + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  set(k, v) { try { localStorage.setItem(this.prefix + k, JSON.stringify(v)); } catch (e) {} }
}
const store = new Store('lo3ba_');
