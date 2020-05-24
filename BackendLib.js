const { SmartThingsClient, BearerTokenAuthenticator } = require('@smartthings/core-sdk');

var client = null;

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
exports.init = async () => {
    client = new SmartThingsClient(
        new BearerTokenAuthenticator('d2856d93-cb36-46e2-a49f-c9a4b4b166e9'));
    listOfAllDevices = await fetchData(client);
    return listOfAllDevices
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
exports.listOfContactSensors = async (listOfAllDevices) => {
    let sensorList = [];
    listOfAllDevices.forEach(device => {
        let components = device.components;
        if (components && components.length > 0) {
            let comp0 = components[0];
            let caps = comp0.capabilities;
            if (caps) {
                caps.forEach(cap => {
                    if (cap.id == 'contactSensor') sensorList.push(device);
                });
            }
        }
    });
    return sensorList;
}
//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
exports.checkDoorsAndWindows = async (sensorList) => {
    // console.log('checkDoorsAndWindows: enter');
    let info = [];
    for (let i = 0; i < sensorList.length; ++i) {
        device = sensorList[i];
        // console.log('sensor: ' + device.label);
        let status = await client.devices.getStatus(device.deviceId);
        let openClosed = status.components.main.contactSensor.contact.value;
        info.push([device.label, openClosed]);
    }
    // console.log('checkDoorsAndWindows: exit', info);
    return info;
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
fetchData = async (client) => {
    return await client.devices.list()
}
exports.fetchData = fetchData


//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
exports.getLocations = async () => {
    return await client.locations.list();
}


//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
exports.deviceFromLabel = (label, allDevices) => {
    return allDevices.find(device => device.label == label);
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
exports.lampCommand = (command) => {
    return {
        component: 'main',
        capability: 'switch',
        command: command,
    };
}

exports.listDeviceLabels = (deviceList) => {
    let list = [];
    deviceList.forEach(device => list.push(device.label))
    return list;
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
exports.turnBackLampOffAndOn = async () => {
    let lampBackInfo = deviceFromLabel('Lamp Back', listOfAllDevices);
    let lampBackId = lampBackInfo.deviceId;
    console.log('Turn lamp off');
    await client.devices.executeCommand(lampBackId, lampCommand('off'));
    console.log('Turn lamp on in 1 second');
    setTimeout(() => {
        console.log('Turn lamp on');
        client.devices.executeCommand(lampBackId, lampCommand('on'));
    }, 1000);
}


