import { randomBytes } from 'node:crypto';

import { APP_CONFIG } from '../config';
import { CreateShareResultRequest, PublicShareResultV1, SharedResultRecordV1 } from '../types';
import { isSharedResultRecordV1, isValidShareId } from './validation';

const SHARE_KEY_PREFIX = 'share:result:';
const SHARE_VIEWS_KEY_PREFIX = 'share:views:';
const ID_ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export interface SharedResultStore {
  create(input: CreateShareResultRequest): Promise<SharedResultRecordV1>;
  getById(id: string): Promise<SharedResultRecordV1 | null>;
  incrementViews(id: string): Promise<void>;
}

function buildRecordKey(id: string) {
  return `${SHARE_KEY_PREFIX}${id}`;
}

function buildViewsKey(id: string) {
  return `${SHARE_VIEWS_KEY_PREFIX}${id}`;
}

function createShareId(length = 11) {
  const bytes = randomBytes(length);
  let value = '';

  for (let i = 0; i < bytes.length; i += 1) {
    value += ID_ALPHABET[bytes[i] % ID_ALPHABET.length];
  }

  return value;
}

function nowIso() {
  return new Date().toISOString();
}

function withExpiry(createdAtIso: string, ttlSeconds: number) {
  if (ttlSeconds <= 0) return undefined;

  const expiresAt = new Date(new Date(createdAtIso).getTime() + (ttlSeconds * 1000));
  return expiresAt.toISOString();
}

function toPublicPayload(record: SharedResultRecordV1): PublicShareResultV1 {
  return {
    version: record.version,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
    originalText: record.originalText,
    result: record.result,
  };
}

class InMemorySharedResultStore implements SharedResultStore {
  private readonly records = new Map<string, SharedResultRecordV1>();

  async create(input: CreateShareResultRequest): Promise<SharedResultRecordV1> {
    const createdAt = nowIso();
    const id = createShareId();
    const expiresAt = withExpiry(createdAt, APP_CONFIG.share.ttlSeconds);

    const record: SharedResultRecordV1 = {
      id,
      version: 1,
      createdAt,
      expiresAt,
      originalText: input.originalText.trim(),
      result: input.result,
      mode: input.mode,
      metadata: {
        views: 0,
      },
    };

    this.records.set(id, record);
    return record;
  }

  async getById(id: string): Promise<SharedResultRecordV1 | null> {
    const record = this.records.get(id);
    if (!record) return null;

    if (record.expiresAt && Date.parse(record.expiresAt) <= Date.now()) {
      this.records.delete(id);
      return null;
    }

    return record;
  }

  async incrementViews(id: string): Promise<void> {
    const record = this.records.get(id);
    if (!record) return;

    record.metadata.views += 1;
    record.metadata.lastViewedAt = nowIso();
    this.records.set(id, record);
  }
}

class VercelKvRestClient {
  constructor(private readonly url: string, private readonly token: string) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T | null> {
    const response = await fetch(`${this.url}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`KV request failed with status ${response.status}.`);
    }

    const payload = await response.json() as { result?: T | string | null };
    if (typeof payload.result === 'string') {
      try {
        return JSON.parse(payload.result) as T;
      } catch {
        return payload.result as T;
      }
    }

    return payload.result ?? null;
  }

  async get<T>(key: string): Promise<T | null> {
    return this.request<T>(`/get/${encodeURIComponent(key)}`);
  }

  async set(key: string, value: unknown, ex: number) {
    const encodedValue = encodeURIComponent(JSON.stringify(value));
    await this.request(`/set/${encodeURIComponent(key)}/${encodedValue}?EX=${ex}`);
  }

  async incr(key: string): Promise<number | null> {
    return this.request<number>(`/incr/${encodeURIComponent(key)}`);
  }
}

class VercelKVSharedResultStore implements SharedResultStore {
  constructor(private readonly client: VercelKvRestClient) {}

  async create(input: CreateShareResultRequest): Promise<SharedResultRecordV1> {
    const createdAt = nowIso();
    const ttlSeconds = APP_CONFIG.share.ttlSeconds;

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const id = createShareId();
      const key = buildRecordKey(id);
      const existing = await this.client.get(key);

      if (existing) continue;

      const record: SharedResultRecordV1 = {
        id,
        version: 1,
        createdAt,
        expiresAt: withExpiry(createdAt, ttlSeconds),
        originalText: input.originalText.trim(),
        result: input.result,
        mode: input.mode,
        metadata: {
          views: 0,
        },
      };

      await this.client.set(key, record, ttlSeconds);
      await this.client.set(buildViewsKey(id), 0, ttlSeconds);
      return record;
    }

    throw new Error('Unable to allocate a unique share id.');
  }

  async getById(id: string): Promise<SharedResultRecordV1 | null> {
    const raw = await this.client.get<unknown>(buildRecordKey(id));
    if (!isSharedResultRecordV1(raw)) {
      return null;
    }

    const views = await this.client.get<number>(buildViewsKey(id));

    return {
      ...raw,
      metadata: {
        ...raw.metadata,
        views: typeof views === 'number' ? views : raw.metadata.views,
      },
    };
  }

  async incrementViews(id: string): Promise<void> {
    const record = await this.client.get<unknown>(buildRecordKey(id));
    if (!isSharedResultRecordV1(record)) return;

    await this.client.incr(buildViewsKey(id));

    const ttlSeconds = APP_CONFIG.share.ttlSeconds;
    const nextRecord: SharedResultRecordV1 = {
      ...record,
      metadata: {
        ...record.metadata,
        views: record.metadata.views + 1,
        lastViewedAt: nowIso(),
      },
    };

    await this.client.set(buildRecordKey(id), nextRecord, ttlSeconds);
  }
}

let sharedStore: SharedResultStore | null = null;

function createVercelClient() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new VercelKvRestClient(url, token);
}

export function getSharedResultStore() {
  if (sharedStore) return sharedStore;

  const client = createVercelClient();
  if (client) {
    sharedStore = new VercelKVSharedResultStore(client);
    return sharedStore;
  }

  sharedStore = new InMemorySharedResultStore();
  return sharedStore;
}

export function toPublicShareResult(record: SharedResultRecordV1): PublicShareResultV1 {
  return toPublicPayload(record);
}

export function sanitizeShareId(input: string) {
  return isValidShareId(input) ? input : null;
}
