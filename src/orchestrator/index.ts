import {setupAndStartIngestion} from './setupAndStartIngestion';
import {handleKeyboardInput} from './handleKeyboardInput';
import {parseAndValidate} from "../parser";
import {executeQuery} from "./executeQuery";

/**
 * Startup the data ingestion and handle the user interaction
 */
export async function start() {
    const collection = await setupAndStartIngestion();

    console.log("Input a query or type \"exit\" to terminate the session");

    while (true) {
        const query = await handleKeyboardInput();
        if (query === 'exit') {
            break;
        }
        const {errors, queryDescriptor} = parseAndValidate(query.trim(), collection.schema);
        if (errors) {
            console.error(errors);
        } else if (queryDescriptor) {
            executeQuery(queryDescriptor, collection)
        }
    }
}



