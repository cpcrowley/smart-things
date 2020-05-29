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

var currentTabButton;
let loadingIgnoreButtons = false;

// Fetch the device list
fetch('/devices').then(response => {
    return response.json();
}).then(devicesInfoList => {
    deviceList = devicesInfoList;
    deviceList.forEach(device => {
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

    tempsButton.click();
    currentTabButton = tempsButton;
}).catch(error => {
    console.log('****** fetch call then block ERROR', error);
});

let idIndexList = [];

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
function cell(background, label, status, statusColor, kindIndex, onClickId) {
    if (!status) status = '';
    if (!statusColor) statusColor = 'blue';
    let idIndex = idIndexList.length;
    idIndexList.push(onClickId);

    return `<div class="col deviceCell ${background}"
    onclick="onClick(${kindIndex},${idIndex});">
        <span class="italic">${label}</span>
        <span class="${statusColor}">${status}</span> 
    </div>`;
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
function onClick(kindIndex, idIndex) {
    console.log(`***** onClick: ${kindIndex}: ${idIndex}`);
    let kind = 'NONE';
    switch (kindIndex) {
        case 1: kind = 'temp'; break;
        case 2: kind = 'light'; break;
        case 3: kind = 'battery'; break;
        case 4: kind = 'switch'; break;
        case 5: kind = 'alarm'; break;
        case 6: kind = 'sensor'; break;
    }
    let id = idIndexList[idIndex];
    console.log(`***** onClick: ${kind}: ${id}`);
}

/*
temp = 1
*/

//*-----------------------------------------------------------------------------
//* Define click event handlers for all the buttons.
//*-----------------------------------------------------------------------------
const tempsButton = document.getElementById("tempsButton");
tempsButton.addEventListener('click', async () =>
    buttonClickHandler(tempsButton, tempList, statusInfo => {
        // statusInfo: {device: deviceInfo, status: { temp: degrees"}}
        let id = statusInfo.device.deviceId;
        let temp = statusInfo.status.temp;
        let color = parseInt(temp) > 89 ? 'red' : 'blue';
        let label = statusInfo.device.label;
        let html = cell('default-background', label, temp, color, 1, id);
        return html;
    }));

const lightsButton = document.getElementById("lightsButton");
lightsButton.addEventListener('click', async () =>
    buttonClickHandler(tempsButton, lightList, statusInfo => {
        // statusInfo: {device: deviceInfo, status: { temp: degrees"}}
        let id = statusInfo.device.deviceId;
        let light = statusInfo.status.light;
        let symbol = light == 'on' ? '&#9728;' : '🚫';
        let label = statusInfo.device.label;
        return cell(light, label, symbol, 'blue', 2, id);
    }));

const batteriesButton = document.getElementById("batteriesButton");
batteriesButton.addEventListener('click', async () =>
    buttonClickHandler(batteriesButton, batteryList, statusInfo => {
        // statusInfo: {device: deviceInfo, status: { battery: pct}}
        let id = statusInfo.device.deviceId;
        let status = statusInfo.status.battery;
        let pc = parseInt(status);
        let color = 'blue';
        if (pc < 50) color = 'red';
        else if (pc < 75) color = 'orange';
        let label = statusInfo.device.label;
        return cell('default-background', label, status + '%', color, 3, id);
    }));

const switchesButton = document.getElementById("switchesButton");
switchesButton.addEventListener('click', async () =>
    buttonClickHandler(switchesButton, switchList, statusInfo => {
        // statusInfo: {device: deviceInfo, status: { switch: "on"}}
        let id = statusInfo.device.deviceId;
        let status = statusInfo.status.switch;
        let label = statusInfo.device.label;
        return cell(status, label, status, 'blue', 4, id);
    }));

const alarmsButton = document.getElementById("alarmsButton");
alarmsButton.addEventListener('click', async () =>
    buttonClickHandler(alarmsButton, alarmList, statusInfo => {
        // statusInfo: {device: deviceInfo, status: { ...}}
        let id = statusInfo.device.deviceId;
        let alarm = statusInfo.status.alarm;
        let symbol = alarm == 'on' ? '🔔' : '🔕';
        let color = 'blue';
        if (alarm == 'on') color = 'red';
        let label = statusInfo.device.label;
        return cell(alarm, label, symbol, color, 5, id);
    }));

const sensorsButton = document.getElementById("sensorsButton");
sensorsButton.addEventListener('click', async () =>
    buttonClickHandler(sensorsButton, contactSensorList, statusInfo => {
        // statusInfo: {device: deviceInfo, status: { contactSensor: "open"}}
        let id = statusInfo.device.deviceId;
        let contactSensor = statusInfo.status.contactSensor;
        let label = statusInfo.device.label;
        // console.log(`sensor ${label} ${contactSensor}`)
        return cell(contactSensor, label, '', 'blue', 6, id);
    }));

currentTabButton = tempsButton;

//*-----------------------------------------------------------------------------
//* from: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//*-----------------------------------------------------------------------------
async function postData(url = '', data = {}) {
    let json = JSON.stringify(data);
    // console.log('postData: call with', json)
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

    let devicesInfoList = await postData('/statuses', { idList: idList });

    let html = '';
    devicesInfoList.forEach(device => {
        let newHtml = makeHtml(device);
        if (newHtml) html += newHtml;
    });
    rowOfDevices.innerHTML = html;

    button.innerHTML = savedLabel;
    loadingIgnoreButtons = false;
    console.log(`Button click: ${new Date().getTime() - msAtStart} ms`);
}
