const { SmartThingsClient, BearerTokenAuthenticator } = require('@smartthings/core-sdk');

var listOfAllDevices = null;
var client = null;

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function listOfContactSensors() {
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
async function checkDoorsAndWindows() {
    let sensorList = await listOfContactSensors();
    console.log(`---------------Found ${sensorList.length} contact sensors`);
    sensorList.forEach(async device => {
        let status = await client.devices.getStatus(device.deviceId);
        let openClosed = status.components.main.contactSensor.contact.value;
        if (openClosed == 'open') openClosed = 'OPEN';
        console.log(`${openClosed}: ${device.label}`);
    });
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function init() {
    client = new SmartThingsClient(
        new BearerTokenAuthenticator('d2856d93-cb36-46e2-a49f-c9a4b4b166e9'));
    listOfAllDevices = await fetchData(client);
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function getLocations() {
    return await client.locations.list();
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function fetchData(client) {
    return await client.devices.list()
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
function deviceFromLabel(label, allDevices) {
    return allDevices.find(device => device.label == label);
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
function lampCommand(command) {
    return {
        component: 'main',
        capability: 'switch',
        command: command,
    };
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function turnBackLampOffAndOn() {
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

exports.getLocations = getLocations;
exports.deviceFromLabel = deviceFromLabel;
exports.lampCommand = lampCommand;
exports.fetchData = fetchData;
exports.turnBackLampOffAndOn = turnBackLampOffAndOn;
exports.init = init;
exports.allDevices = listOfAllDevices;
exports.checkDoorsAndWindows = checkDoorsAndWindows;


