import {describe, it} from "node:test";
import assert from "node:assert";
import {QueryValidator} from "../queryValidator";
import validateQueryDescriptor = QueryValidator.validateQueryDescriptor;
import {FromSchema} from "json-schema-to-ts";

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

describe("Test query validator", () => {
    it("Provide valid query descriptor - part 1", () => {
        const queryDescriptor = {
            project: [ "id", "name", "age", "code" ],
            filter: {
                comparator: "lt" as NoInfer<"lt">,
                columnName: "id",
                value: 10
            }
        };
        const result = validateQueryDescriptor<RecordType>(queryDescriptor, schema);
        assert(result.isValid);
        assert(!result.errors?.length);
    });
    it("Provide valid query descriptor - part 2", () => {
        const queryDescriptor = {
            project: [ "id", "name", "age", "code" ]
        };
        const result = validateQueryDescriptor<RecordType>(queryDescriptor, schema);
        assert(result.isValid);
        assert(!result.errors?.length);
    });
    it("Provide valid query descriptor - part 3", () => {
        const queryDescriptor = {
            project: [ "id", "name", "age", "code" ]
        };
        const result = validateQueryDescriptor<RecordType>(queryDescriptor, schema);
        assert(result.isValid);
        assert(!result.errors?.length);
    });
    it("Provide invalid query descriptor - part 1", () => {
        const queryDescriptor = {
            project: [ "id", "names", "age", "code" ],
            filter: {
                comparator: "lt" as NoInfer<"lt">,
                columnName: "id",
                value: 10
            }
        };
        const result = validateQueryDescriptor<RecordType>(queryDescriptor, schema);
        assert(!result.isValid);
        assert(result.errors?.length);
        assert(result.errors[0].startsWith('Invalid column name'));
    });
    it("Provide invalid query descriptor - part 2", () => {
        const queryDescriptor = {
            project: [ "id", "name", "age", "code" ],
            filter: {
                comparator: "lt" as NoInfer<"lt">,
                columnName: "ids",
                value: 10
            }
        };
        const result = validateQueryDescriptor<RecordType>(queryDescriptor, schema);
        assert(!result.isValid);
        assert(result.errors?.length);
        assert(result.errors[0].startsWith('Invalid filter column name'));
    });
    it("Provide invalid query descriptor - part 3", () => {
        const queryDescriptor = {
            project: [ "id", "name", "age", "code" ],
            filter: {
                comparator: "lt" as NoInfer<"lt">,
                columnName: "id",
                value: "ABC"
            }
        };
        const result = validateQueryDescriptor<RecordType>(queryDescriptor, schema);
        assert(!result.isValid);
        assert(result.errors?.length);
        assert(result.errors[0].startsWith('Invalid filter value'));
    });
});
