import BTree from "sorted-btree";
import {Collection} from "../../types";

export namespace Indexer {

    /**
     * Indexes a record of a given collection picking the value of a specific column
     *
     * @param record
     * @param indexColumnName
     * @param collection
     */
    export function indexRecord<RecordType>(record: RecordType, indexColumnName: keyof RecordType, collection: Collection<RecordType>) {
        if (!collection.indexes) {
            return;
        }
        const index = collection.indexes[indexColumnName];
        if (!index) {
            throw Error();
        } else {
            type KeyType = typeof index.descriptor.property.type extends "string" ? string : number;
            type PrimaryKeyType = typeof collection.primaryKey.type extends "string" ? string : number;
            const primaryKeyPropertyName = collection.primaryKey.name;
            const primaryKeyValue = record[primaryKeyPropertyName] as PrimaryKeyType;
            const key = record[indexColumnName] as KeyType;
            if (index.descriptor.isUnique) {
                const data = index.data as BTree<KeyType, PrimaryKeyType>;
                data.set(key, primaryKeyValue);
            } else {
                const data = index.data as BTree<KeyType, PrimaryKeyType[]>;
                data.set(key, (data.get(key) ?? []).concat(primaryKeyValue), true);
            }
        }
    }
}



