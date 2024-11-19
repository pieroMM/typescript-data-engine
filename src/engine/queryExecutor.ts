import {Collection, QueryDescriptor, Index, FilterDescriptor} from "../types";
import BTree from "sorted-btree";
import {TtlCache} from "../cache";

export namespace QueryExecutor {
    /**
     * Checks whether a specific filter column is primary key for a given collection
     *
     * @param filterColumnName
     * @param collection
     * @private
     */
    export function isPrimaryKeyFilter<RecordType>(filterColumnName: keyof RecordType, collection: Collection<RecordType>): boolean {
        return collection.primaryKey.name === filterColumnName;
    }

    /**
     * Checks whether a specific filter column is an index for a given collection
     *
     * @param filterColumnName
     * @param collection
     * @private
     */
    export function isIndexFilter<RecordType>(filterColumnName: keyof RecordType, collection: Collection<RecordType>): boolean {
        return collection.indexes ? Object.keys(collection.indexes).includes(filterColumnName.toString()) : false;
    }

    /**
     * Returns by column name (if exits) an index for a given collection
     *
     * @param filterColumnName
     * @param collection
     * @private
     */
    export function getIndex<RecordType>(filterColumnName: string, collection: Collection<RecordType>): Index<RecordType> | undefined {
        return collection.indexes ? collection.indexes[filterColumnName as keyof RecordType] : undefined;
    }

    /**
     * Performs the column projection for a given record
     *
     * @param record
     * @param columns
     * @private
     */
    export function projectColumns<RecordType>(record: RecordType, ...columns: (keyof RecordType)[]): Partial<RecordType> {
        const result: Partial<RecordType> = {};
        for (let column of columns) {
            result[column] = record[column];
        }
        return result;
    }

    /**
     *
     * @param records
     * @param key
     * @param cache
     * @private
     */
    function getAndHandleCache<PrimaryKeyType, RecordType>(records: BTree<PrimaryKeyType, RecordType>, key: PrimaryKeyType, cache?: TtlCache<PrimaryKeyType, RecordType>): RecordType | undefined {
        if (!!cache) {
            if (cache.has(key)) {
                return cache.get(key);
            } else {
                let value = records.get(key);
                if (value) {
                    cache.set(key, value);
                    return value;
                }
            }
        } else {
            return records.get(key);
        }
    }

    /**
     * Applies a filter based on the primary key of a given collection and project a list of columns
     *
     * @param filter
     * @param collection
     * @param project
     * @param recordsCache
     * @private
     */
    export function applyFilterOnPrimaryKey<RecordType>(filter: FilterDescriptor<RecordType>, collection: Collection<RecordType>, project?: (keyof RecordType)[], recordsCache?: TtlCache<unknown, RecordType>): Partial<RecordType>[] {
        type PrimaryKeyType = typeof collection.primaryKey.type extends "string" ? string : number;
        const {comparator} = filter;
        const value = filter.value as PrimaryKeyType
        const data = collection.data as BTree<PrimaryKeyType, RecordType>;
        const result: Partial<RecordType>[] = [];
        if (comparator === "eq") {
            // HERE
            const record = getAndHandleCache<PrimaryKeyType, RecordType>(data, value, recordsCache as TtlCache<PrimaryKeyType, RecordType>);
            if (record) {
                result.push(project ? projectColumns(record, ...project) : record);
            }
        } else if (comparator === "lt") {
            let lowerKey = data.nextLowerKey(value);
            while (lowerKey) {
                const record = getAndHandleCache<PrimaryKeyType, RecordType>(data, lowerKey, recordsCache as TtlCache<PrimaryKeyType, RecordType>);
                if (record) {
                    result.push(project ? projectColumns(record, ...project) : record);
                }
                lowerKey = data.nextLowerKey(lowerKey);
            }
        } else if (comparator === "gt") {
            let higherKey = data.nextHigherKey(value);
            while (higherKey) {
                const record = getAndHandleCache<PrimaryKeyType, RecordType>(data, higherKey, recordsCache as TtlCache<PrimaryKeyType, RecordType>);
                if (record) {
                    result.push(project ? projectColumns(record, ...project) : record);
                }
                higherKey = data.nextHigherKey(higherKey);
            }
        }
        return result;
    }

