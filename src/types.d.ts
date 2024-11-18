import {JSONSchema as JSONSchemaLib} from "json-schema-to-ts";
import BTree from "sorted-btree";
import {INDEXABLE_TYPES} from "./constants/indexableTypes";


export type JSONSchema = Exclude<JSONSchemaLib, boolean>;

export type IndexableTypes = typeof INDEXABLE_TYPES[number];

export type Indexable<RecordType, Type extends IndexableTypes = IndexableTypes> = {
    name: keyof RecordType,
    type: Type
}

export type CollectionBuilderInput<RecordType> = {
    name: string,
    schema: JSONSchema,
    primaryKey: Indexable<RecordType>,
    indexes?: IndexDescriptor<RecordType>[]
}

export type Collection<RecordType> = {
    name: string,
    schema: JSONSchema,
    primaryKey: Indexable<RecordType>,
    data: BTree<number, RecordType> | BTree<string, RecordType>,
    indexes?: Partial<Record<keyof RecordType, Index<RecordType>>>
}

export type Index<RecordType> =
    { descriptor: IndexDescriptor<RecordType, "string", true>, data: BTree<string, string | number> }
    | { descriptor: IndexDescriptor<RecordType, "string", false>, data: BTree<string, string[] | number[]> }
    | { descriptor: IndexDescriptor<RecordType, "number", true>, data: BTree<number, string | number> }
    | { descriptor: IndexDescriptor<RecordType, "number", false>, data: BTree<number, string[] | number[]> }
    | { descriptor: IndexDescriptor<RecordType, "integer", true>, data: BTree<number, string | number> }
    | { descriptor: IndexDescriptor<RecordType, "integer", false>, data: BTree<number, string[] | number[]> }

export type IndexDescriptor<RecordType, Unique extends boolean = boolean> = {
    column: Indexable<RecordType>,
    isUnique: Unique
}

export type IndexValidity = {
    isValid: boolean,
    errors: string[]
}

export type FilterDescriptor<RecordType> = {
    comparator: "gt" | "lt" | "eq",
    columnName: keyof RecordType,
    value: number | string
}

export type QueryDescriptor<RecordType> = {
    project?: (keyof RecordType)[],
    filter?: FilterDescriptor<RecordType>
}

export type QueryValidation = {
    isValid: boolean,
    errors: string[]
}

export type ParsingResult<RecordType> = {
    queryDescriptor: QueryDescriptor<RecordType>,
    errors: string[],
}
