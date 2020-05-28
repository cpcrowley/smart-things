const { SmartThingsClient, BearerTokenAuthenticator } = require('@smartthings/core-sdk')
const BackendLib = require('./BackendLib.js');
const express = require("express");
const app = express();
const PAT = 'd2856d93-cb36-46e2-a49f-c9a4b4b166e9';
const PORT = 3344;
const client = new SmartThingsClient(new BearerTokenAuthenticator(PAT))
// const client = new SmartThingsClient(new BearerTokenAuthenticator(process.env.PAT))

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
var savedRawDeviceList = null;
var savedDeviceList = null;
var deviceById = {};

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// from: https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
//from: https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
app.post("/statuses", async (request, response) => {
    // console.log(`${getETime()}: /statuses: request.body`, request.body)
    let msAtStart = new Date().getTime();
    let idList = request.body.idList;
    // console.log(`${getETime()}: /statuses; request.body.idList`, idList)
    let result = await getStatusForDevicesById(idList);
    let ms = new Date().getTime() - msAtStart;
    console.log(`${idList.length} getStutus calls in ${ms} ms`);
    response.json(result);
});

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
    response.sendFile(__dirname + "/views/index.html");
});

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
function processDeviceList(l) {
    return l.map(device => {
        let components0 = device.components[0];
        let capabilities = components0.capabilities;
        let capList = [];
        let capIdList = [];
        if (capabilities) {
            capabilities.forEach(cap => {
                capList.push(JSON.stringify(cap));
                capIdList.push(cap.id);
            });
        }
        return {
            deviceId: device.deviceId,
            name: device.name,
            label: device.label,
            capIdList: capIdList,
        };
    })
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function getDeviceList() {
    if (!savedRawDeviceList) {
        let list = await client.devices.list();
        savedLocationId = list[0].locationId;
        savedRawDeviceList = list;
        savedDeviceList = processDeviceList(list);
        savedDeviceList.forEach(device => {
            deviceById[device.deviceId] = device;
        })
    }
    return savedRawDeviceList;
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
app.get("/rawdevices", async (request, response) => {
    console.log(`${getETime()}: /rawdevices called`);
    let dl = await getDeviceList();
    console.log(`${getETime()}: getDeviceList returned, response to /rawdevices sent`);
    response.json(dl);
});

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
app.get("/devices", async (request, response) => {
    // console.log(`${getETime()}: /devices called`);
    let msAtStart = new Date().getTime();
    await getDeviceList();
    let ms = new Date().getTime() - msAtStart;
    console.log(`/devices took ${ms} ms`);
    response.json(savedDeviceList);
});

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function getStatus(id) {
    let status = {};
    if (id) {
        status = await client.devices.getStatus(id);
    }
    // console.log('/status: ', status);
    return status;
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
// app.get("/status", async (request, response) => {
//     response.json(getStatus(request.query.id));
// });

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
// app.get("/sensors", async (request, response) => {
//     let sensorInfo = [];
//     for (let i = 0; i < sensorList.length; ++i) {
//         device = sensorList[i];
//         let status = await client.devices.getStatus(device.deviceId);
//         let openClosed = status.components.main.contactSensor.contact.value;
//         sensorInfo.push([device.label, openClosed]);
//     }
//     response.json(sensorInfo);
// });

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
function getETime() {
    let time = new Date().toISOString();
    return time.substring(17, 23);
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function getDeviceStatus(deviceId) {
    // Do not try to get status for the WC Hub
    if (deviceId == '317e7125-c391-478a-8bf8-f694bd632ec6') return;

    let rawStatus = await getStatus(deviceId);
    let statuses = {};
    if (rawStatus && rawStatus.components && rawStatus.components.main) {
        statuses = rawStatus.components.main;
    }
    let status = {};

    if (statuses.switch && statuses.switch.switch
        && statuses.switch.switch.value)
        status.switch = statuses.switch.switch.value;
    
    if (statuses.contactSensor && statuses.contactSensor.contact
        && statuses.contactSensor.contact.value)
        status.contactSensor = statuses.contactSensor.contact.value;
    
    if (statuses.battery && statuses.battery.battery
        && statuses.battery.battery.value)
        status.battery = statuses.battery.battery.value;
    
    if (statuses.temperatureMeasurement && statuses.temperatureMeasurement.temp
        && statuses.temperatureMeasurement.temp.value)
        status.temp = statuses.temperatureMeasurement.temp.value;
    
    if (statuses.waterSensor && statuses.waterSensor.water
        && statuses.waterSensor.water.value)
        status.waterSensor = statuses.waterSensor.water.value;
    
    return status; 
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function getStatusForDevicesById(listOfDeviceIds) {
    // console.log('getStatusForDevicesById: enter');
    let ret = [];
    for (let i = 0; i < listOfDeviceIds.length; ++i) {
        let deviceId = listOfDeviceIds[i].deviceId;
        // console.log('call getDeviceStatus: ' + deviceId);
        let status = await getDeviceStatus(deviceId);
        // console.log('return getDeviceStatus: ' + deviceId);
        ret.push({
            device: deviceById[deviceId],
            status: status,
        });
    };
    // console.log('getStatusForDevicesById: return', ret);
    return ret;
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
const listener = app.listen(PORT, () => {
    console.log(`${getETime()}: listening on port: ${PORT}`);
    console.log(`${getETime()}: fetchData: start`);
});
