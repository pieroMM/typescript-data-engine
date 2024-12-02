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
