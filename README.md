# Typescript Data Engine

**Brief Description:**
A simplified query engine written with Typescript for a small in memory dataset.
## Table of Contents
* **Installation:**
    * **Requirements:**
        * NodeJs v20.18.0
        * Npm v10.8.2
    * **Instructions:**
        * Install dependencies: ``npm install``
        * Build: ``npm run build``
        * Run: ``npm run start``
    * **Unit Tests:**
        * ``npm run test``
  * **Usage:** 
    * Once the ingest phase has completed, the user can type a query.
    * Typing the command ``exit`` the session terminates.
    * Any query can be composed using the following grammar:
        ````
      Query = Project Filter | Project | Filter
 
      Number = digit* "." digit+ | digit+
  
      String = "\""alnum+"\""

      columnName = ("0".."9"|"a".."z"|"A".."Z"|"-"|"_")+

      Columns = ListOf<columnName, ",">

      Project = ("PROJECT" | "Project" | "project") Columns

      Filter = ("FILTER" | "Filter" | "filter") FilterPredicate

      FilterPredicate = columnName "<" String
        | columnName ">" String
        | columnName "=" String
        | columnName "<" Number
        | columnName ">" Number
        | columnName "=" Number
 
* **Examples:**
    * ``PROJECT operatingSystem, appUsageTime FILTER userID > 500``
    * ``PROJECT deviceModel, batteryDrain, screenOnTime``
    * ``PROJECT userID, operatingSystem, numberOfAppsInstalled``
    * ``FILTER userID > 500``
    * ``FILTER deviceModel = "Google Pixel 5"``
    * ``FILTER deviceModel > "iPhone"``

* **Modules:**
    * **Ingest:** loads data into memory, convert numeric fields, create primary key and indexes
    * **Parser:** parse and validate user-defined queries
    * **Engine:** executes queries
    * **Orchestrator:** starts up the system and handle the user interaction

  * **Q&A:**
      * **What were some of the tradeoffs you made when building this and why were these acceptable tradeoffs?**
      
        The main tradeoff is a consequence of the choice of the data structure that stores all records in memory. I choose a B+Tree implementation where the key is the value of the primary key and the value is the record.
        
        Respect to an hashmap, the direct selection (achieved filtering by the primary key and the "=" comparator), is less efficient (O(1) vs. O(log n)), but the selection via ">" and "<" comparators is more beneficial, O(n) vs. O(log n).
      
        Moreover, even indexes are implemented using B+Trees, and every selection made using an indexed column requires the following steps:
        * Get the related key (or keys in case of non-unique indexes) from the specific index B+Tree
        * Get the record from the main B+Tree
        * Apply the projection (if required)
        
        The cost of the sequence is O(log n) and is more efficient respect the same use case implemented using an hash map (which requires O(n) complexity).
        
        Another use case consists on a filter made using a non-indexed column, in this case the only solution is scanning all the B+Tree entries.
      
      * **Given more time, what improvements or optimizations would you want to add? When would you add them?**
  
        The first improvement is related with the user interface which is poor and uses the console object. To improving the user experience is possible using a library like [terminal-kit](https://www.npmjs.com/package/terminal-kit).
        
        Another point is related with the error messages, at the moment all syntactic error messages are the same returned by the parsing library.
        
        Currently, the ingestion is made using a Node.js stream pipeline, instead of handling the backpressure I've just set the high-watermark large then the starting data setsize.
    
        Errors that can happen while the pipeline is processing should be handled properly.
        
        A first optimization can consist on using a direct access cache for most recently used data, or for storing the result of the queries most recent. I think I'll try to implement it soon on a separate branch.

      * **What changes are needed to accommodate changes to support other data types, multiple filters, or ordering of results?**

        To handle other types we need to add a new clause to the query language in order to be able to specify the collection name (like the "FROM" clause on SQL).
        
        After that, we just need to create a new configuration object for the new collection, provide the related JSONSchema and run another ingestion pipeline.
        
        Even for other features, the first step is modify the grammar and the related semantics.
        
        Then we need to extend some descriptors in order to keep these new infos.
        
        After that, the query executor has to be modified to apply more complex predicates to each record or to traverse the tree in a way that depends by the order provided (if the order criteria is based on a primary key or on an index).
    
      * **What changes are needed to process extremely large datasets?**
    
          Probably we can't rely anymore on an all in-memory approach. We should organize data on the disk and change the semantic of the primary key B+Tree. The key will stay the same, but the values will switch from the record to a specific disk resource that contains the record which the key belongs. We even need a cache mechanism in order to keep in memory the LRU resources, otherwise the performance will degrade.
      
          The ingestion pipeline will change in order to populate the PK B+Tree in the proper way and transform the processed csv records and persist the result.
    
      * **What do you still need to do to make this code production ready?**
  
         Increase the test coverage providing unit tests for some corner case, integration tests and event testing the streaming part.
         
         Improve the user interface, making it more robust and providing a more complete error handler.
         
         Do some load testing and monitor the resources consumption using some specific tools such as memory profiler, GC traces and trace-event .
    
      
