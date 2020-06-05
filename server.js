const { SmartThingsClient, BearerTokenAuthenticator } = require('@smartthings/core-sdk');

const express = require("express");
const app = express();

const PAT = 'd2856d93-cb36-46e2-a49f-c9a4b4b166e9';
const PORT = 3344;
const client = new SmartThingsClient(new BearerTokenAuthenticator(PAT))
// const client = new SmartThingsClient(new BearerTokenAuthenticator(process.env.PAT))
var savedLocationId = null;

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
var savedRawDeviceList = null;
var savedDeviceList = null;
var deviceById = {};

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
// make all the files in 'public' available
app.use(express.static("public"));
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
app.post("/statuses", async (request, response) => {
    // console.log(`${getETime()}: /statuses: request.body`, request.body)
    let msAtStart = new Date().getTime();
    let idList = request.body.idList;
    // console.log(`${getETime()}: /statuses; request.body.idList`, idList)
    let result = await getStatusForDevicesById(idList);
    let ms = new Date().getTime() - msAtStart;
    console.log(`${idList.length} getStatus calls in ${ms} ms`);
    // console.log('/statuses: result:', result);
    response.json(result);
});

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
app.post("/command", (request, response) => {
    // console.log('/command:', request.query);
    let command = {
        capability: request.body.capability,
        command: request.body.command
    }
    // console.log('/command:', command);
    if (request.body.capability) {
        client.devices.executeCommand(request.body.deviceId, command).then(
            status => {
                console.log('/command: response:', status);
                response.json({
                    status: status
                });
            }
        );
    } else {
        response.json({
            status: 777,
            text: 'Bad args'
        });
    }
});

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
app.get("/", (request, response) => {
    response.sendFile(__dirname + "/views/index.html");
});



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
    let msAtStart = new Date().getTime();
    await getDeviceList();
    let ms = new Date().getTime() - msAtStart;
    console.log(`/devices took ${ms} ms`);
    response.json(savedDeviceList);
});

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
app.post("/setMode", async (request, response) => {
    let newModeId = request.body.newModeId;
    console.log(`/setMode call, request.body:`, request.body);
    console.log(`call modes.setCurrent(${newModeId},${savedLocationId})`);
    client.modes.setCurrent(newModeId, savedLocationId).then(status => {
        console.log(`modes.setCurrent returned:`, status);
        response.json({
            status: status
        });
    });
});

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function getDeviceList() {
    if (!savedRawDeviceList) {
        let list = await client.devices.list();
        if (!savedLocationId) {
            savedLocationId = list[0].locationId;
        }
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
app.post("/getMode", async (request, response) => {
    client.modes.getCurrent(savedLocationId).then(ret => {
        console.log('modes.getCurrent:', ret);
        response.json({
            mode: ret.label
        });
    });
});

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
app.get("/modeList", async (request, response) => {
    // console.log('/modeList called: try client.modes.list:', savedLocationId);
    client.modes.list(savedLocationId).then(ret => {
        // console.log('/listModes: modes.list:', ret);
        response.json(ret);
    });
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

    let light = statuses.light;
    if (light && light.switch)
        status.light = light.switch.value; // on/off

    let switchLevel = statuses.switchLevel;
    if (switchLevel && switchLevel.level) // 99%
        status.switchLevel = switchLevel.level.value + switchLevel.level.unit;

    let alarm = statuses.alarm;
    if (alarm && alarm.alarm)
        status.alarm = alarm.alarm.value; // on/off

    let videoCamera = statuses.videoCamera;
    if (videoCamera && videoCamera.camera)
        status.videoCamera = videoCamera.camera.value; // on/off

    let musicPlayer = statuses.musicPlayer;
    if (musicPlayer && musicPlayer.status)
        status.musicPlayer = musicPlayer.status.value; // on/off

    let switchValue = statuses.switch;
    if (switchValue && switchValue.switch)
        status.switch = switchValue.switch.value;

    let contactSensor = statuses.contactSensor;
    if (contactSensor && contactSensor.contact)
        status.contactSensor = contactSensor.contact.value;

    let battery = statuses.battery;
    if (battery && battery.battery)
        status.battery = battery.battery.value;

    let temperatureMeasurement = statuses.temperatureMeasurement;
    if (temperatureMeasurement) {
        let temp = temperatureMeasurement.temperature;
        status.temp = temp.value + '&deg;' + temp.unit;
    }

    let waterSensor = statuses.waterSensor;
    if (waterSensor && waterSensor.water)
        status.waterSensor = waterSensor.water.value;
    console.log('-------device', status);
    return status;
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function getStatusForDevicesById(listOfDeviceIds) {
    // console.log('getStatusForDevicesById: list', listOfDeviceIds);
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
