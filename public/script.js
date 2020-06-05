//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
const rowOfDevices = document.getElementById("rowOfDevices");
var deviceList = [];
var contactSensorList = [];
var batteryList = [];
var lightList = [];
var switchList = [];
var tempList = [];
var modeList = [];
var waterSensorList = [];
var alarmList = [];
var otherDevicesList = [];
var idToDevice = {};
var idToLabel = {};
var currentTabButton;
let loadingIgnoreButtons = false;
let cellIndexList = [];

//*-----------------------------------------------------------------------------
//* Initialization
//*-----------------------------------------------------------------------------

//* Fetch the device list
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

    fetch('/modeList').then(response => {
        let json = response.json();
        return json;
    }).then(rawModelist => {
        // console.log('/modeList: rawModelist:', rawModelist);
        modeList = [];
        rawModelist.forEach(item => {
            let deviceId = item.id;
            let device = { label: item.label, deviceId: deviceId };
            idToDevice[deviceId] = device;
            modeList.push(device);
        });
        // console.log('/modeList --> modeList', modeList)
        currentTabButton = modeButton;
        modeButton.click();
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

}).catch(error => {
    console.log('****** fetch call then block ERROR', error);
});

const ModeIndex = 7;
const DoorsAndWindowIndex = 6;
const AlarmIndex = 5;
const WaterSensorIndex = 4;
const BatteryIndex = 3;
const LightIndex = 2;
const TempIndex = 1;

//*----------------------------------------- -----------------------------------
//*----------------------------------------- -----------------------------------
function statusToHtml(device, value, kindInfo, kindIndex) {
    let cellIndex = cellIndexList.length;
    cellIndexList.push(device.deviceId);
    let backgroundClass = kindInfo('backgroundClass', value, device);
    let ret = `
<div id="cell${cellIndex}" class="rowCell ${backgroundClass}"
        onclick="onClick(${kindIndex},${cellIndex});">
    <span class="italic">
        ${encodeLabel(device.label)}
    </span>
    <br/>
    <span class="${kindInfo('valueClass', value, device)}">
            ${kindInfo('value', value, device)}
    </span>
</div>
`;
    return ret;
}
function statusToHtmlBootstrap(device, value, kindInfo, kindIndex) {
    let cellIndex = cellIndexList.length;
    cellIndexList.push(device.deviceId);
    let ret = `
<div id="cell${cellIndex}" class="col deviceCell"
        onclick="onClick(${kindIndex},${cellIndex});">
    <div class="buttonCell ${kindInfo('backgroundClass', value, device)}">
        <span class="italic">
            ${encodeLabel(device.label)}
        </span>
        <span class="${kindInfo('valueClass', value, device)}">
                ${kindInfo('value', value, device)}
        </span>
    </div>
</div>
`;
    return ret;
}


//*-----------------------------------------------------------------------------
//* general handler for all clicks on cells.
//*-----------------------------------------------------------------------------
async function onClick(kindIndex, cellIndex) {
    let deviceId = cellIndexList[cellIndex];
    let device = idToDevice[deviceId];

    let devicesInfoList;
    let statusInfo;
    if (kindIndex == ModeIndex) {
        statusInfo = await postData('/getMode', {});
    } else {
        devicesInfoList = await postData('/statuses', { idList: [device] });
        statusInfo = devicesInfoList[0];
    }

    // let args, currentStatus, toggledStatus;

    switch (kindIndex) {
        case ModeIndex: // set mode
            args = { newModeId: device.deviceId };
            await postData('/setMode', args);
            modeButton.click();
            break;
        case TempIndex: // read again
            tempButton.click();
            break;
        case LightIndex: // toggle and read again
            currentStatus = statusInfo.status.light;
            toggledStatus = currentStatus == 'on' ? 'off' : 'on';
            args = {
                deviceId: deviceId,
                capability: "switch",
                command: toggledStatus
            };
            response = await postData('/command', args);
            lightButton.click();
            break;
        case BatteryIndex: // read again
            batteryButton.click();
            break;
        case AlarmIndex: // toggle and read again
            alarmButton.click();
            break;
        case DoorsAndWindowIndex: // read again
            doorAndWindowButton.click();
            break;
        case WaterSensorIndex: // read again
            waterSensorButton.click();
            break;
    }
}

//*-----------------------------------------------------------------------------
//* mode
//*-----------------------------------------------------------------------------
function modeInfo(kind, value, device) {
    let isCurrentMode = device.label == value;
    switch (kind) {
        case 'value': return '';
        case 'valueClass':
            return isCurrentMode ? 'boldWeight' : 'normalWeight';
        case 'backgroundClass':
            return isCurrentMode ? 'on' : 'default-background';
        default: return null;
    }
}
const modeButton = document.getElementById("modeButton");
modeButton.addEventListener('click', () => {
    return buttonClickHandler(modeButton, modeList, deviceStatus => {
        return statusToHtml(deviceStatus.device,
            deviceStatus.status.mode, modeInfo, ModeIndex);
    })
});

//*-----------------------------------------------------------------------------
//* temp
//*-----------------------------------------------------------------------------
function tempInfo(kind, value) {
    switch (kind) {
        case 'value': return value || 'offline';
        case 'valueClass': return parseInt(value) > 89 ? 'red' : 'blue';
        case 'backgroundClass': return 'default-background';
        default: return null;
    }
}
const tempButton = document.getElementById("tempButton");
tempButton.addEventListener('click', () => {
    return buttonClickHandler(tempButton, tempList, deviceStatus => {
        return statusToHtml(deviceStatus.device,
            deviceStatus.status.temp, tempInfo, TempIndex);
    })
});

