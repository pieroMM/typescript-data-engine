import {Transform, TransformCallback} from "node:stream";
import {Indexer} from "./indexer.functions";
import {Collection} from "../../types";

export class IndexerTransformer<RecordType> extends Transform {

    constructor(private readonly collection: Collection<RecordType>, private readonly indexName: keyof RecordType) {
        super({ objectMode: true, highWaterMark: 1024 });
        }

    _transform(record: RecordType, _: BufferEncoding, callback: TransformCallback) {
        try {
            Indexer.indexRecord(record, this.indexName, this.collection);
            callback(null, record);
        } catch (error) {
            callback(error as Error);
        }
    }

    static build<RecordType>(collection: Collection<RecordType>, indexName: keyof RecordType): IndexerTransformer<RecordType> {
        return new IndexerTransformer(collection, indexName);
    }
}
