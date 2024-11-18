import {describe, it} from "node:test";
import assert from "node:assert";
import {collectionBuilder} from "../../index";


describe("test collection builder", () => {

    const schema = {
        type: "object",
        properties: {
            id: { type: "integer" },
            name: { type: "string" },
            age: { type: "integer" },
            code: { type: "string" },
        }
    } as const;

    const input = {
        name: "Test Subject",
        schema,
        primaryKey: {
            name: "id",
            type: "number" as NoInfer<"number">
        },
        indexes: [
            {
                column: {
                    name: "age",
                    type: "integer" as NoInfer<"integer">
                },
                isUnique: false
            },
            {
                column: {
                    name: "code",
                    type: "string" as NoInfer<"string">
                },
                isUnique: true
            }
        ]
    };

    it("Should build a collection", () => {
        const collection = collectionBuilder(input);
        assert.strictEqual(collection.name, input.name);
        assert.strictEqual(JSON.stringify(collection.schema), JSON.stringify(input.schema));
        assert.strictEqual(collection.primaryKey.name, input.primaryKey.name);
        assert.strictEqual(collection.primaryKey.type, input.primaryKey.type);
        assert(collection.indexes);
        assert.strictEqual(Object.keys(collection.indexes).length, 2);
        assert(collection.indexes["age"]);
        assert.strictEqual(collection.indexes["age"].descriptor.column.name, input.indexes[0].column.name);
        assert.strictEqual(collection.indexes["age"].descriptor.column.type, input.indexes[0].column.type);
        assert.strictEqual(collection.indexes["age"].descriptor.isUnique, input.indexes[0].isUnique);
        assert(collection.indexes["code"]);
        assert.strictEqual(collection.indexes["code"].descriptor.column.name, input.indexes[1].column.name);
        assert.strictEqual(collection.indexes["code"].descriptor.column.type, input.indexes[1].column.type);
        assert.strictEqual(collection.indexes["code"].descriptor.isUnique, input.indexes[1].isUnique);
    });
});
