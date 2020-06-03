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

//*-----------------------------------------------------------------------------
//* make names shorter
//*-----------------------------------------------------------------------------
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

//*-----------------------------------------------------------------------------
//* look up names in the above table.
//*-----------------------------------------------------------------------------
function encodeLabel(label) {
    let codedLabel = encodeLabelTable[label];
    if (codedLabel && codedLabel != label) {
        // console.log(`${label} --> ${codedLabel}`)
        return codedLabel;
    }
    return label;
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
var currentTabButton;
let loadingIgnoreButtons = false;

//*-----------------------------------------------------------------------------
//* Fetch the device list
//*-----------------------------------------------------------------------------
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

    let byLabel = (a, b) => a.label.localeCompare(b.label);
    contactSensorList.sort(byLabel);
    batteryList.sort(byLabel);
    lightList.sort(byLabel);
    alarmList.sort(byLabel);
    waterSensorList.sort(byLabel);
    tempList.sort(byLabel);
    otherDevicesList.sort(byLabel);
    console.log('lists completed');

    tempButton.click();
    currentTabButton = tempButton;
}).catch(error => {
    console.log('****** fetch call then block ERROR', error);
});

let cellIndexList = [];


//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
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
//*----------------------------------------- -----------------------------------
function cellContents(device, value, kindInfo) {
    return `
<div class="${kindInfo('backgroundClass', value)}">
<span class="italic">${encodeLabel(device.label)}</span>
<span class="${kindInfo('valueClass', value)}">${kindInfo('value', value)}</span>
</div>
`;
}

