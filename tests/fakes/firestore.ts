/**
 * Minimal in-memory Firestore fake.
 *
 * This substitutes the *boundary* (the Firestore SDK), never the application
 * logic under test: the real service/router/email/audit code runs unchanged on
 * top of it. It supports only the operations this project uses: collection/doc,
 * get/set/update, runTransaction with get/set/update, and simple
 * where/orderBy/limit queries.
 */

type DocData = Record<string, unknown>;

function clone<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}

function matchesFilter(data: DocData | undefined, field: string, op: string, value: unknown): boolean {
  if (!data) return false;
  const actual = data[field];
  switch (op) {
    case "==":
      return actual === value;
    case "in":
      return Array.isArray(value) && (value as unknown[]).includes(actual);
    case ">=":
      return (actual as number) >= (value as number);
    case "<=":
      return (actual as number) <= (value as number);
    default:
      throw new Error(`Unsupported operator: ${op}`);
  }
}

class FakeDocumentSnapshot {
  constructor(
    readonly id: string,
    private readonly value: DocData | undefined,
    /** Present on query results so callers can update via `doc.ref`. */
    readonly ref?: FakeDocumentRef,
  ) {}
  get exists(): boolean {
    return this.value !== undefined;
  }
  data(): DocData | undefined {
    return this.value === undefined ? undefined : clone(this.value);
  }
}

class FakeQuerySnapshot {
  constructor(readonly docs: FakeDocumentSnapshot[]) {}
  get size(): number {
    return this.docs.length;
  }
}

class FakeDocumentRef {
  constructor(
    private readonly store: Map<string, DocData>,
    private readonly key: string,
    readonly id: string,
  ) {}
  async get(): Promise<FakeDocumentSnapshot> {
    return new FakeDocumentSnapshot(this.id, this.store.get(this.key), this);
  }
  async set(data: DocData, options?: { merge?: boolean }): Promise<void> {
    if (options?.merge && this.store.has(this.key)) {
      this.store.set(this.key, { ...this.store.get(this.key)!, ...clone(data) });
    } else {
      this.store.set(this.key, clone(data));
    }
  }
  async update(data: DocData): Promise<void> {
    const existing = this.store.get(this.key);
    if (!existing) throw new Error(`No document to update: ${this.key}`);
    this.store.set(this.key, { ...existing, ...clone(data) });
  }
}

class FakeQuery {
  private filters: Array<{ field: string; op: string; value: unknown }> = [];
  private order: { field: string; dir: "asc" | "desc" } | null = null;
  private limitCount: number | null = null;

  constructor(protected readonly store: Map<string, DocData>, protected readonly idPrefix: string) {}

  where(field: string, op: string, value: unknown): this {
    this.filters.push({ field, op, value });
    return this;
  }
  orderBy(field: string, dir: "asc" | "desc" = "asc"): this {
    this.order = { field, dir };
    return this;
  }
  limit(count: number): this {
    this.limitCount = count;
    return this;
  }
  async get(): Promise<FakeQuerySnapshot> {
    const entries = [...this.store.entries()].filter(([key]) => key.startsWith(this.idPrefix + "/"));
    let docs = entries.map(([key, data]) => {
      const id = key.slice(this.idPrefix.length + 1);
      return new FakeDocumentSnapshot(id, data, new FakeDocumentRef(this.store, key, id));
    });
    for (const filter of this.filters) {
      docs = docs.filter((d) => matchesFilter(d.data(), filter.field, filter.op, filter.value));
    }
    if (this.order) {
      const { field, dir } = this.order;
      docs.sort((a, b) => {
        const av = a.data()?.[field];
        const bv = b.data()?.[field];
        if (av === bv) return 0;
        const cmp = (av as never) > (bv as never) ? 1 : -1;
        return dir === "asc" ? cmp : -cmp;
      });
    }
    if (this.limitCount !== null) docs = docs.slice(0, this.limitCount);
    return new FakeQuerySnapshot(docs);
  }
}

class FakeCollectionRef extends FakeQuery {
  constructor(store: Map<string, DocData>, private readonly name: string) {
    super(store, name);
  }
  doc(id?: string): FakeDocumentRef {
    const actualId = id ?? `auto-${Math.random().toString(36).slice(2, 12)}`;
    return new FakeDocumentRef(this.store, `${this.name}/${actualId}`, actualId);
  }
}

class FakeTransaction {
  private readonly pendingWrites: Array<() => void> = [];
  constructor(private readonly store: Map<string, DocData>) {}
  async get(ref: FakeDocumentRef | FakeQuery): Promise<FakeDocumentSnapshot | FakeQuerySnapshot> {
    return ref.get();
  }
  set(ref: FakeDocumentRef, data: DocData, options?: { merge?: boolean }): void {
    this.pendingWrites.push(() => void ref.set(data, options));
  }
  update(ref: FakeDocumentRef, data: DocData): void {
    this.pendingWrites.push(() => void ref.update(data));
  }
  /** Apply buffered writes. Firestore transactions commit atomically on success. */
  commit(): void {
    for (const write of this.pendingWrites) write();
    this.pendingWrites.length = 0;
  }
}

export class FakeFirestore {
  private readonly store = new Map<string, DocData>();
  /** Serialises transactions so concurrent writes cannot interleave. */
  private txChain: Promise<unknown> = Promise.resolve();

  collection(name: string): FakeCollectionRef {
    return new FakeCollectionRef(this.store, name);
  }

  /**
   * Run a transaction. Writes are buffered and applied atomically when the
   * handler resolves, and transactions are serialised — mirroring Firestore's
   * concurrency guarantees closely enough to test the audit sequence allocator.
   */
  runTransaction<T>(handler: (tx: FakeTransaction) => Promise<T>): Promise<T> {
    const run = async (): Promise<T> => {
      const tx = new FakeTransaction(this.store);
      const result = await handler(tx);
      tx.commit();
      return result;
    };
    const result = this.txChain.then(run, run);
    this.txChain = result.catch(() => undefined);
    return result;
  }

  settings(): void {
    /* no-op */
  }

  /** Test helper: remove all documents (used between tests). */
  reset(): void {
    this.store.clear();
    this.txChain = Promise.resolve();
  }

  /** Test helper: count documents in a collection. */
  count(collection: string): number {
    return [...this.store.keys()].filter((key) => key.startsWith(collection + "/")).length;
  }

  /** Test helper: read a raw document by collection and id. */
  raw(collection: string, id: string): DocData | undefined {
    return clone(this.store.get(`${collection}/${id}`));
  }

  /** Test helper: all documents in a collection. */
  all(collection: string): DocData[] {
    return [...this.store.entries()]
      .filter(([key]) => key.startsWith(collection + "/"))
      .map(([, data]) => clone(data));
  }
}
