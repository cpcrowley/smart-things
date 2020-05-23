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
exports.getLocations = getLocations;
exports.deviceFromLabel = deviceFromLabel;
exports.lampCommand = lampCommand;
exports.fetchData = fetchData;


