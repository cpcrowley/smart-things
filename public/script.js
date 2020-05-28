//*-----------------------------------------------------------------------------
//* Do initial setup
//*-----------------------------------------------------------------------------
const rowOfDevices = document.getElementById("rowOfDevices");
const allSensorsButton = document.getElementById("allSensorsButton");
var deviceList = [];
var contactSensorList = [];
var batteryList = [];
var switchList = [];
var tempList = [];
var waterSensorList = [];
var otherDevicesList = [];

var currentTabButton = allSensorsButton;
let loadingIgnoreButtons = false;

// Fetch the device list
fetch('/devices').then(response => {
    // console.log('111: /devices response', response);
    return response.json();
}).then(devicesInfoList => {
    deviceList = devicesInfoList;
    // console.log('222: /devices: deviceList', deviceList);
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
        if (capIdList.includes('switch')) {
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
    console.log('333: contactSensorList:', contactSensorList);
    // console.log('batteryList:', batteryList);
    // console.log('switchList:', switchList);
    // console.log('waterSensorList:', waterSensorList);
    // console.log('tempList:', tempList);
    // console.log('otherDevicesList:', otherDevicesList);
}).catch(error => {
    console.log('****** fetch call then block ERROR', error);
});

//*-----------------------------------------------------------------------------
//* Define click event handlers for all the buttons.
//*-----------------------------------------------------------------------------
allSensorsButton.addEventListener('click', async () => {
    console.log('allSensorsButton click enter');
    buttonClickHandler(allSensorsButton, contactSensorList, statusInfo => {
        // statusInfo: {device: deviceInfo, status: { contactSensor: "open"}}
        let status = statusInfo.status.contactSensor;
        let label = statusInfo.device.label;
        return `<div class="col deviceCell ${status}">${label} ${status}</div>`;
    });
    console.log('allSensorsButton buttonClickHandler was called');
});

const openSensorsButton = document.getElementById("openSensorsButton");
openSensorsButton.addEventListener('click', async () =>
    buttonClickHandler(openSensorsButton, contactSensorList, statusInfo => {
        // statusInfo: {device: deviceInfo, status: { contactSensor: "open"}}
        let status = statusInfo.status.contactSensor;
        if (status == 'open') {
            let label = statusInfo.device.label;
            return `<div class="col deviceCell open">${label} open</div>`;
        }
        return null;
    }));

const batteriesButton = document.getElementById("batteriesButton");
batteriesButton.addEventListener('click', async () =>
    buttonClickHandler(batteriesButton, batteryList, statusInfo => {
        // statusInfo: {device: deviceInfo, status: { battery: pct}}
        let status = statusInfo.status.battery;
        let label = statusInfo.device.label;
        return `<div class="col deviceCell">${label} ${status}%</div>`;
    }));

const switchesButton = document.getElementById("switchesButton");
switchesButton.addEventListener('click', async () =>
    buttonClickHandler(switchesButton, switchList, statusInfo => {
        // statusInfo: {device: deviceInfo, status: { switch: "on"}}
        let status = statusInfo.status.switch;
        let label = statusInfo.device.label;
        return `<div class="col deviceCell">${label} ${status}</div>`;
    }));

const tempsButton = document.getElementById("tempsButton");
tempsButton.addEventListener('click', async () =>
    buttonClickHandler(tempsButton, tempList, statusInfo => {
        // statusInfo: {device: deviceInfo, status: { temp: degrees"}}
        let status = statusInfo.status.temp;
        let label = statusInfo.device.label;

        return `<div class="col deviceCell">${label} ${temp}</div>`;
    }));

const otherDevicesButton = document.getElementById("otherDevicesButton");
otherDevicesButton.addEventListener('click', async () =>
    buttonClickHandler(otherDevicesButton, otherDevicesList, statusInfo => {
        // statusInfo: {device: deviceInfo, status: { ...}}
        let status = statusInfo.status;
        let label = statusInfo.device.label;

        return `<div class="col deviceCell">${label} ${status}</div>`;
    }));

currentTabButton = tempsButton;
// allSensorsButton.click();

//*-----------------------------------------------------------------------------
//* from: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//*-----------------------------------------------------------------------------
async function postData(url = '', data = {}) {
    let json = JSON.stringify(data);
    console.log('postData: call with', json)
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
    console.log('postData: return with', response);
    json = response.json();
    console.log('postData: return as JSON', json);
    return json; // parses JSON response into native JavaScript objects
}

//*-----------------------------------------------------------------------------
//* button click handler common code.
//*-----------------------------------------------------------------------------
function buttonClickHandler(button, idList, makeHtml) {
    console.log('buttonClickHandler: called idList');
    if (loadingIgnoreButtons) return;

    currentTabButton.classList.remove('active');
    button.classList.add('active');
    currentTabButton = button;
    let savedLabel = button.innerHTML;

    loadingIgnoreButtons = true;
    button.innerHTML = 'Loading...';
    rowOfDevices.innerHTML = `<div class="spinner-border" role="status">
    <span class="sr-only">Loading...</span>
    </div>`;

    console.log('buttonClickHandler: POST /statuses');
    postData('/statuses', { idList: idList }).then(devicesInfoList => {
        console.log('buttonClickHandler: RETURN from POST /statuses',
            devicesInfoList);
        let html = '';
        devicesInfoList.forEach(device => {
            let newHtml = makeHtml(device);
            if (newHtml) html += newHtml;
        });
        rowOfDevices.innerHTML = html;

        button.innerHTML = savedLabel;
        loadingIgnoreButtons = false;
    });
}
