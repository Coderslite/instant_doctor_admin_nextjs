const cache = new Map();

export async function fetchWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    cacheTime = 300000 // 5 minutes cache
): Promise<T> {
    if (cache.has(key)) {
        const { data, timestamp } = cache.get(key);
        if (Date.now() - timestamp < cacheTime) {
            return data;
        }
    }

    const data = await fetchFn();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
}

export function getCacheKeys() {
    return Array.from(cache.keys());
}

export function clearCache(key?: string) {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
}