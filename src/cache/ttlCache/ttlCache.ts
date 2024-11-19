import {LinkedListQueue} from 'data-structure-typed';

export class TtlCache<K, V> {

    private readonly records: Map<K, V> = new Map();
    private readonly timestamps: LinkedListQueue<[number, K]> = new LinkedListQueue();

    /**
     *
     * @param defaultTtl in seconds
     */
    constructor(public readonly defaultTtl: number = -1) {
    }

    /**
     *
     * @param key
     * @param value
     * @param elapse
     */
    set(key: K, value: V, elapse: { ttl: number, startingTs: number } = { ttl: this.defaultTtl, startingTs: new Date().valueOf()}) {
        const {ttl, startingTs} = elapse;
        this.records.set(key, value);
        if (ttl !== -1) {
            const elapseTimestamp = startingTs + (ttl * 1000);
            this.timestamps.push([elapseTimestamp, key]);
        }
    }

    has(key: K): boolean {
        return this.records.has(key);
    }

    get(key: K): V | undefined {
        return this.records.get(key);
    }

    get size(): number {
        return this.records.size;
    }

    removeExpiredEntries(expirationTimestamp: number): number {
        let removed = 0;
        let cursor = this.timestamps.head?.value;
        while (cursor && cursor[0] <= expirationTimestamp) {
            this.timestamps.shift();
            this.records.delete(cursor[1]);
            removed++;
            cursor = this.timestamps.head?.value;
        }
        return removed
    }
}
