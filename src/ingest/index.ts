import {IngestFunctions} from "./ingest.functions"
import {CollectionBuilder} from "./builders/collectionBuilder";
import collectionBuilder = CollectionBuilder.build;
import ingestData = IngestFunctions.ingest;

export { collectionBuilder, ingestData }