//*-----------------------------------------------------------------------------
//* light
//*-----------------------------------------------------------------------------
function lightInfo(kind, value) {
    switch (kind) {
        case 'value': return value || 'offline'; //value == 'on' ? '&#9728;' : '🚫';
        case 'valueClass': return value;
        case 'backgroundClass': return value;
        default: return null;
    }
}
const lightButton = document.getElementById("lightButton");
lightButton.addEventListener('click', async () => {
    return buttonClickHandler(lightButton, lightList, deviceStatus => {
        return statusToHtml(deviceStatus.device,
            deviceStatus.status.light, lightInfo, LightIndex);
    })
});

//*-----------------------------------------------------------------------------
//* battery
//*-----------------------------------------------------------------------------
function batteryInfo(kind, value) {
    let percent = parseInt(value);
    switch (kind) {
        case 'value': return value || 'offline';
        case 'valueClass': return percent < 50 ? 'red'
            : (percent < 75 ? 'orange' : 'blue');
        case 'backgroundClass': return 'default-background';
        default: return null;
    }
}
const batteryButton = document.getElementById("batteryButton");
batteryButton.addEventListener('click', async () => {
    return buttonClickHandler(batteryButton, batteryList, deviceStatus => {
        return statusToHtml(deviceStatus.device,
            deviceStatus.status.battery, batteryInfo, BatteryIndex);
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
const alarmButton = document.getElementById("alarmButton");
alarmButton.addEventListener('click', async () => {
    return buttonClickHandler(alarmButton, alarmList, deviceStatus => {
        return statusToHtml(deviceStatus.device,
            deviceStatus.status.alarm, alarmInfo, AlarmIndex);
    })
});


//*-----------------------------------------------------------------------------
//* contactSensor
//*-----------------------------------------------------------------------------
function sensorInfo(kind, value) {
    switch (kind) {
        case 'value': return value || 'offline';
        case 'valueClass': return 'blue';
        case 'backgroundClass': return value;
        default: return null;
    }
}
const doorAndWindowButton = document.getElementById("sensorButton");
doorAndWindowButton.addEventListener('click', async () => {
    return buttonClickHandler(doorAndWindowButton, contactSensorList, deviceStatus => {
        return statusToHtml(deviceStatus.device,
            deviceStatus.status.contactSensor, sensorInfo, DoorsAndWindowIndex);
    })
});

//*-----------------------------------------------------------------------------
//* waterSensor
//*-----------------------------------------------------------------------------
function waterSensorInfo(kind, value) {
    switch (kind) {
        case 'value': return value || 'offline';
        case 'valueClass': return 'blue';
        case 'backgroundClass': return value || 'dry';
        default: return null;
    }
}
const waterSensorButton = document.getElementById("waterSensorButton");
waterSensorButton.addEventListener('click', async () => {
    return buttonClickHandler(waterSensorButton, waterSensorList, deviceStatus => {
        return statusToHtml(deviceStatus.device,
            deviceStatus.status.waterSensor, waterSensorInfo, WaterSensorIndex);
    })
});


//*-----------------------------------------------------------------------------
//* button click handler common code.
//*-----------------------------------------------------------------------------
async function buttonClickHandler(button, idList, makeHtml) {
    cellIndexList = [];
    if (loadingIgnoreButtons) return;
    let msAtStart = new Date().getTime();

    if (currentTabButton) {
        currentTabButton.classList.remove('active');
    }
    button.classList.add('active');
    currentTabButton = button;
    let savedLabel = button.innerHTML;

    loadingIgnoreButtons = true;
    button.innerHTML = 'Loading&hellip;';
    rowOfDevices.innerHTML = `<div class="spinner-border" role="status">
    <span class="sr-only">Loading&hellip;</span>
    </div>`;

    let devicesStatusList;
    if (idList == modeList) {
        let modeInfo = await postData('/getMode', {});
        let mode = modeInfo.mode;
        // console.log('/getMode: ' + modeInfo.mode);
        devicesStatusList = modeList.map(device => {
            return {
                device: device,
                status: { mode: modeInfo.mode }
            }
        });
        // console.log('mode: ' + modeInfo.mode, devicesStatusList);
    } else {
        devicesStatusList = await postData('/statuses', { idList: idList });

        // Put the open sensors first
        if (devicesStatusList.length > 0) {
            if (devicesStatusList[0].status.contactSensor) {
                devicesStatusList.sort(opensFirst);
            }
        }
    }

    let html = '';
    devicesStatusList.forEach(deviceStatus => {
        // console.log('deviceStatus:', deviceStatus);
        deviceStatus.device.label = encodeLabel(deviceStatus.device.label);
        let newHtml = makeHtml(deviceStatus);
        if (newHtml) html += newHtml;
    });
    rowOfDevices.innerHTML = html;

    button.innerHTML = savedLabel;
    loadingIgnoreButtons = false;
    console.log(`Button click: ${new Date().getTime() - msAtStart} ms`);
}



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
//* comparison function for sorting
//*-----------------------------------------------------------------------------
function opensFirst(a, b) {
    let aSensor = a.status.contactSensor;
    if (!aSensor) return 0;
    let bSensor = b.status.contactSensor;
    if (aSensor == 'open') return bSensor == 'open' ? 0 : -1;
    return bSensor == 'open' ? 0 : 1;
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
