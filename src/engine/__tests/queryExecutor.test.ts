import {describe,it} from "node:test";
import assert from "node:assert";
import {Collection, FilterDescriptor, JSONSchema} from "../../types";
import BTree from "sorted-btree";
import {QueryExecutor} from "../queryExecutor";
import {FromSchema} from "json-schema-to-ts";
import isPrimaryKeyFilter = QueryExecutor.isPrimaryKeyFilter;
import isIndexFilter = QueryExecutor.isIndexFilter;
import getIndex = QueryExecutor.getIndex;
import projectColumns = QueryExecutor.projectColumns;
import applyFilterOnPrimaryKey = QueryExecutor.applyFilterOnPrimaryKey;
import applyFilterOnIndex = QueryExecutor.applyFilterOnIndex;
import applyFilterWithNoIndexes = QueryExecutor.applyFilterWithNoIndexes;

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

const records = [
    {id: 1, name: "Ben Kerr", age: 30, code: "0031"},
    {id: 2, name: "Don Joe", age: 50, code: "0234"},
    {id: 3, name: "John Doe", age: 55, code: "0433"},
    {id: 4, name: "Mel Deer", age: 50, code: "0694"}
];

const data = new BTree<number, RecordType>();
data.set(1, records[0]);
data.set(2, records[1]);
data.set(3, records[2]);
data.set(4, records[3]);

const ageIndex = new BTree<number, number[]>();
ageIndex.set(30, [1]);
ageIndex.set(50, [2, 4]);
ageIndex.set(55, [3]);

const codeIndex = new BTree<string, number>();
codeIndex.set("0031", 1);
codeIndex.set("0234", 2);
codeIndex.set("0433", 3);
codeIndex.set("0694", 4);

const collection: Collection<RecordType> = {
    name: "Test Subject",
    schema: schema as JSONSchema,
    data,
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
            data: ageIndex
        },
        code: {
            descriptor: {
                property: {
                    name: "code",
                    type: "string"
                },
                isUnique: true
            },
            data: codeIndex
        }
    }
};


describe("test function isPrimaryKeyFilter", () => {
    it("returns true", () => {
        const result = isPrimaryKeyFilter("id", collection);
        assert(result);
    });
    it("returns false", () => {
        const result = isPrimaryKeyFilter("age", collection);
        assert(!result);
    });
});

describe("test function isIndexFilter", () => {
    it("returns true", () => {
        const result = isIndexFilter("age", collection);
        assert.ok(result);
    });
    it("returns false", () => {
        const result = isIndexFilter("name", collection);
        assert(!result);
    });
});

describe("test function getIndex", () => {
    it("index is present", () => {
        const result = getIndex("age", collection);
        assert(result);
    });
    it("index is not present", () => {
        const result = getIndex("name", collection);
        assert(!result);
    });
});

describe("test function projectColumns", () => {
    it("pick existing columns", () => {
        const record = { a: 1, b: 2, c: 3};
        const expected = { a: 1, c: 3};
        const result = projectColumns(record, "a", "c");
        assert.strictEqual(JSON.stringify(expected), JSON.stringify(result));
    });
    it("pick un-existing columns, return empty object", () => {
        const record = { a: 1, b: 2, c: 3};
        const expected = { };
        const result = projectColumns(record, "d" as NoInfer<"a" | "b" | "c">, "e" as NoInfer<"a" | "b" | "c">);
        assert.strictEqual(JSON.stringify(expected), JSON.stringify(result));
    });
    it("pick mixed columns, return only existing ones", () => {
        const record = { a: 1, b: 2, c: 3};
        const expected = { a: 1, b: 2 };
        const result = projectColumns(record, "a", "b", "d" as NoInfer<"a" | "b" | "c">, "e" as NoInfer<"a" | "b" | "c">);
        assert.strictEqual(JSON.stringify(expected), JSON.stringify(result));
    });
});

