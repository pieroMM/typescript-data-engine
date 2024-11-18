import BTree from "sorted-btree";
import {Collection} from "../../types";

export namespace PrimaryKeyIndexer {

    /**
     * Indexes the primary key of a given record
     *
     * @param record
     * @param collection
     */
    export function indexPrimaryKey<RecordType>(record: RecordType, collection: Collection<RecordType>) {
        const { primaryKey: { name, type } } = collection;
        type KeyType = typeof type extends "string" ? string : number;
        const key = record[name] as KeyType;
        const data = collection.data as BTree<KeyType, RecordType>;
        data.set(key, record);
    }
}
