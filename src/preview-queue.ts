/** Latest render wins; one read in flight across renders, even after cancellation. */
export class PreviewQueue<T> {
  private pending: T[] = [];
  private generation = 0;
  private running = false;
  constructor(private readonly load: (item: T, current: () => boolean) => Promise<void>) {}
  replace(items: T[]) {
    this.pending = [...items];
    ++this.generation;
    if (!this.running) void this.drain();
  }
  clear() { this.pending = []; ++this.generation; }
  private async drain() {
    this.running = true;
    try {
      while (this.pending.length) {
        const item = this.pending.shift()!;
        const generation = this.generation;
        try { await this.load(item, () => generation === this.generation); }
        catch { /* Deleted, renamed or unreadable files must not block the next preview. */ }
      }
    } finally { this.running = false; }
  }
}
