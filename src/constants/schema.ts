export const ModelSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
        userID: {
            type: "integer"
        },
        deviceModel: {
            type: "string"
        },
        operatingSystem: {
            type: "string"
        },
        appUsageTime: {
            type: "integer",
            minimum: 0
        },
        screenOnTime: {
            type: "number",
            minimum: 0
        },
        batteryDrain: {
            type: "integer",
            minimum: 0
        },
        numberOfAppsInstalled: {
            type: "integer",
            minimum: 0
        },
        dataUsage: {
            type: "integer",
            minimum: 0
        },
        age: {
            type: "integer",
            minimum: 0
        },
        gender: {
            type: "string",
            enum: [
                "Male",
                "Female"
            ]
        },
        userBehaviorClass: {
            type: "integer"
        }
    },
    required: [
        "userID",
        "deviceModel",
        "operatingSystem",
        "appUsageTime",
        "screenOnTime",
        "batteryDrain",
        "numberOfAppsInstalled",
        "dataUsage",
        "age",
        "gender",
        "userBehaviorClass"
    ]
} as const;
