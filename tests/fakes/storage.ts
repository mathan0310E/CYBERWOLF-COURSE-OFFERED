/**
 * Minimal in-memory Cloud Storage fake. Only the operations the audit writer
 * uses are implemented: bucket(name).file(path).save/download and
 * bucket(name).getFiles({ prefix }).
 */

interface StoredFile {
  contents: string;
  contentType: string;
}

class FakeFile {
  constructor(
    private readonly store: Map<string, StoredFile>,
    readonly name: string,
  ) {}
  async save(contents: string, options?: { contentType?: string }): Promise<void> {
    // Deterministic path => re-saves are idempotent overwrites.
    this.store.set(this.name, {
      contents,
      contentType: options?.contentType ?? "text/plain",
    });
  }
  async download(): Promise<[Buffer]> {
    const file = this.store.get(this.name);
    if (!file) throw new Error(`No such object: ${this.name}`);
    return [Buffer.from(file.contents, "utf8")];
  }
}

class FakeBucket {
  constructor(private readonly store: Map<string, StoredFile>) {}
  file(path: string): FakeFile {
    return new FakeFile(this.store, path);
  }
  async getFiles(options?: { prefix?: string }): Promise<[FakeFile[]]> {
    const prefix = options?.prefix ?? "";
    const names = [...this.store.keys()].filter((name) => name.startsWith(prefix)).sort();
    return [names.map((name) => new FakeFile(this.store, name))];
  }
}

export class FakeStorage {
  private readonly buckets = new Map<string, Map<string, StoredFile>>();
  private bucketFor(name: string): Map<string, StoredFile> {
    let bucket = this.buckets.get(name);
    if (!bucket) {
      bucket = new Map();
      this.buckets.set(name, bucket);
    }
    return bucket;
  }
  bucket(name: string): FakeBucket {
    return new FakeBucket(this.bucketFor(name));
  }
  /** Test helper: remove all objects (used between tests). */
  reset(): void {
    this.buckets.clear();
  }

  /** Test helper: list every stored object name across all buckets. */
  listObjectNames(): string[] {
    return [...this.buckets.values()].flatMap((bucket) => [...bucket.keys()]);
  }
  /** Test helper: read a stored object's contents. */
  read(bucket: string, path: string): string | undefined {
    return this.bucketFor(bucket).get(path)?.contents;
  }
}
