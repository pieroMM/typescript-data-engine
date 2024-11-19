import {Model, setupAndStartIngestion} from './setupAndStartIngestion';
import {handleKeyboardInput} from './handleKeyboardInput';
import {parseAndValidate} from "../parser";
import {executeQuery} from "./executeQuery";
import {TtlCache} from "../cache";
import {Collection} from "../types";

/**
 * Startup the data ingestion and handle the user interaction
 */
export async function start() {
    const collection: Collection<Model> = await setupAndStartIngestion();

    const cache = new TtlCache<unknown, Model>(10);
    console.log("Input a query or type \"exit\" to terminate the session");

    while (true) {
        const query = await handleKeyboardInput();
        if (query === 'exit') {
            break;
        }
        if (query === 'cache --size') {
            console.log(cache.size);
            continue;
        }
        const {errors, queryDescriptor} = parseAndValidate(query.trim(), collection.schema);
        if (errors) {
            console.error(errors);
        } else if (queryDescriptor) {
            executeQuery<Model>(queryDescriptor, collection, cache);
        }

        setImmediate(() => cache.removeExpiredEntries(new Date().valueOf()));
    }
}



