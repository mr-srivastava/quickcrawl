interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheService<K extends string, V> {
  private cache = new Map<K, CacheEntry<V>>();
  private order: K[] = [];

  constructor(
    private readonly ttlMs: number,
    private readonly maxSize: number = 100,
  ) {}

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: K, value: V): void {
    if (!this.cache.has(key) && this.order.length >= this.maxSize) {
      const oldest = this.order.shift();
      if (oldest != null) this.cache.delete(oldest);
    }
    const expiresAt = Date.now() + this.ttlMs;
    this.cache.set(key, { value, expiresAt });
    const idx = this.order.indexOf(key);
    if (idx !== -1) this.order.splice(idx, 1);
    this.order.push(key);
  }

  delete(key: K): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      const idx = this.order.indexOf(key);
      if (idx !== -1) this.order.splice(idx, 1);
    }
    return deleted;
  }
}
