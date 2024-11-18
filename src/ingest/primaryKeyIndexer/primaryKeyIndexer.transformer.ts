import {Transform, TransformCallback} from "node:stream";
import {PrimaryKeyIndexer} from "./primaryKeyIndexer.functions";
import {Collection} from "../../types";

export class PrimaryKeyIndexerTransformer<RecordType> extends Transform {

    constructor(private readonly collection: Collection<RecordType>) {
        super({objectMode: true, highWaterMark: 1024 });
    }

    _transform(record: RecordType, _: BufferEncoding, callback: TransformCallback) {
        try {
            PrimaryKeyIndexer.indexPrimaryKey(record, this.collection);
            callback(null, record);
        } catch (error) {
            callback(error as Error);
        }
    }

    static build<RecordType>(collection: Collection<RecordType>): PrimaryKeyIndexerTransformer<RecordType> {
        return new PrimaryKeyIndexerTransformer(collection);
    }
}
