import {Transform, TransformCallback} from "node:stream";
import {RecordConverterFunctions} from "./recordConverter.functions";
import {IndexableTypes, JSONSchema} from "../../types";

export class RecordConverterTransformer<RecordType> extends Transform {

    private readonly propertiesMap: Map<keyof RecordType, IndexableTypes>;

    constructor(private readonly schema: JSONSchema) {
        super({ objectMode: true, highWaterMark: 1024 });
        this.propertiesMap = RecordConverterFunctions.buildSchemaPropertiesTypeMap(this.schema);
    }

    _transform(record: RecordType, _: BufferEncoding, callback: TransformCallback) {
        try {
            const converted = RecordConverterFunctions.convert(record, this.propertiesMap);
            callback(null, converted);
        } catch (error) {
            callback(error as Error);
        }
    }

    static build<RecordType>(schema: JSONSchema): RecordConverterTransformer<RecordType> {
        return new RecordConverterTransformer(schema);
    }
}