    /**
     * Applies a filter based on an index of a given collection and project a list of columns
     *
     * @param filter
     * @param index
     * @param collection
     * @param project
     * @param recordsCache
     * @private
     */
    export function applyFilterOnIndex<RecordType>(filter: FilterDescriptor<RecordType>, index: Index<RecordType>, collection: Collection<RecordType>, project?: (keyof RecordType)[], recordsCache?: TtlCache<unknown, RecordType>): Partial<RecordType>[] {
        const {primaryKey} = collection;
        const {data: indexData} = index;
        const {comparator, value} = filter;
        const uniqueIndex = index.descriptor.isUnique;
        type IndexType = typeof index.descriptor.type extends "string" ? string : number;
        type PrimaryKeyType = typeof primaryKey.type extends "string" ? string : number;
        const primaryKeyData = collection.data as BTree<PrimaryKeyType, RecordType>;
        const result: Partial<RecordType>[] = [];
        if (comparator === "eq") {
            if (uniqueIndex) {
                const relatedKey = (indexData as BTree<IndexType, PrimaryKeyType>).get(value);
                if (relatedKey) {
                    const record = getAndHandleCache<PrimaryKeyType, RecordType>(primaryKeyData, relatedKey, recordsCache as TtlCache<PrimaryKeyType, RecordType>);
                    if (record) {
                        result.push(project ? projectColumns(record, ...project) : record);
                    }
                }
            } else {
                const relatedKeys = (indexData as BTree<IndexType, PrimaryKeyType[]>).get(value) ?? [];
                for (let key of relatedKeys) {
                    const record = getAndHandleCache<PrimaryKeyType, RecordType>(primaryKeyData, key, recordsCache as TtlCache<PrimaryKeyType, RecordType>);
                    if (record) {
                        result.push(project ? projectColumns(record, ...project) : record);
                    }
                }
            }
        } else if (comparator === "lt") {
            if (uniqueIndex) {
                const data = indexData as BTree<IndexType, PrimaryKeyType>;
                let lowerKey = data.nextLowerKey(value);
                while (lowerKey) {
                    const key = data.get(lowerKey);
                    const record = getAndHandleCache<PrimaryKeyType, RecordType>(primaryKeyData, lowerKey, recordsCache as TtlCache<PrimaryKeyType, RecordType>);
                    if (record) {
                        result.push(project ? projectColumns(record, ...project) : record);
                    }
                    lowerKey = data.nextLowerKey(lowerKey);
                }
            } else {
                const data = indexData as BTree<IndexType, PrimaryKeyType[]>;
                let lowerKey = data.nextLowerKey(value);
                while (lowerKey) {
                    const keys = data.get(lowerKey);
                    for (let key of keys ?? []) {
                        const record = getAndHandleCache<PrimaryKeyType, RecordType>(primaryKeyData, key, recordsCache as TtlCache<PrimaryKeyType, RecordType>);
                        if (record) {
                            result.push(project ? projectColumns(record, ...project) : record);
                        }
                    }
                    lowerKey = data.nextLowerKey(lowerKey);
                }
            }
        } else if (comparator === "gt") {
            if (uniqueIndex) {
                const data = indexData as BTree<IndexType, PrimaryKeyType>;
                let higherKey = data.nextHigherKey(value);
                while (higherKey) {
                    const key = data.get(higherKey);
                    const record= getAndHandleCache<PrimaryKeyType, RecordType>(primaryKeyData, higherKey, recordsCache as TtlCache<PrimaryKeyType, RecordType>);
                    if (record) {
                        result.push(project ? projectColumns(record, ...project) : record);
                    }
                    higherKey = data.nextHigherKey(higherKey);
                }
            } else {
                const data = indexData as BTree<IndexType, PrimaryKeyType[]>;
                let higherKey = data.nextHigherKey(value);
                while (higherKey) {
                    const keys = data.get(higherKey);
                    for (let key of keys ?? []) {
                        const record = getAndHandleCache<PrimaryKeyType, RecordType>(primaryKeyData, key, recordsCache as TtlCache<PrimaryKeyType, RecordType>);
                        if (record) {
                            result.push(project ? projectColumns(record, ...project) : record);
                        }
                    }
                    higherKey = data.nextHigherKey(higherKey);
                }
            }
        }
        return result;
    }

    /**
     * Applies a filter with no index or primary key and project a list of columns
     *
     * @param filter
     * @param collection
     * @param project
     * @private
     */
    export function applyFilterWithNoIndexes<RecordType>(filter: FilterDescriptor<RecordType>, collection: Collection<RecordType>, project?: (keyof RecordType)[]): Partial<RecordType>[] {
        const {data, primaryKey} = collection;
        const {value, comparator, columnName} = filter;
        type PrimaryKeyType = typeof primaryKey.type extends "string" ? string : number;
        const result: Partial<RecordType>[] = [];
        (data as BTree<PrimaryKeyType, RecordType>).forEach((record: RecordType, _: PrimaryKeyType) => {
            if (comparator === "eq" && record[columnName] === value) {
                result.push(project ? projectColumns(record, ...project) : record);
            }
            if (comparator === "lt" && record[columnName] < value) {
                    result.push(project ? projectColumns(record, ...project) : record);
            }
            if (comparator === "gt" && record[columnName] > value) {
                    result.push(project ? projectColumns(record, ...project) : record);
            }
        });
        return result;
    }

    /**
     *  Executes a query on a given collection
     *
     * @param queryDescriptor
     * @param collection
     * @param recordsCache
     */
    export function executeQuery<RecordType>(queryDescriptor: QueryDescriptor<RecordType>, collection: Collection<RecordType>, recordsCache?: TtlCache<unknown, RecordType>): Partial<RecordType>[] {
        const {project, filter} = queryDescriptor;
        if (filter) {
            const {columnName} = filter;
            if (isPrimaryKeyFilter(columnName, collection)) {
                return applyFilterOnPrimaryKey(filter, collection, project, recordsCache);
            } else if (isIndexFilter(columnName, collection)) {
                const index = getIndex(columnName.toString(), collection);
                if (index) {
                    return applyFilterOnIndex(filter, index, collection, project, recordsCache);
                }
                throw Error("Index definition mismatch")
            } else {
                return applyFilterWithNoIndexes(filter, collection, project);
            }
        } else {
            const result: Partial<RecordType>[] = [];
            const {data, primaryKey} = collection;
            type PrimaryKeyType = typeof primaryKey.type extends "string" ? string : number;
            (data as BTree<PrimaryKeyType, RecordType>).forEach((record: RecordType, _: PrimaryKeyType) => {
                result.push(project ? projectColumns(record, ...project) : record);
            });
            return result;
        }
    }
}
