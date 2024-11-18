export const config =  {
    dataPath: "assets/data.csv",
    name: "userBehavior",
    primaryKey: {
        name: "userID",
        type: "integer"
    },
    indexes: [
        {
            name: "appUsageTime",
            type: "integer",
            isUnique: false
        },
        {
            name: "screenOnTime",
            type: "integer",
            isUnique: false
        },
        {
            name: "batteryDrain",
            type: "integer",
            isUnique: false
        },
        {
            name: "numberOfAppsInstalled",
            type: "integer",
            isUnique: false
        },
        {
            name: "dataUsage",
            type: "integer",
            isUnique: false
        },
        {
            name: "age",
            type: "integer",
            isUnique: false
        },
        {
            name: "operatingSystem",
            type: "string",
            isUnique: false
        }
    ]
};
