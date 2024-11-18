import {describe, it} from "node:test";
import assert from "node:assert";
import BTree from "sorted-btree";
import {Collection, JSONSchema} from "../../../types";
import {FromSchema} from "json-schema-to-ts";
import {Indexer} from "../indexer.functions";
import indexRecord = Indexer.indexRecord;

const schema = {
    type: "object",
    properties: {
        id: { type: "integer" },
        name: { type: "string" },
        age: { type: "integer" },
        code: { type: "string" },
    }
} as const;

type RecordType = FromSchema<typeof schema>;

const record = {id: 1, name: "Ben Kerr", age: 30, code: "0031"};

const getData = () => {
    const data = new BTree<number, RecordType>();
    data.set(1, record);
    return data;
}

const getCollection = (): Collection<RecordType> => ({
    name: "Test Subject",
    schema: schema as JSONSchema,
    data: getData(),
    primaryKey: {
        name: "id",
        type: "integer"
    },
    indexes: {
        age: {
            descriptor: {
                property: {
                    name: "age",
                    type: "integer"
                },
                isUnique: false
            },
            data: new BTree<string, number[]>()
        },
        code: {
            descriptor: {
                property: {
                    name: "code",
                    type: "string"
                },
                isUnique: true
            },
            data: new BTree<string, number>()
        }
    }
});

describe("Test function indexRecord", () => {
    it("Not unique indexing", () => {
        const collection = getCollection();
        indexRecord(record, "age", collection);
        assert(collection.indexes!.age!.data);
        assert.strictEqual(collection.indexes!.age!.data.size, 1);
        // @ts-ignore
        const item = collection.indexes!.age!.data.get(record.age);
        assert(Array.isArray(item));
        assert.strictEqual(item[0], record.id);
    });
    it("Unique indexing", () => {
        const collection = getCollection();
        indexRecord(record, "code", collection);
        assert(collection.indexes!.code!.data);
        assert.strictEqual(collection.indexes!.code!.data.size, 1);
        // @ts-ignore
        const item = collection.indexes!.code!.data.get(record.code);
        assert(!Array.isArray(item));
        assert.strictEqual(item, record.id);
    });
});
