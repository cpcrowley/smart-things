let kitchenDoor = {
    "deviceId": "7dfb3583-08d1-439c-a488-a3e9800fbc1c",
    "name": "Z-Wave Door/Window Sensor",
    "label": "Kitchen Door",
    "deviceManufacturerCode": "014A-0004-0002",
    "locationId": "ba7da803-737a-4b71-b04d-66888972b457",
    "roomId": "87c2fe4e-60d3-4484-b8bf-e135dcfa057e",
    "deviceTypeId": "813a1f28-7ec4-4f6a-b5a2-d1ffd8609ca5",
    "deviceTypeName": "Z-Wave Door/Window Sensor",
    "deviceNetworkType": "ZWAVE",
    "components": [
        {
            "id": "main",
            "label": "Kitchen Door",
            "capabilities": [
                {
                    "id": "battery",
                    "version": 1
                },
                {
                    "id": "contactSensor",
                    "version": 1
                },
                {
                    "id": "configuration",
                    "version": 1
                },
                {
                    "id": "sensor",
                    "version": 1
                },
                {
                    "id": "healthCheck",
                    "version": 1
                }
            ]
        }
    ],
    "dth": {
        "deviceTypeId": "813a1f28-7ec4-4f6a-b5a2-d1ffd8609ca5",
        "deviceTypeName": "Z-Wave Door/Window Sensor",
        "deviceNetworkType": "ZWAVE",
        "completedSetup": true,
        "networkSecurityLevel": "UNKNOWN",
        "hubId": "317e7125-c391-478a-8bf8-f694bd632ec6"
    },
    "type": "DTH"
}

let lampBack = {
    "deviceId": "79947361-3b67-49b5-8818-48136063269e",
    "name": "Sengled Element Classic A19",
    "label": "Lamp Back",
    "locationId": "ba7da803-737a-4b71-b04d-66888972b457",
    "roomId": "6236c22c-8ef3-454c-b523-a9f4dc0b0171",
    "deviceTypeId": "52969956-9ba8-46ba-873e-1bb46cfef033",
    "deviceTypeName": "ZigBee Dimmer",
    "deviceNetworkType": "ZIGBEE",
    "components": [
        {
            "id": "main",
            "label": "Lamp Back",
            "capabilities": [
                {
                    "id": "switch",
                    "version": 1
                },
                {
                    "id": "configuration",
                    "version": 1
                },
                {
                    "id": "switchLevel",
                    "version": 1
                },
                {
                    "id": "refresh",
                    "version": 1
                },
                {
                    "id": "actuator",
                    "version": 1
                },
                {
                    "id": "healthCheck",
                    "version": 1
                },
                {
                    "id": "light",
                    "version": 1
                }
            ]
        }
    ],
    "dth": {
        "deviceTypeId": "52969956-9ba8-46ba-873e-1bb46cfef033",
        "deviceTypeName": "ZigBee Dimmer",
        "deviceNetworkType": "ZIGBEE",
        "completedSetup": true,
        "networkSecurityLevel": "UNKNOWN",
        "hubId": "317e7125-c391-478a-8bf8-f694bd632ec6"
    },
    "type": "DTH"
}

let stautsReport = {
    "components": {
        "main": {
            "contactSensor": {
                "contact": {
                    "value": "closed"
                }
            },
            "configuration": {},
            "healthCheck": {
                "checkInterval": {
                    "value": 28920,
                    "unit": "s",
                    "data": {
                        "protocol": "zwave",
                        "hubHardwareId": "000F"
                    }
                },
                "healthStatus": {
                    "value": null,
                    "data": {}
                },
                "DeviceWatch-Enroll": {
                    "value": null
                },
                "DeviceWatch-DeviceStatus": {
                    "value": null, "data": {}
                }
            },
            "sensor": {},
            "battery": {
                "battery": {
                    "value": 99,
                    "unit": "%"
                }
            }
        }
    }
};
