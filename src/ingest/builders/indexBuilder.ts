import BTree from "sorted-btree";
import {JSONSchemaType} from "json-schema-to-ts/lib/types/definitions";
import {INDEXABLE_TYPES} from "../../constants/indexableTypes";
import {IndexableTypes, JSONSchema, IndexDescriptor, IndexValidity, Index, Indexable} from "../../types";

export namespace IndexBuilder {

    /**
     * Checks whether a JSONSchema property has multiple types
     *
     * @param input
     * @private
     */
    function isJSONSchemaPropertyTypeArray(input: JSONSchemaType | readonly JSONSchemaType[]): input is Readonly<JSONSchemaType[]> {
        return Array.isArray(input);
    }

    /**
     * Checks if the type provided for JSONSchema property is allowed
     *
     * @param input
     * @private
     */
    function isValidPropertyType(input: string): input is IndexableTypes {
        return INDEXABLE_TYPES.includes(input as IndexableTypes);
    }

    /**
     * Validates a given index descriptor
     *
     * @param index
     * @param schema
     */
    export function validateIndex<RecordType>(index: IndexDescriptor<RecordType>, schema: JSONSchema): IndexValidity {
        const {column: {name: propertyName}} = index;
        const schemaProperties = schema.properties as Readonly<Record<keyof RecordType, JSONSchema>>;
        const errors: string[] = [];
        if (!schemaProperties[propertyName]) {
            errors.push("Invalid property name");
        } else {
            const indexPropertyType = schemaProperties[propertyName].type;
            if (indexPropertyType === undefined) {
                errors.push("Invalid property type: \"undefined\"");
            } else if (isJSONSchemaPropertyTypeArray(indexPropertyType)) {
                errors.push("Invalid property type: \"multiple-types\"");
            } else if (!isValidPropertyType(indexPropertyType as string)) {
                errors.push(`Invalid property type: ${indexPropertyType}`);
            }
        }
        return {
            isValid: !errors.length,
            errors
        }
    }

    /**
     * Builds an index starting from an index descriptor
     *
     * @param indexDescriptor
     * @param schema
     * @param primaryKey
     */
    export function build<RecordType>(indexDescriptor: IndexDescriptor<RecordType>, schema: JSONSchema, primaryKey: Indexable<RecordType>): Index<RecordType> {
        const validation = validateIndex(indexDescriptor, schema);
        if (!validation.isValid) {
            throw Error(validation.errors.join("\n"));
        } else {
            type KeyType = typeof indexDescriptor.column.type extends "string" ? string : number;
            type ValueType = typeof indexDescriptor.isUnique extends true ?
                typeof primaryKey.type extends "string" ? string : number :
                typeof primaryKey.type extends "string" ? string[] : number[];
            return {
                descriptor: indexDescriptor,
                data: new BTree<KeyType, ValueType>()
            }
        }
    }
}
