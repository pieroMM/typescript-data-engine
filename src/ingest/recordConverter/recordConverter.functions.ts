import {JSONSchema, IndexableTypes} from "../../types";

export namespace RecordConverterFunctions {

    /**
     *
     * @param schema
     */
    export function buildSchemaPropertiesTypeMap<T>(schema: JSONSchema): Map<keyof T, IndexableTypes> {
        const typesMap = new Map();
        const properties = schema.properties!;
        const keys = Object.keys(properties) as (keyof T)[];
        for (let key of keys) {
            typesMap.set(key, (properties[key] as JSONSchema).type)
        }
        return typesMap;
    }

    /**
     * Converts from string to number all numeric fields of a given record
     *
     * @param record
     * @param propertiesTypeMap
     */
    export function convert<FinalRecordType>(record: Record<keyof FinalRecordType, any>, propertiesTypeMap: Map<keyof FinalRecordType, IndexableTypes>): FinalRecordType {
        const result: any = {};
        for (let entry of propertiesTypeMap.entries()) {
            const [name, type] = entry;
            if (name in record) {
                switch (type) {
                    case "number":
                    case "integer": {
                        const converted = Number(record[name]).valueOf();
                        if (isNaN(converted)) {
                            throw Error("Invalid numeric value");
                        } else {
                            result[name] = converted;
                        }
                        break;
                    }
                    case "string":
                    default:
                        result[name] = record[name];
                }
            }
        }
        return result as FinalRecordType;
    }
}
