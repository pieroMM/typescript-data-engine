import {setTimeout} from 'timers/promises';
import {config} from "../constants/config";
import {FromSchema} from "json-schema-to-ts";
import {ModelSchema} from "../constants/schema";
import {Collection, IndexableTypes, IndexDescriptor} from "../types";
import {collectionBuilder, ingestData} from "../ingest";

type Model = FromSchema<typeof ModelSchema>;

/**
 * This function is responsible for preparing and starting the data ingestion
 */
export async function setupAndStartIngestion(): Promise<Collection<Model>> {
    const { dataPath, primaryKey, indexes: configIndexes, name} = config;
    const indexes: IndexDescriptor<Model>[] = configIndexes.map(index =>
        ({
            column: {
                name: index.name,
                type: index.type as IndexableTypes
            },
            isUnique: index.isUnique
        })
    );
    const collection = collectionBuilder({
        name,
        schema: ModelSchema,
        primaryKey: {
            name: primaryKey.name,
            type: primaryKey.type as IndexableTypes
        },
        indexes});

    console.clear();
    await setTimeout(500);
    console.log('Starting Data Ingestion for Collection')
    console.time('Data Ingestion Successful');
    await ingestData(dataPath, collection);
    console.timeEnd('Data Ingestion Successful');
    return collection;
}
