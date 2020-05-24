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
let sensorsList = [];
let sensorsInfo = [];

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
app.get("/devices", (request, response) => {
    // express helps us take JS objects and send them as JSON
    client.devices.list().then(devices => {
        console.log('/devices devices.length:', devices.length)
        devicesList = devices;
        response.json(devices);
    });
});

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
app.get("/sensors", async (request, response) => {
    sensorsInfo = await BackendLib.checkDoorsAndWindows(sensorsList);
    response.json(sensorsInfo);
});

function getETime() {
    let time = new Date().toISOString();
    return time;
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function fetchData() {
    BackendLib.init().then(result => {
        devicesList = result;
        console.log(`fetchData: #deviceList: ${devicesList.length} [${getETime()}]`);
        BackendLib.listOfContactSensors(devicesList).then(async list => {
            sensorsList = list;
            console.log(`fetchData: #sensorList: ${sensorsList.length} [${getETime()}]`);
            sensorsInfo = await BackendLib.checkDoorsAndWindows(sensorsList);
            console.log(`fetchData: #sensorsInfo: ${sensorsInfo.length} [${getETime()}]`,
            sensorsInfo);
        })
    })
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
const listener = app.listen(PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
    fetchData().then(() => {
        // console.log('fetchData finished');
    });
});
