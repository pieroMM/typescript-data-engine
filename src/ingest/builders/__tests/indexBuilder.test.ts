import {describe, it} from "node:test";
import assert from "node:assert";
import {IndexBuilder} from "../indexBuilder";
import validateIndex = IndexBuilder.validateIndex;
import build = IndexBuilder.build;

describe("Test function validateIndex", () => {
    it("Provide valid descriptor", () => {
        const schema = {
            type: "object",
            properties: {
                id: { type: "integer" },
                name: { type: "string" },
                age: { type: "integer" },
                code: { type: "string" },
            }
        } as const;
        const descriptor = {
                column: {
                    name: "age",
                    type: "integer" as NoInfer<"integer">
                },
                isUnique: false
            };
        const validation = validateIndex(descriptor, schema);
        assert(validation.isValid);
        assert(!validation.errors.length);
    });
    it("Provide invalid descriptor - invalid property name", () => {
        const schema = {
            type: "object",
            properties: {
                id: { type: "integer" },
                name: { type: "string" },
                age: { type: "integer" },
                code: { type: "string" },
            }
        } as const;
        const descriptor = {
            column: {
                name: "ages",
                type: "integer" as NoInfer<"integer">
            },
            isUnique: false
        };
        const validation = validateIndex(descriptor, schema);
        assert(!validation.isValid);
        assert.strictEqual(validation.errors.length, 1);
        assert(validation.errors[0].includes("Invalid property name"));
    });
    it("Provide invalid schema - part 1", () => {
        const schema = {
            type: "object",
            properties: {
                id: { type: "integer" },
                name: { type: "string" },
                age: { type: ["integer", "number"] },
                code: { type: "string" },
            }
        } as const;
        const descriptor = {
            column: {
                name: "age",
                type: "integer" as NoInfer<"integer">
            },
            isUnique: false
        };
        const validation = validateIndex(descriptor, schema);
        assert(!validation.isValid);
        assert.strictEqual(validation.errors.length, 1);
        assert(validation.errors[0].includes("Invalid property type"));
    });
    it("Provide invalid schema - part 2", () => {
        const schema = {
            type: "object",
            properties: {
                id: { type: "integer" },
                name: { type: "string" },
                age: { },
                code: { type: "string" },
            }
        } as const;
        const descriptor = {
            column: {
                name: "age",
                type: "integer" as NoInfer<"integer">
            },
            isUnique: false
        };
        const validation = validateIndex(descriptor, schema);
        assert(!validation.isValid);
        assert.strictEqual(validation.errors.length, 1);
        assert(validation.errors[0].includes("Invalid property type"));
    });
    it("Provide invalid schema - part 3", () => {
        const schema = {
            type: "object",
            properties: {
                id: { type: "integer" },
                name: { type: "string" },
                age: { type: "boolean" },
                code: { type: "string" },
            }
        } as const;
        const descriptor = {
            column: {
                name: "age",
                type: "integer" as NoInfer<"integer">
            },
            isUnique: false
        };
        const validation = validateIndex(descriptor, schema);
        assert(!validation.isValid);
        assert.strictEqual(validation.errors.length, 1);
        assert(validation.errors[0].includes("Invalid property type"));
    });
})

describe("Test index builder", () => {
    it("Create a new index", () => {
        const schema = {
            type: "object",
            properties: {
                id: { type: "integer" },
                name: { type: "string" },
                age: { type: "integer" },
                code: { type: "string" },
            }
        } as const;
        const inputDescriptor = {
            column: {
                name: "age",
                type: "integer" as NoInfer<"integer">
            },
            isUnique: false
        };
        const primaryKey = {
            name: "id",
            type: "integer" as NoInfer<"integer">
        }
        const index = build(inputDescriptor, schema, primaryKey);
        const {descriptor, data} = index;
        assert(descriptor);
        assert.strictEqual(descriptor.isUnique, inputDescriptor.isUnique);
        assert.strictEqual(descriptor.column.name, inputDescriptor.column.name);
        assert.strictEqual(descriptor.column.type, inputDescriptor.column.type);
        assert(data);
        assert(!data.size);
    });
    it("Provide an invalid index", () => {
        assert.throws(() => {
            const schema = {
                type: "object",
                properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                    age: { type: "integer" },
                    code: { type: "string" },
                }
            } as const;
            const inputDescriptor = {
                column: {
                    name: "ages",
                    type: "integer" as NoInfer<"integer">
                },
                isUnique: false
            };
            const primaryKey = {
                name: "id",
                type: "integer" as NoInfer<"integer">
            };
            build(inputDescriptor, schema, primaryKey);
        }, { name: "Error", message: "Invalid property name" })
    });
});
