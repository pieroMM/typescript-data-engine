import fs from "node:fs";
import {parse, Parser} from "csv-parse";

export namespace FileProcessorBuilder {

    /**
     *  Creates a streams which reads a .csv file and parses lines
     *
     * @param filePath
     */
    export function build(filePath: string): { readStream: fs.ReadStream, parser: Parser}  {
        const readStream = fs.createReadStream(filePath, { highWaterMark: 1024 });
        const parser = parse({
            columns: true,
            skip_empty_lines: true,
            delimiter: ","
        });
        return {readStream, parser};
    }

}
