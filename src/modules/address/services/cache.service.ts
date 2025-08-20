// src/modules/address/services/cache.service.ts
import { Injectable } from '@nestjs/common';

interface CacheEntry {
  valid: boolean;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private ttl = 5 * 60 * 1000; // 5 minutos

  get(key: string): boolean | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.valid;
  }

  set(key: string, value: boolean) {
    this.cache.set(key, { valid: value, expiresAt: Date.now() + this.ttl });
  }
}
