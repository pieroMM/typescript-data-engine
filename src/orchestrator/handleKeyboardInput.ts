import readline from "readline/promises";
import * as process from "node:process";

/**
 * This function is responsible for handling the commands provided by the user
 */
export async function handleKeyboardInput(){
    const rl = readline.createInterface({
        input: process.stdin.setEncoding('utf-8'),
        output: process.stdout,
    });

    const query = await rl.question('$ ');

    rl.close();

    return query;

}