//*----------------------------------------- -----------------------------------
//*----------------------------------------- -----------------------------------
function statusToHtml(device, value, kindInfo, kindIndex) {
    let cellIndex = cellIndexList.length;
    cellIndexList.push(device.deviceId);
    let ret = `
<div id="cell${cellIndex}" class="col deviceCell"
onclick="onClick(${kindIndex},${cellIndex});">
    ${cellContents(device, value, kindInfo)}
</div>
`;
    return ret;
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function onClick(kindIndex, cellIndex) {
    let deviceId = cellIndexList[cellIndex];
    let device = idToDevice[deviceId]
    let cell = document.getElementById(`cell${cellIndex}`);

    let devicesInfoList = await postData('/statuses', { idList: [device] });
    let statusInfo = devicesInfoList[0];
    let innerHTML, args, response, currentStatus, toggledStatus;

    switch (kindIndex) {
        case 1: //temp: read again
            innerHTML = cellContents(statusInfo.device,
                statusInfo.status.temp, tempInfo);
            break;
        case 2: //light: toggle and read again
            currentStatus = statusInfo.status.light;
            toggledStatus = currentStatus == 'on' ? 'off' : 'on';
            innerHTML = cellContents(statusInfo.device, toggledStatus, lightInfo);
            args = {
                deviceId: deviceId,
                capability: "switch",
                command: toggledStatus 
            };
            console.log('call /command:', args);
            response = await postData('/command', args);
            console.log('response:', response);
            break;
        case 3: //battery: read again
            innerHTML = cellContents(statusInfo.device,
                statusInfo.status.battery, batteryInfo);
            break;
        // case 4: //switch: toggle and read again
        //     innerHTML = cellContents(statusInfo.device,
        //         statusInfo.status.light, lightsInfo);
        //     break;
        case 5: //alarm: toggle and read again
            innerHTML = cellContents(statusInfo.device,
                statusInfo.status.alarm, alarmInfo);
            break;
        case 6: //sensor: read again
            innerHTML = cellContents(statusInfo.device,
                statusInfo.status.contactSensor, sensorInfo);
            break;
    }
    cell.innerHTML = innerHTML;
}

//*-----------------------------------------------------------------------------
//* temp
//*-----------------------------------------------------------------------------
function tempInfo(kind, value) {
    switch (kind) {
        case 'value': return value;
        case 'valueClass': return parseInt(value) > 89 ? 'red' : 'blue';
        case 'backgroundClass': return 'default-background';
        default: return null;
    }
}
const tempButton = document.getElementById("tempsButton");
tempButton.addEventListener('click', () => {
    return buttonClickHandler(tempButton, tempList, deviceStatus => {
        return statusToHtml(deviceStatus.device,
            deviceStatus.status.temp, tempInfo, 1);
    })
});

//*-----------------------------------------------------------------------------
//* light
//*-----------------------------------------------------------------------------
function lightInfo(kind, value) {
    switch (kind) {
        case 'value': return value == 'on' ? '&#9728;' : '🚫';
        case 'valueClass': return value;
        case 'backgroundClass': return value;
        default: return null;
    }
}
const lightButton = document.getElementById("lightsButton");
lightButton.addEventListener('click', async () => {
    return buttonClickHandler(lightButton, lightList, deviceStatus => {
        return statusToHtml(deviceStatus.device,
            deviceStatus.status.light, lightInfo, 2);
    })
});

//*-----------------------------------------------------------------------------
//* battery
//*-----------------------------------------------------------------------------
function batteryInfo(kind, value) {
    let percent = parseInt(value);
    switch (kind) {
        case 'value': return value;
        case 'valueClass': return percent < 50 ? 'red'
            : (percent < 75 ? 'orange' : 'blue');
        case 'backgroundClass': return 'default-background';
        default: return null;
    }
}
const batteryButton = document.getElementById("batteriesButton");
batteryButton.addEventListener('click', async () => {
    return buttonClickHandler(batteryButton, batteryList, deviceStatus => {
        return statusToHtml(deviceStatus.device,
            deviceStatus.status.battery, batteryInfo, 3);
    })
});

//*-----------------------------------------------------------------------------
//* alarm
//*-----------------------------------------------------------------------------
function alarmInfo(kind, value) {
    switch (kind) {
        case 'value': return value == 'on' ? '🔔' : '🔕';
        case 'valueClass': return 'blue';
        case 'backgroundClass': return 'default-background';
        default: return null;
    }
}
const alarmButton = document.getElementById("alarmsButton");
alarmsButton.addEventListener('click', async () => {
    return buttonClickHandler(alarmButton, alarmList, deviceStatus => {
        return statusToHtml(deviceStatus.device,
            deviceStatus.status.alarm, alarmInfo, 5);
    })
});


//*-----------------------------------------------------------------------------
//* sensor
//*-----------------------------------------------------------------------------
function sensorInfo(kind, value) {
    switch (kind) {
        case 'value': return value;
        case 'valueClass': return 'blue';
        case 'backgroundClass': return value;
        default: return null;
    }
}
const sensorsButton = document.getElementById("sensorsButton");
sensorsButton.addEventListener('click', async () => {
    return buttonClickHandler(sensorsButton, contactSensorList, deviceStatus => {
        return statusToHtml(deviceStatus.device,
            deviceStatus.status.contactSensor, sensorInfo, 6);
    })
});


//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
currentTabButton = tempButton;

//*-----------------------------------------------------------------------------
//* from: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//*-----------------------------------------------------------------------------
async function postData(url = '', data = {}) {
    let json = JSON.stringify(data);
    // Default options are marked with *
    // console.log(`call postData: ${json}`);
    let response = { status: 99, text: 'none' };
    try {
        response = await fetch(url, {
            method: 'POST',
            // POST *GET,, PUT, DELETE, etc.
            mode: 'cors',
            // no-cors, *cors, same-origin
            cache: 'no-cache',
            // no-cache *default,, reload, force-cache, only-if-cached
            credentials: 'same-origin',
            // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow',
            // manual, *follow, error
            referrerPolicy: 'no-referrer',
            // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: json
            // body data type must match "Content-Type" header
        });
    } catch (error) {
        console.log(`ERROR postData: ${error}`, error);
        response = { status: 88, text: error.toString() };
    }
    json = response.json();
    // console.log(`return postData: ${json}`);

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

    let html = '';
    devicesStatusList.forEach(deviceStatus => {
        console.log('deviceStatus:', deviceStatus);
        deviceStatus.device.label = encodeLabel(deviceStatus.device.label);
        let newHtml = makeHtml(deviceStatus);
        if (newHtml) html += newHtml;
    });
    rowOfDevices.innerHTML = html;

    button.innerHTML = savedLabel;
    loadingIgnoreButtons = false;
    console.log(`Button click: ${new Date().getTime() - msAtStart} ms`);
}