describe("test function apply filter on primary key", () => {
    const descriptorBase = {
        columnName: "id",
        value: 2
    };
    it("gt filter with projection", () => {
        const descriptor = {...descriptorBase, comparator: "gt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnPrimaryKey(descriptor, collection, ["id", "age"]);
        assert.strictEqual(result.length, 2);
        assert(result[0].id === 3 || result[0].id === 4);
        assert(result[1].id === 3 || result[1].id === 4);
        assert.strictEqual(Object.keys(result[0]).length, 2);
    });
    it("gt filter with no projection", () => {
        const descriptor = {...descriptorBase, comparator: "gt"}  satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnPrimaryKey(descriptor, collection);
        assert.strictEqual(result.length, 2);
        assert(result[0].id === 3 || result[0].id === 4);
        assert(result[1].id === 3 || result[1].id === 4);
        assert.strictEqual(Object.keys(result[0]).length, 4);
    });
    it("lt filter with projection", () => {
        const descriptor = {...descriptorBase, value: 3, comparator: "lt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnPrimaryKey(descriptor, collection, ["id", "age"]);
        assert.strictEqual(result.length, 2);
        assert(result[0].id === 1 || result[0].id === 2);
        assert(result[1].id === 1 || result[1].id === 2);
        assert.strictEqual(Object.keys(result[0]).length, 2);
    });
    it("lt filter with no projection", () => {
        const descriptor = {...descriptorBase, value: 3, comparator: "lt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnPrimaryKey(descriptor, collection);
        assert.strictEqual(result.length, 2);
        assert(result[0].id === 1 || result[0].id === 2);
        assert(result[1].id === 1 || result[1].id === 2);
        assert.strictEqual(Object.keys(result[0]).length, 4);
    });
    it("eq filter with projection", () => {
        const descriptor = {...descriptorBase, comparator: "eq"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnPrimaryKey(descriptor, collection, ["id", "age"]);
        assert.strictEqual(result.length, 1);
        assert(result[0].id === 2);
        assert.strictEqual(Object.keys(result[0]).length, 2);
    });
    it("eq filter with no projection", () => {
        const descriptor = {...descriptorBase, comparator: "eq"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnPrimaryKey(descriptor, collection);
        assert.strictEqual(result.length, 1);
        assert(result[0].id === 2);
        assert.strictEqual(Object.keys(result[0]).length, 4);
    });
    it("gt filter with no result", () => {
        const descriptor = {...descriptorBase, value: 5, comparator: "gt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnPrimaryKey(descriptor, collection);
        assert.strictEqual(result.length, 0);
    });
    it("lt filter with no result", () => {
        const descriptor = {...descriptorBase, value: 0, comparator: "lt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnPrimaryKey(descriptor, collection);
        assert.strictEqual(result.length, 0);
    });
    it("eq filter with no result", () => {
        const descriptor = {...descriptorBase, value: 5, comparator: "eq"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnPrimaryKey(descriptor, collection);
        assert.strictEqual(result.length, 0);
    });
});

describe("test function applyFilterOnIndex - unique filter", () => {
    const descriptorBase = {
        columnName: "code",
        value: "0234"
    };
    it("gt filter with projection", () => {
        const descriptor = {...descriptorBase, comparator: "gt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.code!, collection, ["id", "age"]);
        assert.strictEqual(result.length, 2);
        assert(result[0].id === 3 || result[0].id === 4);
        assert(result[1].id === 3 || result[1].id === 4);
        assert.strictEqual(Object.keys(result[0]).length, 2);
    });
    it("gt filter with no projection", () => {
        const descriptor = {...descriptorBase, comparator: "gt"}  satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.code!, collection);
        assert.strictEqual(result.length, 2);
        assert(result[0].id === 3 || result[0].id === 4);
        assert(result[1].id === 3 || result[1].id === 4);
        assert.strictEqual(Object.keys(result[0]).length, 4);
    });
    it("lt filter with projection", () => {
        const descriptor = {...descriptorBase, value: "0433", comparator: "lt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.code!, collection, ["id", "age"]);
        assert.strictEqual(result.length, 2);
        assert(result[0].id === 1 || result[0].id === 2);
        assert(result[1].id === 1 || result[1].id === 2);
        assert.strictEqual(Object.keys(result[0]).length, 2);
    });
    it("lt filter with no projection", () => {
        const descriptor = {...descriptorBase, value: "0433", comparator: "lt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.code!, collection);
        assert.strictEqual(result.length, 2);
        assert(result[0].id === 1 || result[0].id === 2);
        assert(result[1].id === 1 || result[1].id === 2);
        assert.strictEqual(Object.keys(result[0]).length, 4);
    });
    it("eq filter with projection", () => {
        const descriptor = {...descriptorBase, comparator: "eq"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.code!, collection, ["id", "age"]);
        assert.strictEqual(result.length, 1);
        assert(result[0].id === 2);
        assert.strictEqual(Object.keys(result[0]).length, 2);
    });
    it("eq filter with no projection", () => {
        const descriptor = {...descriptorBase, comparator: "eq"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.code!, collection);
        assert.strictEqual(result.length, 1);
        assert(result[0].id === 2);
        assert.strictEqual(Object.keys(result[0]).length, 4);
    });
    it("gt filter with no result", () => {
        const descriptor = {...descriptorBase, value: "9433", comparator: "gt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.code!, collection);
        assert.strictEqual(result.length, 0);
    });
    it("lt filter with no result", () => {
        const descriptor = {...descriptorBase, value: "0000", comparator: "lt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.code!, collection);
        assert.strictEqual(result.length, 0);
    });
    it("eq filter with no result", () => {
        const descriptor = {...descriptorBase, value: "9433", comparator: "eq"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.code!, collection);
        assert.strictEqual(result.length, 0);
    });
});

describe("test function applyFilterOnIndex - not unique filter", () => {
    const descriptorBase = {
        columnName: "age",
        value: 50
    };
    it("gt filter with projection", () => {
        const descriptor = {...descriptorBase, comparator: "gt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.age!, collection, ["id", "age"]);
        assert.strictEqual(result.length, 1);
        assert(result[0].id === 3);
        assert.strictEqual(Object.keys(result[0]).length, 2);
    });
    it("gt filter with no projection", () => {
        const descriptor = {...descriptorBase, comparator: "gt"}  satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.age!, collection);
        assert.strictEqual(result.length, 1);
        assert(result[0].id === 3);
        assert.strictEqual(Object.keys(result[0]).length, 4);
    });
    it("lt filter with projection", () => {
        const descriptor = {...descriptorBase, comparator: "lt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.age!, collection, ["id", "age"]);
        assert.strictEqual(result.length, 1);
        assert(result[0].id === 1);
        assert.strictEqual(Object.keys(result[0]).length, 2);
    });
    it("lt filter with no projection", () => {
        const descriptor = {...descriptorBase, comparator: "lt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.age!, collection);
        assert.strictEqual(result.length, 1);
        assert(result[0].id === 1);
        assert.strictEqual(Object.keys(result[0]).length, 4);
    });
    it("eq filter with projection", () => {
        const descriptor = {...descriptorBase, comparator: "eq"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.age!, collection, ["id", "age"]);
        assert.strictEqual(result.length, 2);
        assert(result[0].id === 2 || result[0].id === 4);
        assert(result[1].id === 2 || result[1].id === 4);
        assert.strictEqual(Object.keys(result[0]).length, 2);
    });
    it("eq filter with no projection", () => {
        const descriptor = {...descriptorBase, comparator: "eq"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.age!, collection);
        assert.strictEqual(result.length, 2);
        assert(result[0].id === 2 || result[0].id === 4);
        assert(result[1].id === 2 || result[1].id === 4);
        assert.strictEqual(Object.keys(result[0]).length, 4);
    });
    it("gt filter with no result", () => {
        const descriptor = {...descriptorBase, value: 55, comparator: "gt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.age!, collection);
        assert.strictEqual(result.length, 0);
    });
    it("lt filter with no result", () => {
        const descriptor = {...descriptorBase, value: 30, comparator: "lt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.age!, collection);
        assert.strictEqual(result.length, 0);
    });
    it("eq filter with no result", () => {
        const descriptor = {...descriptorBase, value: 60, comparator: "eq"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterOnIndex(descriptor, collection.indexes!.age!, collection);
        assert.strictEqual(result.length, 0);
    });
})

describe("test function applyFilterWithNoIndexes", () => {
    const descriptorBase = {
        columnName: "name",
        value: "Don Joe"
    };
    it("gt filter with projection", () => {
        const descriptor = {...descriptorBase, comparator: "gt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterWithNoIndexes(descriptor, collection, ["id", "age"]);
        assert.strictEqual(result.length, 2);
        assert(result[0].id === 3 || result[0].id === 4);
        assert(result[1].id === 3 || result[1].id === 4);
        assert.strictEqual(Object.keys(result[0]).length, 2);
    });
    it("gt filter with no projection", () => {
        const descriptor = {...descriptorBase, comparator: "gt"}  satisfies FilterDescriptor<RecordType>;
        const result = applyFilterWithNoIndexes(descriptor, collection);
        assert.strictEqual(result.length, 2);
        assert(result[0].id === 3 || result[0].id === 4);
        assert(result[1].id === 3 || result[1].id === 4);
        assert.strictEqual(Object.keys(result[0]).length, 4);
    });
    it("lt filter with projection", () => {
        const descriptor = {...descriptorBase, comparator: "lt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterWithNoIndexes(descriptor, collection, ["id", "age"]);
        assert.strictEqual(result.length, 1);
        assert(result[0].id === 1);
        assert.strictEqual(Object.keys(result[0]).length, 2);
    });
    it("lt filter with no projection", () => {
        const descriptor = {...descriptorBase, comparator: "lt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterWithNoIndexes(descriptor, collection);
        assert.strictEqual(result.length, 1);
        assert(result[0].id === 1);
        assert.strictEqual(Object.keys(result[0]).length, 4);
    });
    it("eq filter with projection", () => {
        const descriptor = {...descriptorBase, comparator: "eq"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterWithNoIndexes(descriptor, collection, ["id", "age"]);
        assert.strictEqual(result.length, 1);
        assert(result[0].id === 2);
        assert.strictEqual(Object.keys(result[0]).length, 2);
    });
    it("eq filter with no projection", () => {
        const descriptor = {...descriptorBase, comparator: "eq"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterWithNoIndexes(descriptor, collection);
        assert.strictEqual(result.length, 1);
        assert(result[0].id === 2);
        assert.strictEqual(Object.keys(result[0]).length, 4);
    });
    it("gt filter with no result", () => {
        const descriptor = {...descriptorBase, value: "Mel Deer", comparator: "gt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterWithNoIndexes(descriptor, collection);
        assert.strictEqual(result.length, 0);
    });
    it("lt filter with no result", () => {
        const descriptor = {...descriptorBase, value: "Ben Kerr", comparator: "lt"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterWithNoIndexes(descriptor, collection);
        assert.strictEqual(result.length, 0);
    });
    it("eq filter with no result", () => {
        const descriptor = {...descriptorBase, value: "Ben Scor", comparator: "eq"} satisfies FilterDescriptor<RecordType>;
        const result = applyFilterWithNoIndexes(descriptor, collection);
        assert.strictEqual(result.length, 0);
    });
});
