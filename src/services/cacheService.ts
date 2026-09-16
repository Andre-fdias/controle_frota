import type { RawDataPayload, RelationshipResult } from './relationshipService';

const CACHE_KEY = 'controle_frota_cache_v1';

export interface CacheData {
  lastUpdate: string;
  rawData: RawDataPayload;
  relationshipResult: RelationshipResult;
}

export function saveToCache(rawData: RawDataPayload, relationshipResult: RelationshipResult): void {
  try {
    const data: CacheData = {
      lastUpdate: new Date().toISOString(),
      rawData,
      relationshipResult
    };
    
    // We need to serialize Maps which are in relationshipResult.vehicles
    const serializedResult = {
      ...relationshipResult,
      vehicles: Array.from(relationshipResult.vehicles.entries())
    };
    
    const serializedData = {
      ...data,
      relationshipResult: serializedResult
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(serializedData));
  } catch (error) {
    console.error('Failed to save to cache', error);
  }
}

export function loadFromCache(): CacheData | null {
  try {
    const cachedString = localStorage.getItem(CACHE_KEY);
    if (!cachedString) return null;

    const parsedData = JSON.parse(cachedString);
    
    // Deserialize Map
    const vehiclesMap = new Map(parsedData.relationshipResult.vehicles);
    
    return {
      lastUpdate: parsedData.lastUpdate,
      rawData: parsedData.rawData,
      relationshipResult: {
        ...parsedData.relationshipResult,
        vehicles: vehiclesMap
      }
    };
  } catch (error) {
    console.error('Failed to load from cache', error);
    return null;
  }
}

export function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
