import {QueryExecutor} from "../engine/queryExecutor";
import {Collection, QueryDescriptor} from "../types";

import execute = QueryExecutor.executeQuery;

/**
 * This function is responsible for executing a query provided and print to console the query result
 */
export function executeQuery<RecordType>(queryDescriptor: QueryDescriptor<RecordType>, collection: Collection<RecordType>) {
    console.clear();
    console.time('Query execution successful');
    const recordSet = execute(queryDescriptor, collection);
    console.timeEnd('Query execution successful');
    console.table(recordSet);
    console.log(`(${recordSet.length} rows)`)
}
