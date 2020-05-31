//*-----------------------------------------------------------------------------
//* Do initial setup
//*-----------------------------------------------------------------------------
const rowOfDevices = document.getElementById("rowOfDevices");
var deviceList = [];
var contactSensorList = [];
var batteryList = [];
var lightList = [];
var switchList = [];
var tempList = [];
var waterSensorList = [];
var alarmList = [];
var otherDevicesList = [];
var idToDevice = {};
var idToLabel = {};

var encodeLabelTable = {
    // Temps
    'Backyard': 'Backyard',
    'Front Porch Temp': 'Porch',
    'Front Screen': 'Front Screen',
    'Leak Crawl Space': 'Crawl Space',
    'Shed': 'Shed',
    // Lights
    'Lamp Back': 'Back Room',
    'Lamp Couch': 'Couch',
    'Lamp Living East': 'Living Window',
    'Lamp Wyn 1': 'Wynette 1',
    'Lamp Wyn 2': 'Wynette 2',
    // Batteries
    'Leak dishwasher': 'Dishwasher',
    'Bath Small North': 'Bath Small',
    'Leak washing machine': 'Washer',
    'Leak Water Heater': 'Water Heater',
    'Z-Wave Water Sensor': 'Water Sensor',
    'Living East Right': 'Living East R',
    'Living East Left': 'Living East L',
    'Bath Big East': 'Bath Big',
    'Back East Right': 'Back East R',
    'Back East Left': 'Back East L',
    // Alarms
    'xxxxx': 'xxxxx',
    'xxxxx': 'xxxxx',
    'xxxxx': 'xxxxx',
    'xxxxx': 'xxxxx',
}

function encodeLabel(label) {
    let codedLabel = encodeLabelTable[label];
    if (codedLabel && codedLabel != label) {
        console.log(`label: ${label} -> ${codedLabel}`)
        return codedLabel;
    }
    return label;
}

var currentTabButton;
let loadingIgnoreButtons = false;

// Fetch the device list
fetch('/devices').then(response => {
    return response.json();
}).then(devicesInfoList => {
    deviceList = devicesInfoList;
    deviceList.forEach(device => {
        idToDevice[device.deviceId] = device;
        device.label = encodeLabel(device.label);
        idToLabel[device.deviceId] = device.label;

        let deviceOnAList = false;
        let capIdList = device.capIdList;
        if (capIdList.includes('contactSensor')) {
            contactSensorList.push(device);
            deviceOnAList = true;
        }
        if (capIdList.includes('battery')) {
            batteryList.push(device);
            deviceOnAList = true;
        }
        if (capIdList.includes('light')) {
            lightList.push(device);
            deviceOnAList = true;
        } else if (capIdList.includes('alarm')) {
            alarmList.push(device);
            deviceOnAList = true;
        } else if (capIdList.includes('switch')) {
            switchList.push(device);

            deviceOnAList = true;
        }
        if (capIdList.includes('waterSensor')) {
            waterSensorList.push(device);
            deviceOnAList = true;
        }
        if (capIdList.includes('temperatureMeasurement')) {
            tempList.push(device);
            deviceOnAList = true;
        }
        if (!deviceOnAList) {
            otherDevicesList.push(device);
        }
    });
    console.log('****** lists completed');

    let byLabel = (a, b) => a.label.localeCompare(b.label);
    contactSensorList.sort(byLabel);
    batteryList.sort(byLabel);
    lightList.sort(byLabel);
    alarmList.sort(byLabel);
    waterSensorList.sort(byLabel);
    tempList.sort(byLabel);
    otherDevicesList.sort(byLabel);

    tempButton.click();
    currentTabButton = tempButton;
}).catch(error => {
    console.log('****** fetch call then block ERROR', error);
});

let cellIndexList = [];



