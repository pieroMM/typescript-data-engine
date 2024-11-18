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
        }
    ]
};
