import grammar from "./grammar/queryLanguage.ohm-bundle";
import {semantics} from "./grammar/semantics";
import {QueryValidator} from "./validators/queryValidator";
import {JSONSchema, ParsingResult} from "../types";

import validateQueryDescriptor = QueryValidator.validateQueryDescriptor;

export namespace QueryParser {

    /**
     * If a given query is valid, creates a query descriptor, otherwise returns a parsing errors
     *
     * @param query
     */
    export function parse<RecordType>(query: string): Partial<ParsingResult<RecordType>> {
        const parsingMatch = grammar.match(query);
        if (parsingMatch.succeeded()) {
            const queryDescriptor = semantics(parsingMatch).eval();
            return {queryDescriptor};
        } else {
            return { errors: [parsingMatch.shortMessage!] };
        }
    }

    /**
     * If a given query is valid, creates a query descriptor, otherwise returns a parsing or semantic errors list
     *
     * @param query
     * @param schema
     */
    export function parseAndValidate<RecordType>(query: string, schema: JSONSchema): Partial<ParsingResult<RecordType>> {
        const errors: string[] = [];
        const { errors: parsingError, queryDescriptor} = parse(query);
        if (parsingError) {
            errors.push(...parsingError);
        } else if (queryDescriptor) {
            const validation = validateQueryDescriptor(queryDescriptor, schema);
            if (validation.isValid) {
                return { queryDescriptor};
            } else {
                errors.push(...validation.errors);
                return { errors };
            }
        }
        return {errors, queryDescriptor};
    }
}
