import {QueryExecutor} from "../engine/queryExecutor";
import {Collection, QueryDescriptor} from "../types";

import execute = QueryExecutor.executeQuery;
import {TtlCache} from "../cache";

/**
 * This function is responsible for executing a query provided and print to console the query result
 */
export function executeQuery<RecordType>(queryDescriptor: QueryDescriptor<RecordType>, collection: Collection<RecordType>, recordsCache?: TtlCache<unknown, RecordType>) {
    console.clear();
    console.time('Query execution successful');
    const recordSet = execute(queryDescriptor, collection, recordsCache);
    console.timeEnd('Query execution successful');
    console.table(recordSet);
    console.log(`(${recordSet.length} rows)`)
}
