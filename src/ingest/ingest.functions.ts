import {FileProcessorBuilder} from "./builders/fileProcessorBuilder";
import {RecordConverterTransformer} from "./recordConverter/recordConverter.transformer";
import {PrimaryKeyIndexerTransformer} from "./primaryKeyIndexer/primaryKeyIndexer.transformer";
import {Readable, Writable, Transform} from "node:stream";
import {pipeline} from "node:stream/promises";
import {IndexerTransformer} from "./indexer/indexer.transformer";
import {Collection} from "../types";

export namespace IngestFunctions {

    /**
     * Fills a given collection with records contained on a .csv file
     *
     * @param filePath
     * @param collection
     */
    export function ingest<RecordType>(filePath: string, collection: Collection<RecordType>): Promise<void> {
        const {readStream, parser} = FileProcessorBuilder.build(filePath);
        const recordConverter = RecordConverterTransformer.build(collection.schema);
        const primaryKeyTransformer = PrimaryKeyIndexerTransformer.build(collection);
        const streams: (Readable | Writable | Transform)[] = [readStream, parser, recordConverter, primaryKeyTransformer];
        if (collection.indexes) {
            const keys = Object.keys(collection.indexes);
            for (let indexName of keys) {
                const indexTransformer = IndexerTransformer.build(collection, indexName as keyof RecordType);
                streams.push(indexTransformer);
            }
        }

        return pipeline(streams);
    }

}
