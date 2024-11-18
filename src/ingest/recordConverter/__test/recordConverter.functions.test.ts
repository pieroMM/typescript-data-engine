import {describe, it} from "node:test";
import assert from "node:assert";
import {RecordConverterFunctions} from "../recordConverter.functions";
import buildSchemaPropertiesTypeMap = RecordConverterFunctions.buildSchemaPropertiesTypeMap;
import {FromSchema} from "json-schema-to-ts";
import convert = RecordConverterFunctions.convert;
import {IndexableTypes} from "../../../types";

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

const typesMap = new Map<keyof RecordType, IndexableTypes>([
    ["id", "integer"],
    ["name", "string"],
    ["age", "integer"],
    ["code", "string"]
]);


describe('Test record string to number fields converter', () => {
    it('Test function buildSchemaPropertiesTypeMap', () => {
        const result = buildSchemaPropertiesTypeMap<RecordType>(schema);
        assert.strictEqual(result.size, 4);
        assert.strictEqual(result.get("id"), "integer");
        assert.strictEqual(result.get("name"), "string");
        assert.strictEqual(result.get("age"), "integer");
        assert.strictEqual(result.get("code"), "string");
    });
    it('Test function convert', () => {
        const record = {id: "1", name: "Ben Kerr", age: "30", code: "0031"};
        const result = convert<RecordType>(record, typesMap);
        const expected = {id: 1, name: "Ben Kerr", age: 30, code: "0031"};
        assert.deepEqual(result, expected);
    });
    it('Test function convert - should fail', () => {
        const record = {id: "1", name: "Ben Kerr", age: "ABC", code: "0031"};
        assert.throws(() => {
            convert<RecordType>(record, typesMap);
        }, {
            name: "Error",
            message: "Invalid numeric value"
        })
    });
});
