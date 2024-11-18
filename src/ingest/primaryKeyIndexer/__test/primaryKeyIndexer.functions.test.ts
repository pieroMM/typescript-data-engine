import {describe, it} from "node:test";
import assert from "node:assert";
import BTree from "sorted-btree";
import {JSONSchema} from "../../../types";
import {FromSchema} from "json-schema-to-ts";
import {PrimaryKeyIndexer} from "../primaryKeyIndexer.functions";
import indexPrimaryKey = PrimaryKeyIndexer.indexPrimaryKey;

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

const record = {id: 1, name: "Ben Kerr", age: 30, code: "0031"}

const collection = {
    name: "Test Subject",
    schema: schema as JSONSchema,
    data: new BTree<number, RecordType>(),
    primaryKey: {
        name: "id",
        type: "integer" as NoInfer<"integer">
    }
};

describe("Test function indexPrimaryKey", () => {
    it("Indexing a record", () => {
        indexPrimaryKey(record, collection);
        assert(collection.data);
        assert.strictEqual(collection.data.size, 1);
        const item = collection.data.get(record.id);
        assert.deepEqual(item, record);
    });
});
