const { SmartThingsClient, BearerTokenAuthenticator } = require('@smartthings/core-sdk')
const BackendLib = require('./BackendLib.js');
const express = require("express");
const app = express();
const PAT = 'd2856d93-cb36-46e2-a49f-c9a4b4b166e9';
const PORT = 3344;
const client = new SmartThingsClient(new BearerTokenAuthenticator(PAT))
// const client = new SmartThingsClient(new BearerTokenAuthenticator(process.env.PAT))

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
    response.sendFile(__dirname + "/views/index.html");
});

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
let devicesList = [];
let devicesInfo = [];
let sensorsList = [];
let sensorsInfo = [];

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
app.get("/devices", (request, response) => {
    client.devices.list().then(devices => {
        devicesInfo = devicesList.map(makeDeviceInfo);
        response.json(devicesInfo);
    });
});

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
app.get("/sensors", async (request, response) => {
    sensorsInfo = await BackendLib.checkDoorsAndWindows(sensorsList);
    response.json(sensorsInfo);
});

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
function getETime() {
    let time = new Date().toISOString();
    return time.substring(17, 23);
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
function makeDeviceInfo(device) {
    let cap0id = 'none';
    let cap1id = 'none';
    if (device.components && device.components.length > 0) {
        capabilities = device.components[0].capabilities;
        if (capabilities && capabilities.length > 1) {
            cap0id = capabilities[0].id;
            cap1id = capabilities[1].id;
        }
    }
    return {
        deviceId: device.deviceId,
        name: device.name,
        label: device.label,
        cap0id: cap0id,
        cap1id: cap1id,
    };
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function fetchData() {
    devicesList = await BackendLib.init();
    console.log(`${getETime()}: fetchData: #devicesList: ${devicesList.length}`);
    devicesInfo = devicesList.map(makeDeviceInfo);
    sensorsList = BackendLib.listOfContactSensors(devicesList);
} 

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
const listener = app.listen(PORT, () => {
    console.log(`${getETime()}: fetchData: start`);
    fetchData().then(() => {
        console.log(`${getETime()}: fetchData finished`);
    });
});