//* Format of "deviceList", "tempList", etc List of these items:
//* postData(data): data: { idList: array of items like deviceListItem }
var deviceListItem = {
    capIdList: ["battery", "contactSensor", "configuration", "sensor"],
    deviceId: "1399abd4-736d-4f6f-b565-68bf6ed04907",
    label: "Front Door",
    name: "Z-Wave Door/Window Sensor",
}
//***** return from postData: List of items like this
var postDataReturnItem = {
    device: deviceListItem,
    status: {
        battery: 50,
        contactSensor: "closed",
        temp: "93&deg;F",
    }
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function onClick(kindIndex, cellIndex) {
    let id = cellIndexList[cellIndex];
    let device = idToDevice[id]
    let cell = document.getElementById(`cell${cellIndex}`);

    console.log('Get info:' + id, device);

    let devicesInfoList = await postData('/statuses', { idList: [device] });
    let statusInfo = devicesInfoList[0];
    console.log('statusInfo: ', statusInfo);

    switch (kindIndex) {
        case 1: //temp: read again
            cell.innerHTML = tempToContents(device.label, statusInfo.status.temp);
            break;
        case 2: //light: toggle and read again
            cell.innerHTML = contents;
            break;
        case 3: //battery: read again
            cell.innerHTML = contents;
            break;
        case 4: //switch: toggle and read again
            cell.innerHTML = contents;
            break;
        case 5: //alarm: toggle and read again
            cell.innerHTML = contents;
            break;
        case 6: //sensor: read again
            cell.innerHTML = contents;
            break;
    }
}

//*-----------------------------------------------------------------------------
//* General: cell, cellContents
//*----------------------------------------- -----------------------------------
function cell(background, kindIndex, id, contents) {
    let cellIndex = cellIndexList.length;
    cellIndexList.push(id);
    return `<div id="cell${cellIndex}" class="col deviceCell ${background}"
    onclick="onClick(${kindIndex},${cellIndex});">
        ${contents}
    </div>`;
}
function cellContents(label, status, statusColor) {
    return `<span class="italic">${label}</span>
    <span class="${statusColor}">${status}</span>`;
}
function statusToHtml(id, label, temp, fn, kindIndex) {
    let contents = fn(label, temp);
    let html = cell('default-background', kindIndex, id, contents);
    return html;
}


//*-----------------------------------------------------------------------------
//* temp
//*-----------------------------------------------------------------------------
function tempToContents(label, temp) {
    let color = parseInt(temp) > 89 ? 'red' : 'blue';
    return cellContents(label, temp, color);
}
function tempStatusToHtml(id, label, temp) {
    let contents = tempToContents(label, temp);
    let html = cell('default-background', 1, id, contents);
    return html;
}
const tempButton = document.getElementById("tempsButton");
tempButton.addEventListener('click', () => {
    return buttonClickHandler(tempButton, tempList, deviceStatus => {
        // deviceStatus: {device: deviceInfo, status: { temp: degrees"}}
        let device = deviceStatus.device;
        return tempStatusToHtml(device.deviceId, device.label,
            deviceStatus.status.temp);
    })
});

//*-----------------------------------------------------------------------------
//* lights
//*-----------------------------------------------------------------------------
function lightsToContents(label, light) {
    let symbol = light == 'on' ? '&#9728;' : '🚫';
    return cellContents(label, symbol, light);
}
function lightsStatusToHtml(id, label, lights) {
    let contents = lightsToContents(label, lights);
    let html = cell(lights, 2, id, contents);
    return html;
}
const lightsButton = document.getElementById("lightsButton");
lightsButton.addEventListener('click', async () => {
    return buttonClickHandler(lightsButton, lightList, deviceStatus => {
        // statusInfo: {device: deviceInfo, status: { lights: degrees"}}
        let device = deviceStatus.device;
        return lightsStatusToHtml(device.deviceId, device.label,
            deviceStatus.status.light);
    })
});

//*-----------------------------------------------------------------------------
//* batteries
//*-----------------------------------------------------------------------------
function batteriesToContents(label, batteries) {
    let percent = parseInt(batteries);
    let color = 'blue';
    if (percent < 50) color = 'red';
    else if (percent < 75) color = 'orange';
    return cellContents(label, batteries, color);
}
function batteriesStatusToHtml(id, label, batteries) {
    let contents = batteriesToContents(label, batteries);
    let html = cell('default-background', 3, id, contents);
    return html;
}
const batteriesButton = document.getElementById("batteriesButton");
batteriesButton.addEventListener('click', async () => {
    return buttonClickHandler(batteriesButton, batteryList, deviceStatus => {
        // statusInfo: {device: deviceInfo, status: { battery: pct}}
        let device = deviceStatus.device;
        return batteriesStatusToHtml(device.deviceId, device.label,
            deviceStatus.status.battery);
    })
});

//*-----------------------------------------------------------------------------
//* switches
//*-----------------------------------------------------------------------------
function switchesToContents(label, switches) {
    let color = parseInt(switches) > 89 ? 'red' : 'blue';
    return cellContents(label, switches, color);
}
function switchesStatusToHtml(id, label, switches) {
    let contents = switchesToContents(label, switches);
    let html = cell('default-background', 4, id, contents);
    return html;
}
const switchesButton = document.getElementById("switchesButton");
switchesButton.addEventListener('click', async () => {
    return buttonClickHandler(switchesButton, switchList, statusInfo => {
        // statusInfo: {device: deviceInfo, status: { switch: "on"}}
        let id = statusInfo.device.deviceId;
        let status = statusInfo.status.switch;
        let label = statusInfo.device.label;
        return cell(status, label, status, 'blue', 4, id);
    })
});

//*-----------------------------------------------------------------------------
//* alarms
//*-----------------------------------------------------------------------------
function alarmsToContents(label, alarms) {
    let color = parseInt(alarms) > 89 ? 'red' : 'blue';
    return cellContents(label, alarms, color);
}
function alarmsStatusToHtml(id, label, alarms) {
    let contents = alarmsToContents(label, alarms);
    let html = cell('default-background', 5, id, contents);
    return html;
}
const alarmsButton = document.getElementById("alarmsButton");
alarmsButton.addEventListener('click', async () => {
    return buttonClickHandler(alarmsButton, alarmList, statusInfo => {
        // statusInfo: {device: deviceInfo, status: { ...}}
        let id = statusInfo.device.deviceId;
        let alarm = statusInfo.status.alarm;
        let symbol = alarm == 'on' ? '🔔' : '🔕';
        let color = 'blue';
        if (alarm == 'on') color = 'red';
        let label = statusInfo.device.label;
        return cell(alarm, label, symbol, color, 5, id);
    })
});

//*-----------------------------------------------------------------------------
//* sensors
//*-----------------------------------------------------------------------------
function sensorsToContents(label, sensors) {
    let color = parseInt(sensors) > 89 ? 'red' : 'blue';
    return cellContents(label, sensors, color);
}
function sensorsStatusToHtml(id, label, sensors) {
    let contents = sensorsToContents(label, sensors);
    let html = cell('default-background', 6, id, contents);
    return html;
}
const sensorsButton = document.getElementById("sensorsButton");
sensorsButton.addEventListener('click', async () => {
    return buttonClickHandler(sensorsButton, contactSensorList, statusInfo => {
        // statusInfo: {device: deviceInfo, status: { contactSensor: "open"}}
        let id = statusInfo.device.deviceId;
        let contactSensor = statusInfo.status.contactSensor;
        let label = statusInfo.device.label;
        // console.log(`sensor ${label} ${contactSensor}`)
        return cell(contactSensor, label, '', 'blue', 6, id);
    })
});


//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
currentTabButton = tempButton;

//*-----------------------------------------------------------------------------
//* from: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//*-----------------------------------------------------------------------------
async function postData(url = '', data = {}) {
    // console.log('postData: call with', data)
    let json = JSON.stringify(data);
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // POST *GET,, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // no-cache *default,, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: json // body data type must match "Content-Type" header
    });
    // console.log('postData: return with', response);
    json = response.json();
    // console.log('postData: return as JSON', json);
    return json; // parses JSON response into native JavaScript objects
}

//*-----------------------------------------------------------------------------
//* button click handler common code.
//*-----------------------------------------------------------------------------
async function buttonClickHandler(button, idList, makeHtml) {
    if (loadingIgnoreButtons) return;
    let msAtStart = new Date().getTime();

    currentTabButton.classList.remove('active');
    button.classList.add('active');
    currentTabButton = button;
    let savedLabel = button.innerHTML;

    loadingIgnoreButtons = true;
    button.innerHTML = 'Loading&hellip;';
    rowOfDevices.innerHTML = `<div class="spinner-border" role="status">
    <span class="sr-only">Loading&hellip;</span>
    </div>`;

    let devicesStatusList = await postData('/statuses', { idList: idList });
    // console.log('postData: return:', devicesInfoList);

    let html = '';
    devicesStatusList.forEach(deviceStatus => {
        deviceStatus.device.label = encodeLabel(deviceStatus.device.label);
        let newHtml = makeHtml(deviceStatus);
        if (newHtml) html += newHtml;
    });
    rowOfDevices.innerHTML = html;

    button.innerHTML = savedLabel;
    loadingIgnoreButtons = false;
    console.log(`Button click: ${new Date().getTime() - msAtStart} ms`);
}
