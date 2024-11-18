import {JSONSchema, QueryDescriptor, QueryValidation} from "../../types";

export namespace QueryValidator {

    /**
     * Validates a given query descriptor
     *
     * @param queryDescriptor
     * @param schema
     */
    export function validateQueryDescriptor<RecordType>(queryDescriptor: QueryDescriptor<RecordType>, schema: JSONSchema): QueryValidation {
        const errors: string[] = [];
        const {project, filter} = queryDescriptor;
        for (let column of project ?? []) {
            if (!(column in schema.properties!)) {
                errors.push(`Invalid column name ${column.toString()}`);
            }
        }
        if (filter) {
            const {columnName: filterColumnName, value: filterValue} = filter;
            if (!(filterColumnName in schema.properties!)) {
                errors.push(`Invalid filter column name ${filterColumnName.toString()}`);
            } else {
                const filterColumnType = (schema.properties![filterColumnName.toString()] as JSONSchema).type;
                const isInvalidStringColumn = filterColumnType === "string" && typeof filterValue !== "string";
                const isInvalidNumberColumn = (filterColumnType === "number" || filterColumnType === "integer") && isNaN(Number(filterValue).valueOf());
                if (isInvalidStringColumn || isInvalidNumberColumn) {
                    errors.push(`Invalid filter value ${JSON.stringify(filterValue)} for column ${filterColumnName.toString()}`)
                }
            }
        }
        return {
            isValid: !errors.length,
            errors
        }
    }
}
