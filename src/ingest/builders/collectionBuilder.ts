import {CollectionBuilderInput, Collection, Index } from "../../types";
import BTree from "sorted-btree";
import {IndexBuilder} from "./indexBuilder";

export namespace CollectionBuilder {

    /**
     * Builds a new collection
     *
     * @param input
     */
    export function build<RecordType>(input: CollectionBuilderInput<RecordType>): Collection<RecordType> {
        const { name, schema, primaryKey, indexes: indexDescriptors } = input;
        type KeyType = typeof primaryKey.type extends "string" ? string : number;
        const data = new BTree<KeyType, RecordType>();
        if (indexDescriptors?.length) {
            const entries = indexDescriptors.map(descriptor => [descriptor.column.name, IndexBuilder.build(descriptor, schema, primaryKey)]);
            const indexes = Object.fromEntries(entries) as Record<keyof RecordType, Index<RecordType>>;
            return { name, schema, data, primaryKey, indexes };
        } else {
            return { name, schema, data, primaryKey };
        }
    }
}


